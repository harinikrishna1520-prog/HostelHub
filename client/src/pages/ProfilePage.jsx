import { useAuth } from '../context/AuthContext.jsx';
import { DateText, PageHeading } from '../components/Primitives.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  return <><PageHeading eyebrow="YOUR ACCOUNT" title="Profile" subtitle="Your HostelHub account information." /><section className="section-panel profile-panel"><div className="profile-identity"><span className="avatar avatar-large">{user.name.slice(0, 1)}</span><div><h2>{user.name}</h2><span className="role-pill">{user.role === 'admin' ? 'Hostel administrator' : 'Student resident'}</span></div></div><div className="profile-facts">{[['Email address', user.email], ['Phone number', user.phone], ['Room number', user.role === 'student' ? user.roomNumber || 'Not assigned' : 'Administrator'], ['Hostel block', user.role === 'student' ? user.hostelBlock || 'Not assigned' : '—'], ['Member since', <DateText value={user.createdAt} />]].map(([label, value]) => <div className="fact-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section></>;
}