import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'jobseeker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'jobposter') navigate('/poster/dashboard');
      else navigate('/seeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box card fade-up">
        <div className="auth-logo">Work<span>Bridge</span></div>
        <h2 style={{ textAlign:'center', marginBottom:'1.5rem', fontSize:'1.2rem', fontWeight:600 }}>Create your account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div className="form-group">
            <label>I want to…</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginTop:'.25rem' }}>
              {[
                { val:'jobseeker', label:'🎯 Find Work',  desc:'Browse & apply to jobs' },
                { val:'jobposter', label:'📋 Hire Talent', desc:'Post jobs & find talent' },
              ].map(opt => (
                <div
                  key={opt.val}
                  onClick={() => setForm(f => ({ ...f, role: opt.val }))}
                  style={{
                    padding:'.75rem', border:`2px solid ${form.role===opt.val ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-sm)', cursor:'pointer', textAlign:'center',
                    background: form.role===opt.val ? 'var(--accent)11' : 'var(--bg3)',
                    transition:'all var(--transition)',
                  }}
                >
                  <div style={{ fontWeight:700, fontSize:'.9rem' }}>{opt.label}</div>
                  <div style={{ color:'var(--text2)', fontSize:'.78rem', marginTop:'.2rem' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'.5rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.25rem', color:'var(--text2)', fontSize:'.88rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
