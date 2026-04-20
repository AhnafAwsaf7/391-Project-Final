import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function PosterProfile() {
  const { user, profile: ctxProfile, refreshProfile } = useAuth();
  const [form, setForm]   = useState({ name:'', companyName:'', companyDescription:'', companyWebsite:'', industry:'', companySize:'1-10', location:'' });
  const [msg, setMsg]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (ctxProfile) {
      setForm({
        name: user?.name || '',
        companyName: ctxProfile.companyName || '',
        companyDescription: ctxProfile.companyDescription || '',
        companyWebsite: ctxProfile.companyWebsite || '',
        industry: ctxProfile.industry || '',
        companySize: ctxProfile.companySize || '1-10',
        location: ctxProfile.location || '',
      });
    }
    if (user?._id) api.get(`/reviews/user/${user._id}`).then(({ data }) => setReviews(data.reviews));
  }, [ctxProfile, user]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(''); setError(''); setLoading(true);
    try {
      await api.put('/users/jobposter/profile', form);
      await refreshProfile();
      setMsg('Profile updated successfully!');
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const stars = r => '★'.repeat(r) + '☆'.repeat(5-r);
  const initials = n => n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Company Profile</h1>
          <p>How job seekers see your company</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'1.5rem', alignItems:'start' }}>
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              {msg   && <div className="alert alert-success">{msg}</div>}
              {error && <div className="alert alert-error">{error}</div>}
              <h3 className="section-title">Edit Profile</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Your Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="form-group"><label>Company Name</label>
                  <input value={form.companyName} onChange={e=>setForm(f=>({...f,companyName:e.target.value}))} placeholder="Acme Corp" />
                </div>
                <div className="form-group"><label>About the Company</label>
                  <textarea value={form.companyDescription} onChange={e=>setForm(f=>({...f,companyDescription:e.target.value}))} rows={4} />
                </div>
                <div className="form-group"><label>Website</label>
                  <input value={form.companyWebsite} onChange={e=>setForm(f=>({...f,companyWebsite:e.target.value}))} placeholder="https://..." />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                  <div className="form-group"><label>Industry</label>
                    <input value={form.industry} onChange={e=>setForm(f=>({...f,industry:e.target.value}))} placeholder="SaaS" />
                  </div>
                  <div className="form-group"><label>Company Size</label>
                    <select value={form.companySize} onChange={e=>setForm(f=>({...f,companySize:e.target.value}))}>
                      {['1-10','11-50','51-200','201-500','500+'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Location</label>
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Remote / New York" />
                </div>
                <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Profile'}</button>
              </form>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <h3 className="section-title">Public Profile Preview</h3>
              <div className="profile-header" style={{ marginBottom:'1rem' }}>
                <div className="avatar" style={{ width:64, height:64, fontSize:'1.6rem' }}>{initials(form.name)}</div>
                <div>
                  <div className="profile-name">{form.companyName || form.name}</div>
                  <div className="profile-meta">{form.industry} · {form.companySize} employees · {form.location}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginTop:'.3rem' }}>
                    <span className="stars">{stars(Math.round(ctxProfile?.averageRating||0))}</span>
                    <span style={{ color:'var(--text2)', fontSize:'.82rem' }}>{ctxProfile?.averageRating?.toFixed(1)||'—'} ({ctxProfile?.totalReviews||0} reviews)</span>
                  </div>
                </div>
              </div>
              {form.companyDescription && <p style={{ color:'var(--text2)', fontSize:'.9rem' }}>{form.companyDescription}</p>}
            </div>

            <div className="card">
              <h3 className="section-title">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? <p style={{ color:'var(--text2)', fontSize:'.9rem' }}>No reviews yet</p> : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ paddingBottom:'.75rem', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.3rem' }}>
                        <span style={{ fontWeight:600, fontSize:'.88rem' }}>{r.reviewer?.name}</span>
                        <span className="stars" style={{ fontSize:'.8rem' }}>{stars(r.rating)}</span>
                      </div>
                      <p style={{ color:'var(--text2)', fontSize:'.85rem' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
