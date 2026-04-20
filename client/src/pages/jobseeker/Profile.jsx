import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function SeekerProfile() {
  const { user, profile: ctxProfile, refreshProfile } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    name:'', bio:'', headline:'', location:'', hourlyRate:'',
    availability:'available', skills:[],
  });

  useEffect(() => {
    api.get('/skills').then(({ data }) => setAllSkills(data.skills));
    if (user?._id) api.get(`/reviews/user/${user._id}`).then(({ data }) => setReviews(data.reviews));
  }, [user]);

  useEffect(() => {
    if (ctxProfile) {
      setForm({
        name: user?.name || '',
        bio: ctxProfile.bio || '',
        headline: ctxProfile.headline || '',
        location: ctxProfile.location || '',
        hourlyRate: ctxProfile.hourlyRate || '',
        availability: ctxProfile.availability || 'available',
        skills: ctxProfile.skills?.map(s => s._id || s) || [],
      });
    }
  }, [ctxProfile, user]);

  const toggleSkill = id => setForm(f => ({
    ...f, skills: f.skills.includes(id) ? f.skills.filter(s=>s!==id) : [...f.skills, id],
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(''); setError(''); setLoading(true);
    try {
      await api.put('/users/jobseeker/profile', form);
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
          <h1>My Profile</h1>
          <p>Keep your profile updated to get better job matches</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,3fr) minmax(280px,2fr)', gap:'1.5rem', alignItems:'start' }}>
          {/* Edit form */}
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <h3 className="section-title">Basic Info</h3>
              {msg   && <div className="alert alert-success">{msg}</div>}
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Full Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="form-group"><label>Headline</label>
                  <input value={form.headline} onChange={e=>setForm(f=>({...f,headline:e.target.value}))} placeholder="e.g. Full-Stack Developer | React · Node.js" />
                </div>
                <div className="form-group"><label>Bio</label>
                  <textarea rows={4} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell clients about yourself, your experience, and what you do best…" />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'.75rem' }}>
                  <div className="form-group"><label>Location</label>
                    <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="City or Remote" />
                  </div>
                  <div className="form-group"><label>Hourly Rate ($)</label>
                    <input type="number" value={form.hourlyRate} onChange={e=>setForm(f=>({...f,hourlyRate:e.target.value}))} placeholder="50" min="0" />
                  </div>
                  <div className="form-group"><label>Availability</label>
                    <select value={form.availability} onChange={e=>setForm(f=>({...f,availability:e.target.value}))}>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <h3 className="section-title" style={{ marginTop:'1rem' }}>Skills</h3>
                <p style={{ color:'var(--text2)', fontSize:'.84rem', marginBottom:'.75rem' }}>Selected: {form.skills.length}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.45rem', marginBottom:'1rem' }}>
                  {allSkills.map(s => (
                    <button key={s._id} type="button" onClick={() => toggleSkill(s._id)}
                      style={{
                        padding:'.28rem .75rem', borderRadius:'99px', cursor:'pointer',
                        border:`1px solid ${form.skills.includes(s._id) ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.skills.includes(s._id) ? 'var(--accent)' : 'var(--bg3)',
                        color: form.skills.includes(s._id) ? '#fff' : 'var(--text2)',
                        fontSize:'.8rem', fontWeight:600, transition:'all var(--transition)',
                        textTransform:'capitalize', fontFamily:'var(--font-body)',
                      }}
                    >{s.name}</button>
                  ))}
                </div>

                <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Profile'}</button>
              </form>
            </div>
          </div>

          {/* Preview + Reviews */}
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <h3 className="section-title">Profile Preview</h3>
              <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div className="avatar" style={{ width:64, height:64, fontSize:'1.6rem', flexShrink:0 }}>{initials(form.name)}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{form.name || 'Your Name'}</div>
                  <div style={{ color:'var(--text2)', fontSize:'.85rem', margin:'.2rem 0' }}>{form.headline || 'Your headline'}</div>
                  <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center' }}>
                    {form.location && <span style={{ color:'var(--text2)', fontSize:'.8rem' }}>📍 {form.location}</span>}
                    {form.hourlyRate && <span style={{ color:'var(--accent)', fontSize:'.8rem', fontWeight:700 }}>${form.hourlyRate}/hr</span>}
                    <span style={{ fontSize:'.78rem', padding:'.15rem .55rem', borderRadius:'99px', background: form.availability==='available' ? '#43e97b22' : '#ff4d6d22', color: form.availability==='available' ? 'var(--accent3)' : '#ff4d6d', fontWeight:600, textTransform:'capitalize' }}>{form.availability}</span>
                  </div>
                </div>
              </div>
              {form.bio && <p style={{ color:'var(--text2)', fontSize:'.88rem', marginBottom:'1rem' }}>{form.bio}</p>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                {form.skills.map(sid => {
                  const skill = allSkills.find(s => s._id === sid);
                  return skill ? <span key={sid} className="skill-tag">{skill.name}</span> : null;
                })}
              </div>
              <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                <span className="stars" style={{ fontSize:'.88rem' }}>{('★'.repeat(Math.round(ctxProfile?.averageRating||0)) + '☆'.repeat(5-Math.round(ctxProfile?.averageRating||0)))}</span>
                <span style={{ color:'var(--text2)', fontSize:'.82rem' }}>{ctxProfile?.averageRating?.toFixed(1)||'—'} ({ctxProfile?.totalReviews||0} reviews)</span>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p style={{ color:'var(--text2)', fontSize:'.88rem' }}>Complete jobs to earn reviews</p>
              ) : (
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
