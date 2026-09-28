import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { EmptyState, Loading, PageHeading, StatusBadge } from '../components/Primitives.jsx';

export default function RoomPage() {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/complaints/room/me').then(({ data }) => setRoom(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load room details.')); }, []);
  if (error) return <><PageHeading eyebrow="YOUR SPACE" title="Room details" /><div className="empty-panel">{error}</div></>;
  if (!room) return <Loading label="Loading room details…" />;
  const occupants = room.occupants || [];
  return <><PageHeading eyebrow={`BLOCK ${room.hostelBlock.toUpperCase()}`} title={`Room ${room.roomNumber}`} subtitle="Your room, and the people who share it." action={<StatusBadge status={room.status} />} /><div className="room-detail-layout"><section className="room-feature"><div className="room-feature-art"><span className="room-art-number">{room.roomNumber}</span><div className="room-outline"><span /><span /><span /></div><div className="room-art-caption">BLOCK {room.hostelBlock.toUpperCase()} <span>·</span> FLOOR {room.floor}</div></div><div className="occupant-section"><div className="section-head"><div><span className="eyebrow">THE ROOMMATES</span><h2>Occupants <span className="count-pill">{occupants.length}</span></h2></div><span className="capacity-note">CAPACITY {room.capacity}</span></div>{occupants.length ? occupants.map((occupant) => <div className="occupant-row" key={occupant._id}><span className="avatar occupant-avatar">{occupant.name?.slice(0, 1)}</span><strong>{occupant.name}</strong><span>{occupant.email === undefined ? '' : 'Resident'}</span></div>) : <EmptyState>No occupants listed yet.</EmptyState>}</div></section><section className="room-facts"><div className="eyebrow">ROOM INFORMATION</div>{[['Room number', room.roomNumber], ['Hostel block', room.hostelBlock], ['Room type', room.roomType], ['Floor', room.floor], ['Room capacity', `${room.capacity} ${room.capacity === 1 ? 'person' : 'people'}`], ['Current occupants', occupants.length]].map(([label, value]) => <div className="fact-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section></div></>;
}