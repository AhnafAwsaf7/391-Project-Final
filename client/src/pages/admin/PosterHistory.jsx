import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function PosterHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');
  const [working, setWorking] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const [userRes, jobsRes] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/jobs?limit=100`),
      ]);
      setUser(userRes.data.user);
      setProfile(userRes.data.profile);
      // Filter jobs posted by this user
      const posterJobs = jobsRes.data.jobs.filter(j => j.poster?._id === id || j.poster === id);
      setJobs(posterJobs);
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
      const action = user.isBlocked ? 'unblock' : 'block';
      await api.put(`/admin/users/${id}/${action}`);
      flash(`User ${action}ed`);
      load();
    } finally { setWorking(false); }
  };

  const initials = n => n?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const openJobs        = jobs.filter(j => j.status === 'open').length;
  const closedJobs      = jobs.filter(j => j.status !== 'open').length;

  if (loading) return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content"><div className="spinner-wrap"><div className="spinner" /></div></main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <Link to="/admin/users" style={{ color:'var(--text2)', fontSize:'.85rem', display:'inline-block', marginBottom:'1rem' }}>← Back to Users</Link>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* ── Profile Header ── */}
        <div className="card" style={{ marginBottom:'1.5rem', background:'linear-gradient(135deg, #ffd16611, var(--accent)08)' }}>
          <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>
            <div className="avatar" style={{ width:72, height:72, fontSize:'1.8rem', flexShrink:0, background:'#ffd16666' }}>
              {initials(user?.name)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', marginBottom:'.4rem' }}>
                <h1 style={{ fontSize:'1.4rem' }}>{user?.name}</h1>
                <span style={{ background:'#ffd16622', color:'#ffd166', border:'1px solid #ffd16644', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                  Job Poster
                </span>
                {user?.isFlagged && (
                  <span style={{ background:'#ff4d6d22', color:'#ff4d6d', border:'1px solid #ff4d6d44', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                    🚩 FLAGGED
                  </span>
                )}
                {user?.isBlocked && (
                  <span style={{ background:'#ffd16622', color:'#ffd166', border:'1px solid #ffd16644', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                    🔒 BLOCKED
                  </span>
                )}
              </div>
              <div style={{ color:'var(--text2)', fontSize:'.88rem', marginBottom:'.3rem' }}>{user?.email}</div>
              {profile?.companyName && (
                <div style={{ color:'var(--text2)', fontSize:'.9rem', marginBottom:'.3rem' }}>
                  🏢 {profile.companyName} · {profile.industry} · {profile.companySize} employees
                </div>
              )}
              {user?.isFlagged && user?.flagReason && (
                <div style={{ padding:'.5rem .75rem', background:'#ff4d6d11', border:'1px solid #ff4d6d33', borderRadius:'var(--radius-sm)', fontSize:'.83rem', color:'#ff4d6d', marginTop:'.5rem' }}>
                  <strong>Flag reason:</strong> {user.flagReason}
                </div>
              )}
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.75rem' }}>
                {user?.isFlagged ? (
                  <button className="btn btn-success btn-sm" disabled={working} onClick={handleUnflag}>✅ Remove Flag</button>
                ) : (
                  <button className="btn btn-danger btn-sm" disabled={working} onClick={() => setShowFlagInput(!showFlagInput)}>🚩 Flag User</button>
                )}
                <button
                  className={`btn btn-sm ${user?.isBlocked ? 'btn-success' : 'btn-secondary'}`}
                  disabled={working}
                  onClick={handleBlock}
                >{user?.isBlocked ? '🔓 Unblock' : '🔒 Block'}</button>
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
                { label:'Total Jobs',      value: jobs.length,       color:'var(--accent)'  },
                { label:'Open Jobs',       value: openJobs,          color:'var(--accent3)' },
                { label:'Closed Jobs',     value: closedJobs,        color:'var(--accent2)' },
                { label:'Total Applicants',value: totalApplicants,   color:'#ffd166'        },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign:'center', padding:'.75rem 1rem', minWidth:90 }}>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, fontFamily:'var(--font-head)', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text2)', marginTop:'.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs" style={{ marginBottom:'1.5rem' }}>
          {[
            { key:'overview', label:'Company Overview' },
            { key:'jobs',     label:`Posted Jobs (${jobs.length})` },
          ].map(t => (
            <button key={t.key} className={`tab ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Company Overview ── */}
        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'1.25rem' }}>
            <div className="card">
              <h3 className="section-title">Company Info</h3>
              {[
                { label:'Company Name',  value: profile?.companyName || '—' },
                { label:'Industry',      value: profile?.industry || '—' },
                { label:'Company Size',  value: profile?.companySize || '—' },
                { label:'Location',      value: profile?.location || '—' },
                { label:'Website',       value: profile?.companyWebsite || '—' },
                { label:'Member Since',  value: user ? new Date(user.createdAt).toLocaleDateString() : '—' },
                { label:'Verified',      value: user?.isVerified ? '✅ Yes' : '❌ No' },
              ].map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom:'1px solid var(--border)', fontSize:'.88rem' }}>
                  <span style={{ color:'var(--text2)' }}>{f.label}</span>
                  <span style={{ fontWeight:600 }}>{f.value}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="section-title">About the Company</h3>
              {profile?.companyDescription ? (
                <p style={{ color:'var(--text2)', fontSize:'.9rem', lineHeight:1.7 }}>{profile.companyDescription}</p>
              ) : (
                <p style={{ color:'var(--text2)', fontSize:'.88rem' }}>No description provided</p>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Posted Jobs ── */}
        {activeTab === 'jobs' && (
          <div>
            {jobs.length === 0 ? (
              <div className="card empty-state"><h3>No jobs posted yet</h3></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Job Title</th><th>Category</th><th>Type</th><th>Budget</th><th>Applicants</th><th>Status</th><th>Posted</th></tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job._id}>
                        <td style={{ fontWeight:600 }}>{job.title}</td>
                        <td style={{ color:'var(--text2)', textTransform:'capitalize' }}>{job.category}</td>
                        <td style={{ color:'var(--text2)', textTransform:'capitalize' }}>{job.type}</td>
                        <td style={{ color:'var(--accent)', fontWeight:600 }}>
                          {job.budget?.type === 'hourly'
                            ? `$${job.budget.min}–$${job.budget.max}/hr`
                            : `$${job.budget?.min?.toLocaleString()}–$${job.budget?.max?.toLocaleString()}`}
                        </td>
                        <td>
                          <span style={{ background:'var(--accent)22', color:'var(--accent)', borderRadius:'99px', padding:'.2rem .7rem', fontSize:'.82rem', fontWeight:700 }}>
                            {job.applicationsCount || 0} applicants
                          </span>
                        </td>
                        <td><span className={`badge badge-${job.status}`}>{job.status}</span></td>
                        <td style={{ color:'var(--text3)', fontSize:'.82rem' }}>{new Date(job.createdAt).toLocaleDateString()}</td>
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