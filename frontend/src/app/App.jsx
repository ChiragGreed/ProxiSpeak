import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OfficeCanvas from './components/officeCanvas.jsx';
import './app.css';
import useMeeting from '../Features/Meeting/hooks/useMeeting.js';

export default function App() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const requestedMeetingId = '6ade663f164d36dfb310b741'; // Hardcoded meetingId for testing purposes
  const [nearby, setNearby] = useState([]);
  const { meetingId, meetingUsers, meetingerror, getMeetingDetailHandler } = useMeeting();

  useEffect(() => {
    getMeetingDetailHandler(requestedMeetingId);
  }, [getMeetingDetailHandler, requestedMeetingId]);

  
  if(meetingerror){
    return <div>{meetingerror}</div>
  }
  if (!currentUser || !meetingId) {
    return <div className='Loader'>Loading...</div>;
  }

  return (
    <div className="app-shell">
      <OfficeCanvas
        serverUrl="http://localhost:3000"
        user={currentUser}
        meetingId={meetingId}
        meetingUsers={meetingUsers}
        onNearbyChange={(list) => {
          setNearby(list);
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
            />
          </div>
        ))}
      </aside>
    </div>
  );
}