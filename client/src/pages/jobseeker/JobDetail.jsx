import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob]                     = useState(null);
  const [posterProfile, setPosterProfile] = useState(null);
  const [reviews, setReviews]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [applied, setApplied]             = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [applyForm, setApplyForm]         = useState({ coverLetter:'', proposedRate:'' });
  const [applyError, setApplyError]       = useState('');
  const [applying, setApplying]           = useState(false);
  const [applySuccess, setApplySuccess]   = useState('');

  // Review form state
  const [reviewRating, setReviewRating]   = useState(0);
  const [reviewHovered, setReviewHovered] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError]     = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const loadReviews = async (posterId) => {
    const { data } = await api.get(`/reviews/user/${posterId}`).catch(() => ({ data: { reviews: [] } }));
    setReviews(data.reviews || []);
    setAlreadyReviewed(data.reviews?.some(r => r.reviewer?._id === user?._id || r.reviewer === user?._id));
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/jobs/${id}`).then(async ({ data }) => {
      setJob(data.job);
      const posterId = data.job.poster?._id;
      if (posterId) {
        const [profRes, appRes] = await Promise.all([
          api.get(`/users/jobposter/${posterId}`).catch(() => ({ data: {} })),
          api.get('/applications/my').catch(() => ({ data: { applications: [] } })),
        ]);
        setPosterProfile(profRes.data.profile);
        setApplied(appRes.data.applications?.some(a => a.job?._id === id || a.job === id));
        await loadReviews(posterId);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async e => {
    e.preventDefault();
    setApplyError(''); setApplying(true);
    try {
      await api.post(`/applications/job/${id}`, applyForm);
      setApplySuccess('Application submitted successfully! 🎉');
      setApplied(true);
      setShowModal(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (reviewRating === 0) return setReviewError('Please select a star rating');
    if (reviewComment.trim().length < 10) return setReviewError('Comment must be at least 10 characters');
    setReviewError(''); setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        revieweeId: job.poster?._id,
        jobId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setApplySuccess('Review submitted successfully! ⭐');
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      await loadReviews(job.poster?._id);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally { setReviewSubmitting(false); }
  };

  const stars = r => '★'.repeat(r) + '☆'.repeat(5 - r);
  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const budgetLabel = j =>
    j?.budget?.type === 'hourly'
      ? `$${j.budget.min}–$${j.budget.max} / hour`
      : `$${j?.budget?.min?.toLocaleString()} – $${j?.budget?.max?.toLocaleString()} fixed`;

  if (loading) return <div className="page-wrapper"><Sidebar /><main className="main-content"><div className="spinner-wrap"><div className="spinner" /></div></main></div>;
  if (!job) return <div className="page-wrapper"><Sidebar /><main className="main-content"><div className="alert alert-error">Job not found</div></main></div>;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <Link to="/seeker/jobs" style={{ color:'var(--text2)', fontSize:'.85rem', display:'inline-block', marginBottom:'1rem' }}>← Back to Jobs</Link>

        {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(280px,1fr)', gap:'1.5rem', alignItems:'start' }}>

          {/* ── Left: Job info ── */}
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div>
                  <h1 style={{ fontSize:'1.5rem', marginBottom:'.4rem' }}>{job.title}</h1>
                  <div style={{ display:'flex', gap:'1rem', color:'var(--text2)', fontSize:'.85rem', flexWrap:'wrap' }}>
                    <span>🏢 {job.poster?.name}</span>
                    <span>📁 {job.category}</span>
                    <span>🕐 {job.type}</span>
                    <span>📍 {job.location}</span>
                  </div>
                </div>
                <span className={`badge badge-${job.status}`}>{job.status}</span>
              </div>

              <div style={{ padding:'1rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', marginBottom:'1rem' }}>
                <div style={{ fontWeight:700, color:'var(--accent)', fontFamily:'var(--font-head)', fontSize:'1.2rem' }}>{budgetLabel(job)}</div>
              </div>

              <h3 style={{ marginBottom:'.75rem', fontSize:'1rem' }}>About the Role</h3>
              <p style={{ color:'var(--text2)', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{job.description}</p>

              <div style={{ marginTop:'1.25rem' }}>
                <h3 style={{ marginBottom:'.6rem', fontSize:'1rem' }}>Required Skills</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                  {job.skills?.map(s => <span key={s._id} className="skill-tag">{s.name}</span>)}
                </div>
              </div>

              {job.deadline && (
                <div style={{ marginTop:'1rem', color:'var(--text2)', fontSize:'.85rem' }}>
                  ⏰ Deadline: <strong style={{ color:'var(--text)' }}>{new Date(job.deadline).toLocaleDateString()}</strong>
                </div>
              )}
            </div>

            {/* ── Client Reviews ── */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h3 className="section-title" style={{ border:'none', margin:0 }}>Client Reviews ({reviews.length})</h3>
                {applied && (
                  alreadyReviewed ? (
                    <span style={{ fontSize:'.82rem', color:'var(--accent3)' }}>✅ You reviewed this client</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowReviewModal(true)}>
                      ⭐ Leave a Review
                    </button>
                  )
                )}
              </div>

              {!applied && (
                <div className="alert alert-info" style={{ fontSize:'.84rem' }}>
                  Apply to this job to leave a review for the client.
                </div>
              )}

              {reviews.length === 0 ? (
                <p style={{ color:'var(--text2)', fontSize:'.9rem' }}>No reviews yet — be the first!</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {reviews.slice(0, 4).map(r => (
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

          {/* ── Right: Apply + Poster info ── */}
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              {job.status !== 'open' ? (
                <div className="alert alert-error" style={{ margin:0 }}>This job is no longer accepting applications</div>
              ) : applied ? (
                <div className="alert alert-success" style={{ margin:0 }}>✅ You have applied to this job</div>
              ) : (
                <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:'1rem', padding:'.75rem' }} onClick={() => setShowModal(true)}>
                  Apply Now →
                </button>
              )}
              <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'.5rem', fontSize:'.85rem', color:'var(--text2)' }}>
                <div>👥 {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}</div>
                <div>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {posterProfile && (
              <div className="card">
                <h3 className="section-title">About the Client</h3>
                <div style={{ display:'flex', gap:'.75rem', alignItems:'center', marginBottom:'1rem' }}>
                  <div className="avatar" style={{ width:48, height:48, fontSize:'1.1rem' }}>
                    {job.poster?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700 }}>{posterProfile.companyName || job.poster?.name}</div>
                    <div style={{ color:'var(--text2)', fontSize:'.82rem' }}>{posterProfile.industry} · {posterProfile.companySize} employees</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'.4rem', marginTop:'.2rem' }}>
                      <span className="stars" style={{ fontSize:'.78rem' }}>{stars(Math.round(posterProfile.averageRating || 0))}</span>
                      <span style={{ color:'var(--text2)', fontSize:'.78rem' }}>{posterProfile.averageRating?.toFixed(1) || '—'}</span>
                    </div>
                  </div>
                </div>
                {posterProfile.companyDescription && (
                  <p style={{ color:'var(--text2)', fontSize:'.85rem' }}>{posterProfile.companyDescription}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Apply Modal ── */}
        {showModal && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2>Apply to: {job.title}</h2>
                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  {applyError && <div className="alert alert-error">{applyError}</div>}
                  <div className="form-group">
                    <label>Cover Letter *</label>
                    <textarea
                      rows={6} required
                      value={applyForm.coverLetter}
                      onChange={e => setApplyForm(f => ({ ...f, coverLetter: e.target.value }))}
                      placeholder="Introduce yourself and explain why you're a great fit for this role…"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proposed Rate (USD{job.budget?.type === 'hourly' ? '/hr' : ' fixed'})</label>
                    <input type="number" value={applyForm.proposedRate} onChange={e => setApplyForm(f => ({ ...f, proposedRate: e.target.value }))} placeholder="e.g. 75" min="0" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={applying}>{applying ? 'Submitting…' : 'Submit Application'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Review Modal ── */}
        {showReviewModal && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowReviewModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2 style={{ fontSize:'1.05rem' }}>Leave a Review</h2>
                  <div style={{ color:'var(--text2)', fontSize:'.82rem', marginTop:'.2rem' }}>
                    For <strong style={{ color:'var(--text)' }}>{posterProfile?.companyName || job.poster?.name}</strong> · {job.title}
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
                      placeholder="Describe your experience working with this client — their communication, clarity of requirements, and whether you'd recommend them…"
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