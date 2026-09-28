import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  const handleDemoFill = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@hostelhub.com');
      setPassword('admin123');
    } else {
      setEmail('student@hostelhub.com');
      setPassword('student123');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Building size={32} />
          </div>
          <h1 className="auth-title">HostelHub</h1>
          <p className="auth-subtitle">Smart Hostel Management System</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-group">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. your.email@college.edu"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-group">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">Quick Demo Logins (Seed Accounts):</p>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="btn btn-demo"
            >
              <ShieldCheck size={14} />
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="btn btn-demo"
            >
              <User size={14} />
              Fill Student
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Are you a new resident student?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
