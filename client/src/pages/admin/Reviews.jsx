import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [msg, setMsg]         = useState('');

  const load = (p=page) => {
    setLoading(true);
    api.get(`/admin/reviews?page=${p}&limit=20`).then(({ data }) => {
      setReviews(data.reviews);
      setTotal(data.total);
      setPages(Math.ceil(data.total / 20));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteReview = async (id) => {
    if (!confirm('Delete this review? Ratings will be recalculated.')) return;
    await api.delete(`/admin/reviews/${id}`);
    setMsg('Review deleted and ratings updated');
    setTimeout(() => setMsg(''), 3000);
    load();
  };

  const stars = r => '★'.repeat(r) + '☆'.repeat(5-r);

  const userLabel = (user) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'.4rem' }}>
      {user?.role === 'jobseeker' ? (
        <Link
          to={`/admin/seekers/${user._id}/history`}
          style={{ color:'var(--accent)', fontWeight:600 }}
        >
          {user?.name}
        </Link>
      ) : (
        <span style={{ fontWeight:600 }}>{user?.name}</span>
      )}
      {user?.isFlagged && (
        <span style={{ background:'#ff4d6d22', color:'#ff4d6d', borderRadius:'99px', padding:'.1rem .4rem', fontSize:'.7rem', fontWeight:700 }}>
          🚩 Flagged
        </span>
      )}
    </span>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Reviews <span style={{ color:'var(--text2)', fontSize:'1rem', fontWeight:400 }}>({total})</span></h1>
          <p>Click on a job seeker's name to view their full history</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          reviews.length === 0 ? (
            <div className="card empty-state"><h3>No reviews yet</h3></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {reviews.map(r => (
                <div className="card" key={r._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                    <div style={{ flex:1 }}>

                      {/* Reviewer → Reviewee row */}
                      <div style={{ display:'flex', gap:'.5rem', alignItems:'center', flexWrap:'wrap', marginBottom:'.5rem' }}>
                        {userLabel(r.reviewer)}
                        <span style={{ color:'var(--text3)' }}>→</span>
                        {userLabel(r.reviewee)}
                        <span style={{ color:'#ffd166' }}>{stars(r.rating)}</span>
                        <span style={{ color:'var(--text3)', fontSize:'.78rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Email + job info */}
                      <div style={{ color:'var(--text2)', fontSize:'.82rem', marginBottom:'.5rem' }}>
                        👤 {r.reviewer?.email} → {r.reviewee?.email}
                        {r.job && <span> · Job: {r.job?.title}</span>}
                      </div>

                      {/* Comment */}
                      <p style={{ color:'var(--text2)', fontSize:'.88rem', padding:'.6rem .75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', marginBottom:'.75rem' }}>
                        {r.comment}
                      </p>

                      {/* History buttons — one for reviewer if seeker, one for reviewee if seeker */}
                      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                        {r.reviewer?.role === 'jobseeker' && (
                          <Link
                            to={`/admin/seekers/${r.reviewer._id}/history`}
                            className="btn btn-secondary btn-sm"
                          >
                            📋 {r.reviewer.name}'s History
                          </Link>
                        )}
                        {r.reviewee?.role === 'jobseeker' && (
                          <Link
                            to={`/admin/seekers/${r.reviewee._id}/history`}
                            className="btn btn-secondary btn-sm"
                          >
                            📋 {r.reviewee.name}'s History
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r._id)}>
                      🗑 Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i+1).map(p => (
              <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => { setPage(p); load(p); }}>{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}