import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function SeekerHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');
  const [working, setWorking] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/admin/users/${id}/history`);
      setData(res);
    } catch { navigate('/admin/users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleFlag = async () => {
    setWorking(true);
    try {
      await api.put(`/admin/users/${id}/flag`, { reason: flagReason });
      flash('User flagged successfully');
      setShowFlagInput(false);
      setFlagReason('');
      load();
    } finally { setWorking(false); }
  };

  const handleUnflag = async () => {
    setWorking(true);
    try {
      await api.put(`/admin/users/${id}/unflag`);
      flash('User unflagged successfully');
      load();
    } finally { setWorking(false); }
  };

  const handleBlock = async () => {
    setWorking(true);
    try {
      const action = data.user.isBlocked ? 'unblock' : 'block';
      await api.put(`/admin/users/${id}/${action}`);
      flash(`User ${action}ed`);
      load();
    } finally { setWorking(false); }
  };

  const stars = r => '★'.repeat(r) + '☆'.repeat(5 - r);
  const initials = n => n?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content"><div className="spinner-wrap"><div className="spinner" /></div></main>
    </div>
  );

  const { user, profile, applications, reviewsWritten } = data;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <Link to="/admin/reviews" style={{ color:'var(--text2)', fontSize:'.85rem', display:'inline-block', marginBottom:'1rem' }}>← Back to Reviews</Link>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* ── Profile Header ── */}
        <div className="card" style={{ marginBottom:'1.5rem', background:'linear-gradient(135deg, var(--accent)11, var(--accent2)08)' }}>
          <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>
            <div className="avatar" style={{ width:72, height:72, fontSize:'1.8rem', flexShrink:0 }}>
              {initials(user.name)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom:'.4rem' }}>
                <h1 style={{ fontSize:'1.4rem' }}>{user.name}</h1>
                {user.isFlagged && (
                  <span style={{ background:'#ff4d6d22', color:'#ff4d6d', border:'1px solid #ff4d6d44', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                    🚩 FLAGGED
                  </span>
                )}
                {user.isBlocked && (
                  <span style={{ background:'#ffd16622', color:'#ffd166', border:'1px solid #ffd16644', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                    🔒 BLOCKED
                  </span>
                )}
              </div>
              <div style={{ color:'var(--text2)', fontSize:'.88rem', marginBottom:'.5rem' }}>{user.email}</div>
              {user.isFlagged && user.flagReason && (
                <div style={{ padding:'.5rem .75rem', background:'#ff4d6d11', border:'1px solid #ff4d6d33', borderRadius:'var(--radius-sm)', fontSize:'.83rem', color:'#ff4d6d', marginBottom:'.5rem' }}>
                  <strong>Flag reason:</strong> {user.flagReason}
                </div>
              )}
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.75rem' }}>
                {user.isFlagged ? (
                  <button className="btn btn-success btn-sm" disabled={working} onClick={handleUnflag}>✅ Remove Flag</button>
                ) : (
                  <button className="btn btn-danger btn-sm" disabled={working} onClick={() => setShowFlagInput(!showFlagInput)}>🚩 Flag User</button>
                )}
                <button
                  className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-secondary'}`}
                  disabled={working}
                  onClick={handleBlock}
                >{user.isBlocked ? '🔓 Unblock' : '🔒 Block'}</button>
                <Link to="/admin/users" className="btn btn-secondary btn-sm">← All Users</Link>
              </div>

              {showFlagInput && (
                <div style={{ marginTop:'.75rem', display:'flex', gap:'.5rem', alignItems:'center', flexWrap:'wrap' }}>
                  <input
                    value={flagReason}
                    onChange={e => setFlagReason(e.target.value)}
                    placeholder="Reason for flagging (optional)"
                    style={{ flex:1, minWidth:200 }}
                  />
                  <button className="btn btn-danger btn-sm" disabled={working} onClick={handleFlag}>Confirm Flag</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowFlagInput(false)}>Cancel</button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'1rem', flexShrink:0, flexWrap:'wrap' }}>
              {[
                { label:'Applications',   value: applications.length },
                { label:'Reviews Given',  value: reviewsWritten.length },
                { label:'Avg Rating',     value: profile?.averageRating?.toFixed(1) || '—' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign:'center', padding:'.75rem 1rem', minWidth:90 }}>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, fontFamily:'var(--font-head)', color:'var(--accent)' }}>{s.value}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text2)', marginTop:'.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs — Reviews Received removed ── */}
        <div className="tabs" style={{ marginBottom:'1.5rem' }}>
          {[
            { key:'overview',     label:'Profile Overview' },
            { key:'reviews',      label:`Reviews Given (${reviewsWritten.length})` },
            { key:'applications', label:`Applications (${applications.length})` },
          ].map(t => (
            <button key={t.key} className={`tab ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Profile Overview ── */}
        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'1.25rem' }}>
            <div className="card">
              <h3 className="section-title">Personal Info</h3>
              {[
                { label:'Headline',     value: profile?.headline || '—' },
                { label:'Location',     value: profile?.location || '—' },
                { label:'Hourly Rate',  value: profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : '—' },
                { label:'Availability', value: profile?.availability || '—' },
                { label:'Member Since', value: new Date(user.createdAt).toLocaleDateString() },
                { label:'Verified',     value: user.isVerified ? '✅ Yes' : '❌ No' },
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'.88rem' }}>
                  <span style={{ color:'var(--text2)' }}>{f.label}</span>
                  <span style={{ fontWeight:600, textTransform:'capitalize' }}>{f.value}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="section-title">Skills</h3>
              {profile?.skills?.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                  {profile.skills.map(s => <span key={s._id} className="skill-tag">{s.name}</span>)}
                </div>
              ) : <p style={{ color:'var(--text2)', fontSize:'.88rem' }}>No skills added</p>}
              {profile?.bio && (
                <>
                  <h3 className="section-title" style={{ marginTop:'1.25rem' }}>Bio</h3>
                  <p style={{ color:'var(--text2)', fontSize:'.88rem', lineHeight:1.6 }}>{profile.bio}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Reviews Written ── */}
        {activeTab === 'reviews' && (
          <div>
            {reviewsWritten.length === 0 ? (
              <div className="card empty-state"><h3>No reviews written yet</h3></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {reviewsWritten.map(r => (
                  <div className="card" key={r._id}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'.92rem' }}>
                          Reviewed: <span style={{ color:'var(--accent)' }}>{r.reviewee?.name}</span>
                          <span style={{ color:'var(--text3)', fontSize:'.8rem', marginLeft:'.5rem' }}>({r.reviewee?.role})</span>
                        </div>
                        {r.job && <div style={{ color:'var(--text2)', fontSize:'.82rem' }}>Job: {r.job?.title}</div>}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                        <span style={{ color:'#ffd166' }}>{'★'.repeat(r.rating) + '☆'.repeat(5-r.rating)}</span>
                        <span style={{ color:'var(--text3)', fontSize:'.78rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p style={{ color:'var(--text2)', fontSize:'.88rem', padding:'.6rem .75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)' }}>
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Applications ── */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div className="card empty-state"><h3>No applications yet</h3></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Job Title</th><th>Posted By</th><th>Status</th><th>Proposed Rate</th><th>Applied</th></tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td style={{ fontWeight:600 }}>{app.job?.title || '—'}</td>
                        <td style={{ color:'var(--text2)' }}>{app.job?.poster?.name || '—'}</td>
                        <td><span className={`badge badge-${app.status}`}>{app.status}</span></td>
                        <td style={{ color:'var(--text2)' }}>{app.proposedRate ? `$${app.proposedRate}` : '—'}</td>
                        <td style={{ color:'var(--text3)', fontSize:'.82rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}