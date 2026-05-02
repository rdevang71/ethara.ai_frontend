import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <div className="logo-mark">PF</div>
          <span className="logo-text">ProjectFlow</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join your team's workspace</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
