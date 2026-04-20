import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function SeekerDashboard() {
  const { user, profile } = useAuth();
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs/matched'),
      api.get('/applications/my'),
    ]).then(([jobsRes, appsRes]) => {
      setMatchedJobs(jobsRes.data.jobs?.slice(0, 4) || []);
      setApplications(appsRes.data.applications?.slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label:'Skills Added',    value: profile?.skills?.length || 0,      color:'var(--accent)'  },
    { label:'Jobs Applied',    value: applications.length,                color:'var(--accent3)' },
    { label:'Matched Jobs',    value: matchedJobs.length,                 color:'#ffd166'        },
    { label:'Profile Rating',  value: profile?.averageRating?.toFixed(1)||'—', color:'var(--accent2)' },
  ];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Your job search overview</p>
        </div>

        {profile && profile.skills?.length === 0 && (
          <div className="alert alert-info" style={{ marginBottom:'1.5rem' }}>
            💡 <strong>Add skills to your profile</strong> to see jobs matched to you. <Link to="/seeker/profile">Update Profile →</Link>
          </div>
        )}

        <div className="grid-4" style={{ marginBottom:'2rem' }}>
          {stats.map(s => (
            <div className="card stat-card" key={s.label}>
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%,420px),1fr))', gap:'1.5rem' }}>
            {/* Matched Jobs */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h2 style={{ fontSize:'1.05rem', fontWeight:700 }}>🎯 Matched Jobs</h2>
                <Link to="/seeker/jobs" className="btn btn-secondary btn-sm">Browse All</Link>
              </div>
              {matchedJobs.length === 0 ? (
                <div className="card empty-state" style={{ padding:'1.5rem' }}>
                  <p>No matches yet — add skills to your profile!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {matchedJobs.map(job => (
                    <Link key={job._id} to={`/seeker/jobs/${job._id}`} style={{ textDecoration:'none' }}>
                      <div className="card card-hover" style={{ padding:'1rem' }}>
                        <div style={{ fontWeight:700, marginBottom:'.2rem', color:'var(--text)' }}>{job.title}</div>
                        <div style={{ color:'var(--text2)', fontSize:'.82rem', marginBottom:'.5rem' }}>{job.poster?.name}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem' }}>
                          {job.skills?.slice(0,3).map(s=><span key={s._id} className="skill-tag">{s.name}</span>)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h2 style={{ fontSize:'1.05rem', fontWeight:700 }}>📋 Recent Applications</h2>
                <Link to="/seeker/applications" className="btn btn-secondary btn-sm">View All</Link>
              </div>
              {applications.length === 0 ? (
                <div className="card empty-state" style={{ padding:'1.5rem' }}>
                  <p>No applications yet. Start applying!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  {applications.map(app => (
                    <div className="card" key={app._id} style={{ padding:'1rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'.92rem' }}>{app.job?.title}</div>
                          <div style={{ color:'var(--text2)', fontSize:'.8rem' }}>{app.job?.poster?.name}</div>
                        </div>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
