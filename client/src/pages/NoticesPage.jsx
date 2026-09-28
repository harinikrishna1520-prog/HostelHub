import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { DateText, EmptyState, ErrorMessage, Loading, PageHeading } from '../components/Primitives.jsx';

const categories = ['General', 'Maintenance', 'Mess', 'Event', 'Emergency', 'Other'];
const emptyNotice = { title: '', description: '', category: 'General' };

export default function NoticesPage({ admin = false }) {
  const [notices, setNotices] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyNotice);
  const [editing, setEditing] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() { try { const { data } = await api.get('/notices'); setNotices(data); } catch (requestError) { setError(requestError.response?.data?.message || 'Could not load notices.'); } }
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await api.put(`/notices/${editing}`, form); else await api.post('/notices', form);
      setForm(emptyNotice); setEditing(''); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not save notice.'); }
    finally { setBusy(false); }
  }
  function startEdit(notice) { setEditing(notice._id); setForm({ title: notice.title, description: notice.description, category: notice.category }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function remove(id) {
    if (!window.confirm('Delete this notice?')) return;
    try { await api.delete(`/notices/${id}`); setNotices(notices.filter((notice) => notice._id !== id)); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not delete notice.'); }
  }
  return <><PageHeading eyebrow="HOSTEL BULLETIN" title="Notices" subtitle={admin ? 'Share important updates with hostel residents.' : 'Updates and useful information from your hostel.'} />
    {admin && <form className="notice-editor" onSubmit={submit}><div className="section-head"><div><span className="eyebrow">{editing ? 'EDIT NOTICE' : 'PUBLISH AN UPDATE'}</span><h2>{editing ? 'Update notice' : 'New notice'}</h2></div>{editing && <button type="button" className="button button-quiet" onClick={() => { setEditing(''); setForm(emptyNotice); }}>Cancel edit</button>}</div><ErrorMessage>{error}</ErrorMessage><div className="form-grid"><label>Title<input required maxLength="160" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give your notice a clear title" /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="span-two">Description<textarea required rows="3" maxLength="5000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What should residents know?" /></label></div><div className="form-actions"><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish notice'} <span>→</span></button></div></form>}
    <ErrorMessage>{!admin && error}</ErrorMessage>{!notices ? <Loading label="Loading notices…" /> : notices.length === 0 ? <EmptyState>No notices available.</EmptyState> : <div className="notices-list">{notices.map((notice) => <article className="notice-card" key={notice._id}><div className={`notice-symbol notice-${notice.category.toLowerCase()}`}>{notice.category.slice(0, 1)}</div><div className="notice-body"><div className="notice-meta"><span className="notice-category">{notice.category}</span><span><DateText value={notice.createdAt} /></span></div><h2>{notice.title}</h2><p>{notice.description}</p>{notice.author?.name && <small className="notice-author">Posted by {notice.author.name}</small>}</div>{admin && <div className="notice-actions"><button className="button button-small button-outline" onClick={() => startEdit(notice)}>Edit</button><button className="icon-button" aria-label="Delete notice" onClick={() => remove(notice._id)}>×</button></div>}</article>)}</div>}</>;
}