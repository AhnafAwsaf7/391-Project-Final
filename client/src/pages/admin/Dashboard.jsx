import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label:'Total Users',       value: stats.totalUsers,        color:'var(--accent)',  link:'/admin/users'        },
    { label:'Job Seekers',       value: stats.jobseekers,        color:'#a29bfe',        link:'/admin/users?role=jobseeker' },
    { label:'Job Posters',       value: stats.jobposters,        color:'#ffd166',        link:'/admin/users?role=jobposter' },
    { label:'Total Jobs',        value: stats.totalJobs,         color:'var(--accent3)', link:'/admin/jobs'         },
    { label:'Open Jobs',         value: stats.openJobs,          color:'var(--accent3)', link:'/admin/jobs'         },
    { label:'Closed Jobs',       value: stats.closedJobs,        color:'var(--accent2)', link:'/admin/jobs'         },
    { label:'Applications',      value: stats.totalApplications, color:'#74b9ff',        link:'/admin/applications' },
    { label:'Reviews',           value: stats.totalReviews,      color:'#ffeaa7',        link:'/admin/reviews'      },
  ] : [];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Full platform overview and management</p>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <>
            <div className="grid-4" style={{ marginBottom:'2.5rem' }}>
              {cards.map(c => (
                <Link key={c.label} to={c.link} style={{ textDecoration:'none' }}>
                  <div className="card stat-card card-hover">
                    <div className="stat-number" style={{ color: c.color }}>{c.value}</div>
                    <div className="stat-label">{c.label}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="grid-3">
              {[
                { title:'Manage Users',        icon:'👥', desc:'View, edit, block/unblock and delete users of any role', link:'/admin/users',        btn:'Go to Users'        },
                { title:'Manage Jobs',         icon:'💼', desc:'View all job listings, update status, or remove inappropriate postings', link:'/admin/jobs',         btn:'Go to Jobs'         },
                { title:'Manage Applications', icon:'📋', desc:'View all applications across the platform', link:'/admin/applications', btn:'Go to Applications' },
                { title:'Manage Reviews',      icon:'⭐', desc:'Remove inappropriate reviews and maintain platform trust', link:'/admin/reviews',     btn:'Go to Reviews'      },
              ].map(q => (
                <div className="card" key={q.title} style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                  <div style={{ fontSize:'2rem' }}>{q.icon}</div>
                  <div>
                    <h3 style={{ fontSize:'1rem', marginBottom:'.3rem' }}>{q.title}</h3>
                    <p style={{ color:'var(--text2)', fontSize:'.84rem' }}>{q.desc}</p>
                  </div>
                  <Link to={q.link} className="btn btn-primary btn-sm" style={{ marginTop:'auto' }}>{q.btn} →</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
