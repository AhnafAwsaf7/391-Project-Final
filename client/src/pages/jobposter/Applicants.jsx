import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

const STATUSES = ['pending','reviewing','shortlisted','hired','rejected'];

export default function Applicants() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, jobRes] = await Promise.all([
        api.get(`/jobs/${id}/applicants`),
        api.get(`/jobs/${id}`),
      ]);
      setApplications(appRes.data.applications);
      setJob(jobRes.data.job);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status });
      flash(`Status updated to "${status}"`);
      load();
    } catch { flash('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const initials = name => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <Link to="/poster/jobs" style={{ color:'var(--text2)', fontSize:'.85rem' }}>← Back to Jobs</Link>
          <h1 style={{ marginTop:'.4rem' }}>Applicants {job && `— ${job.title}`}</h1>
          <p style={{ color:'var(--text2)' }}>
            {applications.length} application{applications.length !== 1 ? 's' : ''} received
          </p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : applications.length === 0 ? (
          <div className="card empty-state">
            <h3>No applications yet</h3>
            <p>Applicants will appear here once people apply to this job</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {applications.map(app => {
              const isFlagged = app.applicant?.isFlagged;

              return (
                <div className="card" key={app._id} style={{
                  border: isFlagged ? '1px solid #ff4d6d44' : '1px solid var(--border)',
                  background: isFlagged ? '#ff4d6d08' : 'var(--bg2)',
                }}>
                  <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                    <div className="avatar" style={{ width:44, height:44, fontSize:'1rem', flexShrink:0,
                      background: isFlagged ? '#ff4d6d44' : 'var(--accent)' }}>
                      {initials(app.applicant?.name)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.5rem' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap' }}>
                            <div style={{ fontWeight:700 }}>{app.applicant?.name}</div>
                            {isFlagged && (
                              <span style={{
                                background:'#ff4d6d22', color:'#ff4d6d',
                                border:'1px solid #ff4d6d44', borderRadius:'99px',
                                padding:'.15rem .6rem', fontSize:'.72rem', fontWeight:700,
                              }}>🚩 Flagged</span>
                            )}
                          </div>
                          <div style={{ color:'var(--text2)', fontSize:'.82rem' }}>{app.applicant?.email}</div>
                          {isFlagged && app.applicant?.flagReason && (
                            <div style={{ marginTop:'.3rem', padding:'.35rem .65rem',
                              background:'#ff4d6d11', border:'1px solid #ff4d6d33',
                              borderRadius:'var(--radius-sm)', fontSize:'.78rem', color:'#ff4d6d' }}>
                              <strong>Flag reason:</strong> {app.applicant.flagReason}
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap' }}>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                          {app.proposedRate && (
                            <span style={{ color:'var(--text2)', fontSize:'.82rem' }}>${app.proposedRate}/hr</span>
                          )}
                          <span style={{ color:'var(--text3)', fontSize:'.78rem' }}>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div style={{ margin:'.75rem 0', padding:'.75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', fontSize:'.88rem', color:'var(--text2)' }}>
                        <strong style={{ color:'var(--text)', display:'block', marginBottom:'.3rem' }}>Cover Letter</strong>
                        {app.coverLetter}
                      </div>

                      {/* Status controls + View Profile */}
                      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ color:'var(--text2)', fontSize:'.82rem', fontWeight:600 }}>Status:</span>
                        {STATUSES.map(s => (
                          <button
                            key={s}
                            disabled={updating === app._id || app.status === s}
                            onClick={() => updateStatus(app._id, s)}
                            className={`btn btn-sm ${app.status === s ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform:'capitalize' }}
                          >{s}</button>
                        ))}
                        <Link
                          to={`/poster/seekers/${app.applicant?._id}/profile`}
                          className="btn btn-secondary btn-sm"
                          style={{ marginLeft:'auto' }}
                        >👤 View Profile</Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}