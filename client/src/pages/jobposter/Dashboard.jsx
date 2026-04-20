import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function PosterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs]   = useState([]);
  const [stats, setStats] = useState({ total:0, open:0, closed:0, applications:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/my').then(({ data }) => {
      setJobs(data.jobs.slice(0, 5));
      const open   = data.jobs.filter(j => j.status === 'open').length;
      const closed = data.jobs.filter(j => j.status !== 'open').length;
      const applications = data.jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
      setStats({ total: data.jobs.length, open, closed, applications });
    }).finally(() => setLoading(false));
  }, []);

  const statusBadge = s => <span className={`badge badge-${s}`}>{s}</span>;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's an overview of your hiring activity</p>
        </div>

        <div className="grid-4" style={{ marginBottom:'2rem' }}>
          {[
            { label:'Total Jobs',    value: stats.total,        color:'var(--accent)'  },
            { label:'Open Jobs',     value: stats.open,         color:'var(--accent3)' },
            { label:'Closed Jobs',   value: stats.closed,       color:'var(--accent2)' },
            { label:'Applications',  value: stats.applications, color:'#ffd166'        },
          ].map(s => (
            <div className="card stat-card" key={s.label}>
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h2 className="section-title" style={{ border:'none', margin:0 }}>Recent Jobs</h2>
          <Link to="/poster/jobs/new" className="btn btn-primary btn-sm">+ Post New Job</Link>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          jobs.length === 0 ? (
            <div className="card empty-state">
              <h3>No jobs posted yet</h3>
              <p>Start by posting your first job listing</p>
              <Link to="/poster/jobs/new" className="btn btn-primary" style={{ marginTop:'1rem' }}>Post a Job</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Status</th><th>Applicants</th><th>Posted</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j._id}>
                      <td style={{ fontWeight:600 }}>{j.title}</td>
                      <td style={{ textTransform:'capitalize' }}>{j.category}</td>
                      <td>{statusBadge(j.status)}</td>
                      <td>{j.applicationsCount || 0}</td>
                      <td style={{ color:'var(--text2)' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/poster/jobs/${j._id}/applicants`} className="btn btn-secondary btn-sm" style={{ marginRight:'.4rem' }}>Applicants</Link>
                        <Link to={`/poster/jobs/${j._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {jobs.length > 0 && (
          <div style={{ marginTop:'1rem', textAlign:'right' }}>
            <Link to="/poster/jobs" className="btn btn-secondary btn-sm">View All Jobs →</Link>
          </div>
        )}
      </main>
    </div>
  );
}
