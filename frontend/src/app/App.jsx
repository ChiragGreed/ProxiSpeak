import { useEffect, useState } from 'react';
import OfficeCanvas from './components/officeCanvas.jsx';
import './app.css';
import { getMe } from '../Features/Auth/services/authApi.js';
import { getMeetingDetails } from '../Features/Meeting/services/meetingApi.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [meetingUsers, setMeetingUsers] = useState(null);
  const [nearby, setNearby] = useState([]);
  const meetingId = '6ace5736c5f26df0ce9a452b'; // Hardcoded meetingId for testing purposes

  // 1. Get authenticated user
  useEffect(() => {
    getMe()
      .then((res) => {
        setCurrentUser(res.user);
      })
  }, [])

  // 2. Get/join meeting


  // 3. Get initial meeting users + coordinates
  useEffect(() => {
    getMeetingDetails(meetingId)
      .then((res) => {
        setMeetingUsers(res.meeting.users);
      })
  }, [])

  if (!currentUser || !meetingId) {
    return <div>Loading...</div>;
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