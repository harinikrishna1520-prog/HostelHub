import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DateText, EmptyState, ErrorMessage, Loading, PageHeading, StatusBadge } from '../components/Primitives.jsx';

const categories = ['Water', 'Electricity', 'Cleaning', 'Bathroom', 'Wi-Fi', 'Furniture', 'Maintenance', 'Other'];
const statuses = ['Pending', 'In Progress', 'Resolved'];

export function ComplaintsPage({ admin = false }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', category: '', hostelBlock: '' });
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  useEffect(() => {
    setItems(null);
    api.get(`/complaints?${query}`).then(({ data }) => setItems(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load complaints.'));
  }, [filters.search, filters.status, filters.category, filters.hostelBlock]);
  useEffect(() => { if (admin) api.get('/students').then(({ data }) => setBlocks([...new Set(data.map((student) => student.hostelBlock).filter(Boolean))])); }, [admin]);
  function update(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }
  async function remove(id) {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try { await api.delete(`/complaints/${id}`); setItems(items.filter((item) => item._id !== id)); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not delete complaint.'); }
  }
  return <><PageHeading eyebrow={admin ? 'SERVICE DESK' : 'YOUR REQUESTS'} title={admin ? 'Complaints' : 'Complaint history'} subtitle={admin ? 'Review, filter and resolve hostel issues.' : 'Keep track of every request you have raised.'} action={!admin && <Link className="button button-dark" to="/student/complaints/new">＋ New complaint</Link>} />
    <div className="filter-bar"><label className="search-field"><span>⌕</span><input name="search" value={filters.search} onChange={update} placeholder="Search complaints" /></label><select aria-label="Filter by status" name="status" value={filters.status} onChange={update}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><select aria-label="Filter by category" name="category" value={filters.category} onChange={update}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>{admin && <select aria-label="Filter by hostel block" name="hostelBlock" value={filters.hostelBlock} onChange={update}><option value="">All blocks</option>{blocks.map((block) => <option key={block}>{block}</option>)}</select>}</div>
    <ErrorMessage>{error}</ErrorMessage>{!items ? <Loading label="Loading complaints…" /> : items.length === 0 ? <EmptyState>No complaints found.</EmptyState> : <div className="complaint-list">{items.map((item) => <article className="complaint-card" key={item._id}><div className="complaint-card-main"><div className="complaint-card-title"><span className="category-icon">{item.category.slice(0, 1)}</span><div><h3>{item.category}</h3><span>{admin ? `${item.student?.name || 'Student'} · ` : ''}Room {item.roomNumber} · Block {item.hostelBlock}</span></div><StatusBadge status={item.status} /></div><p>{item.description}</p><div className="complaint-card-foot"><span>Submitted <DateText value={item.createdAt} /></span><span className="id-fragment">ID {item._id.slice(-7).toUpperCase()}</span><Link to={`${admin ? '/admin' : '/student'}/complaints/${item._id}`} className="button button-small button-outline">View details ↗</Link></div></div>{admin && <button className="icon-button delete-action" aria-label="Delete complaint" title="Delete complaint" onClick={() => remove(item._id)}>×</button>}</article>)}</div>}
  </>;
}

export function NewComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: '', description: '', image: null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    const body = new FormData(); body.append('category', form.category); body.append('description', form.description);
    if (form.image) body.append('image', form.image);
    try { const { data } = await api.post('/complaints', body); navigate(`/student/complaints/${data._id}`); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not submit complaint.'); }
    finally { setBusy(false); }
  }
  return <><PageHeading eyebrow="SERVICE REQUEST" title="New complaint" subtitle="Tell us what needs attention and we’ll take it from here." /><form className="content-form" onSubmit={submit}><ErrorMessage>{error}</ErrorMessage><div className="form-grid"><label>Category<select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Your room<input value={`${user.roomNumber} · Block ${user.hostelBlock}`} disabled /></label><label className="span-two">What’s the issue?<textarea required minLength="8" maxLength="3000" rows="6" placeholder="Describe the issue and where it is happening…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label className="span-two upload-control">Attach an image <span className="optional-label">Optional · JPG, PNG, WebP or GIF · up to 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />{form.image && <small className="file-name">Selected: {form.image.name}</small>}</label></div><div className="form-actions"><Link to="/student/complaints" className="button button-quiet">Cancel</Link><button className="button button-dark" disabled={busy}>{busy ? 'Submitting complaint…' : 'Submit complaint'} <span>→</span></button></div></form></>;
}

export function ComplaintDetailPage({ admin = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [imageSource, setImageSource] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/complaints/${id}`).then(({ data }) => setComplaint(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load complaint.')); }, [id]);
  useEffect(() => {
    if (!complaint?.image) return;
    let objectUrl;
    api.get(`/complaints/${id}/image`, { responseType: 'blob' }).then(({ data }) => {
      objectUrl = URL.createObjectURL(data);
      setImageSource(objectUrl);
    }).catch(() => setError('Could not load the attached image.'));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [complaint?._id, complaint?.image, id]);
  async function updateStatus(status) {
    setBusy(true); setError('');
    try { const { data } = await api.put(`/complaints/${id}/status`, { status }); setComplaint(data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not update status.'); }
    finally { setBusy(false); }
  }
  if (error && !complaint) return <><PageHeading eyebrow="COMPLAINT DETAILS" title="Request unavailable" /><ErrorMessage>{error}</ErrorMessage></>;
  if (!complaint) return <Loading label="Loading complaint…" />;
  const active = statuses.indexOf(complaint.status);
  return <><PageHeading eyebrow={`REQUEST · ${complaint._id.slice(-7).toUpperCase()}`} title={complaint.category} subtitle={`${admin ? `${complaint.student?.name || 'Student'} · ` : ''}Room ${complaint.roomNumber} · Block ${complaint.hostelBlock}`} action={<StatusBadge status={complaint.status} />} />
    <ErrorMessage>{error}</ErrorMessage><div className="detail-layout"><section className="section-panel detail-panel"><div className="detail-topline"><span className="eyebrow">ISSUE DETAILS</span><span className="id-fragment">#{complaint._id}</span></div><h2>{complaint.category}</h2><p className="detail-description">{complaint.description}</p>{complaint.image && imageSource && <a className="complaint-image-link" href={imageSource} target="_blank" rel="noreferrer"><img src={imageSource} alt="Image attached to complaint" /><span>Open full image ↗</span></a>}{complaint.image && !imageSource && <Loading label="Loading attachment…" />}<div className="detail-meta"><div><small>SUBMITTED</small><strong><DateText value={complaint.createdAt} /></strong></div><div><small>LAST UPDATED</small><strong><DateText value={complaint.updatedAt} /></strong></div><div><small>ROOM</small><strong>{complaint.roomNumber} · {complaint.hostelBlock}</strong></div></div></section>
      <aside className="section-panel timeline-panel"><span className="eyebrow">REQUEST PROGRESS</span><h2>Current status</h2><div className="timeline">{statuses.map((status, index) => <div className={`timeline-step ${index <= active ? 'reached' : ''} ${index === active ? 'current' : ''}`} key={status}><span className="timeline-node">{index < active ? '✓' : index + 1}</span><div><strong>{index === 0 ? 'Complaint submitted' : status}</strong><small>{index === active ? 'Current status' : index < active ? 'Completed' : 'Coming up'}</small></div></div>)}</div>{admin && <div className="status-actions"><small>CHANGE STATUS</small>{statuses.map((status, index) => <button key={status} disabled={busy || index === active} className={`button ${index === active ? 'button-disabled' : index > active ? 'button-dark' : 'button-outline'}`} onClick={() => updateStatus(status)}>{busy && index !== active ? 'Updating…' : status}</button>)}</div>}</aside></div>
  </>;
}