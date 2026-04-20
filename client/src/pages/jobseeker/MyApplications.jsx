import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [msg, setMsg]                   = useState('');
  const [reviewedPosters, setReviewedPosters] = useState([]); // posterIds already reviewed

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget]       = useState(null); // { posterId, posterName, jobId, jobTitle }
  const [reviewRating, setReviewRating]       = useState(0);
  const [reviewHovered, setReviewHovered]     = useState(0);
  const [reviewComment, setReviewComment]     = useState('');
  const [reviewError, setReviewError]         = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/applications/my').catch(() => ({ data: { applications: [] } }));
    const apps = data.applications || [];
    setApplications(apps);

    // Check which posters the seeker has already reviewed
    const uniquePosterIds = [...new Set(apps.map(a => a.job?.poster?._id).filter(Boolean))];
    const alreadyReviewed = [];
    for (const posterId of uniquePosterIds) {
      const { data: revData } = await api.get(`/reviews/user/${posterId}`).catch(() => ({ data: { reviews: [] } }));
      const done = revData.reviews?.some(r => r.reviewer?._id === user?._id || r.reviewer === user?._id);
      if (done) alreadyReviewed.push(posterId);
    }
    setReviewedPosters(alreadyReviewed);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (appId) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await api.delete(`/applications/${appId}/withdraw`);
      setMsg('Application withdrawn');
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to withdraw'); }
    finally { setTimeout(() => setMsg(''), 3000); }
  };

  const openReviewModal = (app) => {
    setReviewTarget({
      posterId:   app.job?.poster?._id,
      posterName: app.job?.poster?.name,
      jobId:      app.job?._id,
      jobTitle:   app.job?.title,
    });
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (reviewRating === 0) return setReviewError('Please select a star rating');
    if (reviewComment.trim().length < 10) return setReviewError('Comment must be at least 10 characters');
    setReviewError(''); setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        revieweeId: reviewTarget.posterId,
        jobId:      reviewTarget.jobId,
        rating:     reviewRating,
        comment:    reviewComment,
      });
      setMsg('Review submitted successfully! ⭐');
      setShowReviewModal(false);
      setTimeout(() => setMsg(''), 4000);
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally { setReviewSubmitting(false); }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const statusColors = {
    pending:'#ffd166', reviewing:'#a29bfe', shortlisted:'var(--accent)',
    hired:'var(--accent3)', rejected:'#ff4d6d',
  };

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track the status of all your job applications</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="tabs">
          {['all','pending','reviewing','shortlisted','hired','rejected'].map(s => (
            <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)} style={{ textTransform:'capitalize' }}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <h3>{filter==='all' ? 'No applications yet' : `No ${filter} applications`}</h3>
            <p>{filter==='all' ? 'Browse jobs and start applying!' : 'Check other status tabs'}</p>
            {filter==='all' && <Link to="/seeker/jobs" className="btn btn-primary" style={{ marginTop:'1rem' }}>Browse Jobs</Link>}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {filtered.map(app => {
              const posterId       = app.job?.poster?._id;
              const alreadyReviewed = reviewedPosters.includes(posterId);

              return (
                <div className="card" key={app._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.3rem', flexWrap:'wrap' }}>
                        <h3 style={{ fontSize:'1rem' }}>{app.job?.title}</h3>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </div>
                      <div style={{ color:'var(--text2)', fontSize:'.83rem', marginBottom:'.75rem' }}>
                        🏢 {app.job?.poster?.name} · Applied {new Date(app.createdAt).toLocaleDateString()}
                        {app.proposedRate && ` · $${app.proposedRate} proposed`}
                      </div>
                      <div style={{ padding:'.75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', fontSize:'.85rem', color:'var(--text2)' }}>
                        <strong style={{ color:'var(--text)' }}>Your cover letter: </strong>
                        {app.coverLetter.length > 200 ? app.coverLetter.slice(0, 200) + '…' : app.coverLetter}
                      </div>
                      {app.note && (
                        <div style={{ marginTop:'.5rem', padding:'.6rem .75rem', background:'var(--accent)11', border:'1px solid var(--accent)33', borderRadius:'var(--radius-sm)', fontSize:'.83rem' }}>
                          <strong style={{ color:'var(--accent)' }}>Client note: </strong>{app.note}
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'.5rem', alignItems:'flex-end', flexShrink:0 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: statusColors[app.status] || 'var(--text3)', flexShrink:0 }} />
                      <Link to={`/seeker/jobs/${app.job?._id}`} className="btn btn-secondary btn-sm">View Job</Link>
                      {app.status === 'pending' && (
                        <button onClick={() => withdraw(app._id)} className="btn btn-danger btn-sm">Withdraw</button>
                      )}
                      {alreadyReviewed ? (
                        <span style={{ fontSize:'.78rem', color:'var(--accent3)' }}>✅ Reviewed</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => openReviewModal(app)}>
                          ⭐ Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Review Modal ── */}
        {showReviewModal && reviewTarget && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowReviewModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2 style={{ fontSize:'1.05rem' }}>Leave a Review</h2>
                  <div style={{ color:'var(--text2)', fontSize:'.82rem', marginTop:'.2rem' }}>
                    For <strong style={{ color:'var(--text)' }}>{reviewTarget.posterName}</strong> · {reviewTarget.jobTitle}
                  </div>
                </div>
                <button onClick={() => setShowReviewModal(false)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'1.3rem', lineHeight:1 }}>✕</button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  {reviewError && <div className="alert alert-error">{reviewError}</div>}
                  <div className="form-group">
                    <label>Rating *</label>
                    <div style={{ display:'flex', gap:'.35rem', alignItems:'center', marginTop:'.25rem' }}>
                      {[1, 2, 3, 4, 5].map(n => (
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
                      placeholder="Describe your experience — communication, clarity of requirements, professionalism…"
                      required
                    />
                    <div style={{ color:'var(--text3)', fontSize:'.78rem', textAlign:'right' }}>{reviewComment.length} chars (min 10)</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
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