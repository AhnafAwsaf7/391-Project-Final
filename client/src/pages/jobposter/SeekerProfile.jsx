import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function SeekerProfile() {
  const { userId } = useParams();
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [userRes, reviewRes] = await Promise.all([
          api.get(`/users/jobseeker/${userId}`),
          api.get(`/reviews/user/${userId}`),
        ]);
        setUser(userRes.data.user);
        setProfile(userRes.data.profile);
        setReviews(reviewRes.data.reviews || []);
      } finally { setLoading(false); }
    };
    load();
  }, [userId]);

  const stars = r => '★'.repeat(r) + '☆'.repeat(5 - r);
  const initials = n => n?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content"><div className="spinner-wrap"><div className="spinner" /></div></main>
    </div>
  );

  if (!user) return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content"><div className="alert alert-error">Profile not found</div></main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <Link to={-1} style={{ color:'var(--text2)', fontSize:'.85rem', display:'inline-block', marginBottom:'1rem' }}>
          ← Back to Applicants
        </Link>

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
                    🚩 Flagged
                  </span>
                )}
                {user.isBlocked && (
                  <span style={{ background:'#ffd16622', color:'#ffd166', border:'1px solid #ffd16644', borderRadius:'99px', padding:'.2rem .8rem', fontSize:'.8rem', fontWeight:700 }}>
                    🔒 Blocked
                  </span>
                )}
              </div>
              <div style={{ color:'var(--text2)', fontSize:'.88rem', marginBottom:'.3rem' }}>{user.email}</div>
              {profile?.headline && (
                <div style={{ color:'var(--text2)', fontSize:'.9rem', marginBottom:'.5rem' }}>{profile.headline}</div>
              )}
              {user.isFlagged && user.flagReason && (
                <div style={{ padding:'.5rem .75rem', background:'#ff4d6d11', border:'1px solid #ff4d6d33', borderRadius:'var(--radius-sm)', fontSize:'.83rem', color:'#ff4d6d' }}>
                  <strong>Flag reason:</strong> {user.flagReason}
                </div>
              )}
              <div style={{ display:'flex', gap:'1.5rem', marginTop:'.75rem', flexWrap:'wrap' }}>
                {profile?.location && <span style={{ color:'var(--text2)', fontSize:'.85rem' }}>📍 {profile.location}</span>}
                {profile?.hourlyRate > 0 && <span style={{ color:'var(--accent)', fontWeight:700, fontSize:'.9rem' }}>${profile.hourlyRate}/hr</span>}
                <span style={{ fontSize:'.78rem', padding:'.15rem .55rem', borderRadius:'99px',
                  background: profile?.availability === 'available' ? '#43e97b22' : '#ff4d6d22',
                  color: profile?.availability === 'available' ? 'var(--accent3)' : '#ff4d6d',
                  fontWeight:600, textTransform:'capitalize' }}>
                  {profile?.availability || 'unknown'}
                </span>
              </div>
            </div>

            {/* Rating summary */}
            <div className="card" style={{ textAlign:'center', padding:'1rem 1.5rem', flexShrink:0 }}>
              <div style={{ fontSize:'1.8rem', fontWeight:800, fontFamily:'var(--font-head)', color:'var(--accent)' }}>
                {profile?.averageRating?.toFixed(1) || '—'}
              </div>
              <div style={{ color:'#ffd166', fontSize:'1rem', margin:'.2rem 0' }}>
                {stars(Math.round(profile?.averageRating || 0))}
              </div>
              <div style={{ color:'var(--text2)', fontSize:'.78rem' }}>{profile?.totalReviews || 0} reviews</div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'1.25rem' }}>

          {/* ── Left: Skills + Bio ── */}
          <div>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <h3 className="section-title">Skills</h3>
              {profile?.skills?.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                  {profile.skills.map(s => <span key={s._id} className="skill-tag">{s.name}</span>)}
                </div>
              ) : <p style={{ color:'var(--text2)', fontSize:'.88rem' }}>No skills listed</p>}
            </div>

            {profile?.bio && (
              <div className="card">
                <h3 className="section-title">About</h3>
                <p style={{ color:'var(--text2)', fontSize:'.9rem', lineHeight:1.7 }}>{profile.bio}</p>
              </div>
            )}
          </div>

          {/* ── Right: Reviews ── */}
          <div className="card">
            <h3 className="section-title">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p style={{ color:'var(--text2)', fontSize:'.88rem' }}>No reviews yet</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                {reviews.map(r => (
                  <div key={r._id} style={{ paddingBottom:'.85rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                        <div className="avatar" style={{ width:28, height:28, fontSize:'.7rem' }}>
                          {r.reviewer?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, fontSize:'.88rem' }}>{r.reviewer?.name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                        <span style={{ color:'#ffd166', fontSize:'.88rem' }}>{stars(r.rating)}</span>
                        <span style={{ color:'var(--text3)', fontSize:'.75rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {r.job && (
                      <div style={{ color:'var(--text3)', fontSize:'.78rem', marginBottom:'.3rem', paddingLeft:'2.3rem' }}>
                        Job: {r.job?.title}
                      </div>
                    )}
                    <p style={{ color:'var(--text2)', fontSize:'.85rem', paddingLeft:'2.3rem' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}