import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'jobposter')   navigate('/poster/dashboard');
      else if (user.role === 'jobseeker')   navigate('/seeker/dashboard');
      else if (user.role === 'systemadmin') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (email, pwd) => { setForm({ email, password: pwd }); };

  return (
    <div className="auth-page">
      <div className="auth-box card fade-up">
        <div className="auth-logo">Work<span>Bridge</span></div>
        <h2 style={{ textAlign:'center', marginBottom:'1.5rem', fontSize:'1.2rem', fontWeight:600 }}>Welcome back</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'.5rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--text2)', fontSize:'.88rem' }}>
          No account? <Link to="/register">Create one</Link>
        </p>

        <div style={{ marginTop:'1.5rem', padding:'1rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', fontSize:'.78rem', color:'var(--text2)' }}>
          <div style={{ fontWeight:600, marginBottom:'.5rem', color:'var(--text)' }}>🔑 Demo credentials</div>
          {[
            ['Admin',   'admin@jobmarket.dev',    'Admin@1234'],
            ['Poster',  'technova@jobmarket.dev', 'Poster@1234'],
            ['Seeker',  'alice@jobmarket.dev',    'Seeker@1234'],
          ].map(([role, email, pwd]) => (
            <div key={role} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem' }}>
              <span><strong>{role}:</strong> {email}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => quickLogin(email, pwd)}>Use</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
