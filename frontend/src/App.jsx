import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { getMeetingUsers } from './Features/Meeting/services/meetingApi';
import { getMe } from './Features/Auth/services/authApi';

const App = () => {
  const socketRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;


    const handleServerCords = (cords) => {
      if (
        !cords ||
        typeof cords.userId !== 'string' ||
        typeof cords.X !== 'number' ||
        typeof cords.Y !== 'number'
      ) {
        return;
      }

      setPositions((currentPositions) => ({
        ...currentPositions,
        [cords.userId]: { x: cords.X, y: cords.Y },
      }));
    };

    socket.on('serverCords', handleServerCords);

    return () => {
      socket.off('serverCords', handleServerCords);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    getMe()
      .then((res) => {
        setCurrentUser(res.user);
      })
  }, [])

  useEffect(() => {
    getMeetingUsers('6ace5736c5f26df0ce9a452b')
      .then((res) => {
        setUsers(res.users);
      })
  }, [])


  const position = useRef({ x: 0, y: 0 });
  const keysPressed = useRef({});

  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(key)) {
        keysPressed.current[key] = true;
        event.preventDefault(); // Stop page scrolling
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in keysPressed.current) {
        keysPressed.current[key] = false;
      }
    };

    let animationFrameId;
    const gameLoop = () => {
      let dx = 0;
      let dy = 0;
      const speed = 5; // Pixels per frame

      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) dx -= speed;
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) dx += speed;
      if (keysPressed.current['arrowup'] || keysPressed.current['w']) dy -= speed;
      if (keysPressed.current['arrowdown'] || keysPressed.current['s']) dy += speed;


      if (dx !== 0 || dy !== 0) {
        position.current.x += dx;
        position.current.y += dy;

        socketRef.current?.emit('cords', { userId: currentUser._id, X: position.current.x, Y: position.current.y });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentUser]);

  return (
    <div className='Canvas' style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#222' }}>
      <div>
        {users.map(user => {
          return <div
            className='Users'
            id={user._id}
            key={user._id}
            style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
              transform: `translate3d(${positions[user._id]?.x ?? 0}px, ${positions[user._id]?.y ?? 0}px, 0)`,
              willChange: 'transform',
            }}
          >
            <img src={user.avtar} alt="Formula 1 Car" />
            <h1>{user.fullName}</h1>
          </div>
        })}
      </div>
    </div>
  );
};

export default App;
