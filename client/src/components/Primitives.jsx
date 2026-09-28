import { Link } from 'react-router-dom';

export function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${String(status).toLowerCase().replaceAll(' ', '-')}`}>{status}</span>;
}

export function Loading({ label = 'Loading…' }) { return <div className="loading"><span className="spinner" />{label}</div>; }
export function ErrorMessage({ children }) { return children ? <div className="error-banner" role="alert">{children}</div> : null; }
export function EmptyState({ children = 'Nothing to show yet.' }) { return <div className="empty-state"><span className="empty-mark">—</span><p>{children}</p></div>; }
export function DateText({ value }) { return <>{value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</>; }
export function ComplaintLink({ complaint }) { return <Link className="link-arrow" to={`/student/complaints/${complaint._id}`}>View <span aria-hidden="true">↗</span></Link>; }