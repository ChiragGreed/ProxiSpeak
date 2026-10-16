import { useState } from 'react';
import OfficeCanvas from './components/officeCanvas.jsx';
import './app.css';

const me = { id: crypto.randomUUID(), name: 'Rahul', color: '#8ec5ff' };

export default function App() {
  const [nearby, setNearby] = useState([]);
  return (
    <div className="app-shell">
      <OfficeCanvas
        serverUrl="http://localhost:3000"
        user={me}
        onNearbyChange={(list) => {
          setNearby(list);
          // NEXT STEP (WebRTC): for each {id, gain} -> peerGainNodes[id].gain.setTargetAtTime(gain, ctx.currentTime, 0.1)
        }}
      />
      <aside className="audio-panel">
        <h3>Audio — {nearby.length} nearby</h3>
        {nearby.map((n) => (
          <div className="audio-panel__user" key={n.id}>
            {n.id.slice(0, 6)} · vol {(n.gain * 100).toFixed(0)}%
            <progress
              className="audio-panel__meter"
              value={n.gain}
              max="1"
              aria-label={`${n.id.slice(0, 6)} audio volume`}
            />
          </div>
        ))}
      </aside>
    </div>
  );
}