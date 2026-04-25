import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STATUSES = ['pending','reviewing','shortlisted','hired','rejected'];

export default function Applicants() {
  const { id } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg]           = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating]     = useState(0);
  const [reviewHovered, setReviewHovered]   = useState(0);
  const [reviewComment, setReviewComment]   = useState('');
  const [reviewError, setReviewError]       = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, jobRes] = await Promise.all([
        api.get(`/jobs/${id}/applicants`),
        api.get(`/jobs/${id}`),
      ]);
      setApplications(appRes.data.applications);
      setJob(jobRes.data.job);

      const hiredApps = appRes.data.applications.filter(a => a.status === 'hired');
      const reviewChecks = await Promise.all(
        hiredApps.map(a => api.get(`/reviews/user/${a.applicant?._id}`).catch(() => ({ data: { reviews: [] } })))
      );
      const already = [];
      reviewChecks.forEach((res, i) => {
        const rev = res.data.reviews?.find(r => r.reviewer?._id === user?._id || r.reviewer === user?._id);
        if (rev) already.push(hiredApps[i].applicant?._id);
      });
      setMyReviews(already);
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

  const openReviewModal = (app) => {
    setReviewTarget({ applicantId: app.applicant?._id, name: app.applicant?.name });
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (reviewRating === 0) return setReviewError('Please select a star rating');
    if (reviewComment.trim().length < 10) return setReviewError('Comment must be at least 10 characters');
    setReviewError(''); setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        revieweeId: reviewTarget.applicantId,
        jobId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      flash('Review submitted successfully! ⭐');
      setReviewTarget(null);
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally { setReviewSubmitting(false); }
  };

  const initials = name => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

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
              const isHired       = app.status === 'hired';
              const alreadyReviewed = myReviews.includes(app.applicant?._id);
              const isFlagged     = app.applicant?.isFlagged;

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
                          {/* Name + flagged badge */}
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

                      {/* Action buttons row */}
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

                        {/* View Profile button — always visible */}
                        <Link
                          to={`/poster/seekers/${app.applicant?._id}/profile`}
                          className="btn btn-secondary btn-sm"
                          style={{ marginLeft:'auto' }}
                        >👤 View Profile</Link>

                        {/* Review button — only for hired */}
                        {isHired && (
                          alreadyReviewed ? (
                            <span style={{ fontSize:'.82rem', color:'var(--accent3)' }}>✅ Reviewed</span>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => openReviewModal(app)}>
                              ⭐ Leave Review
                            </button>
                          )
                        )}
                      </div>

                      {isHired && !alreadyReviewed && (
                        <div style={{ marginTop:'.5rem', fontSize:'.78rem', color:'var(--text3)' }}>
                          💡 This applicant was hired — you can now leave them a review
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Review Modal ── */}
        {reviewTarget && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setReviewTarget(null)}>
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2 style={{ fontSize:'1.05rem' }}>Leave a Review</h2>
                  <div style={{ color:'var(--text2)', fontSize:'.82rem', marginTop:'.2rem' }}>
                    For <strong style={{ color:'var(--text)' }}>{reviewTarget.name}</strong> · {job?.title}
                  </div>
                </div>
                <button onClick={() => setReviewTarget(null)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'1.3rem', lineHeight:1 }}>✕</button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  {reviewError && <div className="alert alert-error">{reviewError}</div>}
                  <div className="form-group">
                    <label>Rating *</label>
                    <div style={{ display:'flex', gap:'.35rem', alignItems:'center', marginTop:'.25rem' }}>
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n} type="button"
                          onMouseEnter={() => setReviewHovered(n)}
                          onMouseLeave={() => setReviewHovered(0)}
                          onClick={() => setReviewRating(n)}
                          style={{
                            background:'none', border:'none', cursor:'pointer', padding:'.1rem',
                            fontSize:'2rem', lineHeight:1,
                            color: n <= (reviewHovered || reviewRating) ? '#ffd166' : 'var(--border)',
                            transition:'color .15s, transform .15s',
                            transform: n <= (reviewHovered || reviewRating) ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >★</button>
                      ))}
                      {(reviewHovered || reviewRating) > 0 && (
                        <span style={{ color:'var(--text2)', fontSize:'.85rem', marginLeft:'.5rem' }}>
                          {starLabel[reviewHovered || reviewRating]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Your Review *</label>
                    <textarea
                      rows={5}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Describe your experience working with this person…"
                      required
                    />
                    <div style={{ color:'var(--text3)', fontSize:'.78rem', textAlign:'right' }}>{reviewComment.length} chars (min 10)</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
                  <button className="btn btn-primary" disabled={reviewSubmitting || reviewRating === 0}>
                    {reviewSubmitting ? 'Submitting…' : '⭐ Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}