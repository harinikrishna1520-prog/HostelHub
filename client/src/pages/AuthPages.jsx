import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage } from '../components/Primitives.jsx';

function AuthFrame({ eyebrow, title, description, children }) {
  return <main className="auth-screen"><section className="auth-aside"><Link className="brand auth-brand" to="/login"><span className="brand-mark">H</span><span>hostel<span className="brand-light">hub</span><small>SMART HOSTEL LIVING</small></span></Link><div className="auth-quote"><span className="quote-mark">“</span><p>Good living<br />starts with<br /><em>good spaces.</em></p><div className="quote-line" /><small>HOSTEL LIFE, WELL MANAGED.</small></div><div className="auth-aside-foot">A better way to feel at home.</div></section><section className="auth-main"><div className="auth-form-wrap"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="auth-description">{description}</p>{children}</div><div className="auth-foot">HOSTELHUB <span>·</span> CONNECTED LIVING</div></section></main>;
}

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const signedIn = await signIn(form); navigate(signedIn.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not sign in. Check your connection and try again.'); }
    finally { setBusy(false); }
  }
  return <AuthFrame eyebrow="WELCOME BACK" title="Sign in" description="Your hostel, a little more in order."><form className="auth-form" onSubmit={submit}><ErrorMessage>{error}</ErrorMessage><label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></label><button className="button button-dark button-wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>→</span></button></form><p className="auth-switch">New to HostelHub? <Link to="/register">Create a student account</Link></p><p className="auth-hint">Administrator? Sign in with the account created by your hostel team.</p></AuthFrame>;
}

export function RegisterPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', roomNumber: '', hostelBlock: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    try { await signUp({ name: form.name, email: form.email, phone: form.phone, password: form.password, roomNumber: form.roomNumber, hostelBlock: form.hostelBlock }); navigate('/student/dashboard'); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not create your account. Please try again.'); }
    finally { setBusy(false); }
  }
  return <AuthFrame eyebrow="GET SETTLED" title="Create your account" description="A few details, then you’re home."><form className="auth-form register-form" onSubmit={submit}><ErrorMessage>{error}</ErrorMessage><div className="form-grid"><label className="span-two">Full name<input name="name" required maxLength="100" autoComplete="name" value={form.name} onChange={update} placeholder="Your name" /></label><label>Email address<input name="email" type="email" required autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update} placeholder="Phone number" /></label><label>Password<input name="password" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={update} placeholder="At least 8 characters" /></label><label>Confirm password<input name="confirmPassword" type="password" required minLength="8" autoComplete="new-password" value={form.confirmPassword} onChange={update} placeholder="Repeat password" /></label><label>Room number<input name="roomNumber" required value={form.roomNumber} onChange={update} placeholder="e.g. 204" /></label><label>Hostel block<input name="hostelBlock" required value={form.hostelBlock} onChange={update} placeholder="e.g. North" /></label></div><button className="button button-dark button-wide" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>→</span></button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></AuthFrame>;
}