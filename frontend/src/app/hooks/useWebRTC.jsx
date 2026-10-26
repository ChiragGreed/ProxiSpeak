import { useCallback, useEffect, useRef, useState } from 'react';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };


export function useWebRTC(socket, userId, nearbyIdsRef) {
  const peerConnections = useRef(new Map());
  const streamRef = useRef(null);
  const readyPeersRef = useRef(new Set());
  const audioElements = useRef(new Map());
  const pendingCandidates = useRef(new Map());

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState([]);

  const closePeer = useCallback((id) => {
    peerConnections.current.get(id)?.close();
    peerConnections.current.delete(id);
    pendingCandidates.current.delete(id);

    const audio = audioElements.current.get(id);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    }
    audioElements.current.delete(id);

    setConnectedPeers((ids) => ids.filter((x) => x !== id));
  }, []);

  const createPeer = useCallback((id) => {
    if (peerConnections.current.has(id)) {
      return peerConnections.current.get(id);
    }
    if (!streamRef.current) throw new Error('Microphone not enabled');

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current.set(id, pc);

    streamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current);
    });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit('webrtc:ice-candidate', {
          targetUserId: id,
          candidate: candidate.toJSON()
        });
      }
    };

    pc.ontrack = ({ streams, track }) => {
      let audio = audioElements.current.get(id);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        document.body.appendChild(audio);
        audioElements.current.set(id, audio);
      }

      audio.srcObject = streams[0] || new MediaStream([track]);
      audio.play().catch((err) => console.warn('Remote audio playback blocked:', err));
    };

    pc.onconnectionstatechange = () => {
      console.log('WebRTC', id, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectedPeers((ids) => ids.includes(id) ? ids : [...ids, id]);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        closePeer(id);
      }
    };

    return pc;
  }, [socket, closePeer]);

  const flushCandidates = useCallback(async (id, pc) => {
    const queue = pendingCandidates.current.get(id) || [];
    pendingCandidates.current.delete(id);

    for (const candidate of queue) {
      await pc.addIceCandidate(candidate);
    }
  }, []);

  const makeOffer = useCallback(async (id) => {
    if (!socket?.connected || !streamRef.current || !id || id === userId || peerConnections.current.has(id)) {
      return;
    }

    const pc = createPeer(id);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('webrtc:offer', { targetUserId: id, offer: pc.localDescription });
  }, [socket, userId, createPeer]);

  const syncWebRTCPeers = useCallback(async (nearbyIds) => {
    if (!socket?.connected) return;

    for (const id of [...peerConnections.current.keys()]) {
      if (!nearbyIds.has(id)) {
        closePeer(id);
      }
    }

    if (!streamRef.current) return;

    for (const id of nearbyIds) {
      if (id === userId) continue;
      if (!readyPeersRef.current.has(id)) continue;
      if (peerConnections.current.has(id)) continue;

      // Only one user initiates the offer
      if (String(userId) > String(id)) continue;

      try {
        await makeOffer(id);
      } catch (error) {
        console.error('Proximity connection failed:', error);
      }
    }
  }, [socket, userId, closePeer, makeOffer]);


  const enableAudio = useCallback(async () => {
    if (streamRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    streamRef.current = stream;
    setAudioEnabled(true);

    if (socket?.connected) {
      socket.emit('webrtc:ready');
    }

    // Check users who were already nearby
    syncWebRTCPeers(nearbyIdsRef.current);

  }, [socket, syncWebRTCPeers, nearbyIdsRef]);

  const disableAudio = useCallback(() => {
    socket?.emit('webrtc:not-ready');

    for (const id of [...peerConnections.current.keys()]) {
      closePeer(id);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setAudioEnabled(false);
  }, [socket, closePeer]);

  useEffect(() => {
    if (!socket || !userId) return;

    const onConnect = () => {
      if (streamRef.current) socket.emit('webrtc:ready');
    };

    const onReadyUsers = (ids) => {
      readyPeersRef.current = new Set(ids);

      syncWebRTCPeers(nearbyIdsRef.current);
    };

    const onUserReady = ({ userId: id }) => {
      readyPeersRef.current.add(id);

      syncWebRTCPeers(nearbyIdsRef.current);
    };

    const onOffer = async ({ fromUserId, offer }) => {
      if (!streamRef.current) return;
      if (!nearbyIdsRef.current.has(fromUserId)) return;

      try {
        const pc = createPeer(fromUserId);
        await pc.setRemoteDescription(offer);
        await flushCandidates(fromUserId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc:answer', { targetUserId: fromUserId, answer: pc.localDescription });
      } catch (e) {
        console.error('Offer handling failed', e);
      }
    };

    const onAnswer = async ({ fromUserId, answer }) => {
      try {
        const pc = peerConnections.current.get(fromUserId);
        if (!pc) return;

        await pc.setRemoteDescription(answer);
        await flushCandidates(fromUserId, pc);
      } catch (e) {
        console.error('Answer handling failed', e);
      }
    };

    const onCandidate = async ({ fromUserId, candidate }) => {
      try {
        const pc = peerConnections.current.get(fromUserId);
        if (!pc?.remoteDescription) {
          const queue = pendingCandidates.current.get(fromUserId) || [];
          queue.push(candidate);
          pendingCandidates.current.set(fromUserId, queue);
        } else {
          await pc.addIceCandidate(candidate);
        }
      } catch (e) {
        console.error('ICE handling failed', e);
      }
    };

    const onNotReady = ({ userId: id }) => {
      readyPeersRef.current.delete(id);
      closePeer(id);
    };

    const onLeave = (id) => {
      readyPeersRef.current.delete(id);
      closePeer(id);
    };

    socket.on('connect', onConnect);
    socket.on('webrtc:ready-users', onReadyUsers);
    socket.on('webrtc:user-ready', onUserReady);
    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice-candidate', onCandidate);
    socket.on('webrtc:user-not-ready', onNotReady);
    socket.on('presence:leave', onLeave);

    if (socket.connected && streamRef.current) {
      socket.emit('webrtc:ready');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('webrtc:ready-users', onReadyUsers);
      socket.off('webrtc:user-ready', onUserReady);
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice-candidate', onCandidate);
      socket.off('webrtc:user-not-ready', onNotReady);
      socket.off('presence:leave', onLeave);
    };
  }, [socket, userId, makeOffer, createPeer, flushCandidates, closePeer, syncWebRTCPeers, nearbyIdsRef]);

  useEffect(() => () => {
    for (const pc of peerConnections.current.values()) {
      pc.close();
    }
    for (const audio of audioElements.current.values()) {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return { enableAudio, disableAudio, audioEnabled, connectedPeers, peerConnections, syncWebRTCPeers };
}