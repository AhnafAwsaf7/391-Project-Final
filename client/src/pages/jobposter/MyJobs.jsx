import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function PosterJobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg]       = useState('');

  const load = () => {
    setLoading(true);
    api.get('/jobs/my').then(({ data }) => setJobs(data.jobs)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job and all its applications?')) return;
    setDeleting(id);
    try {
      await api.delete(`/jobs/${id}`);
      setMsg('Job deleted successfully');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(null); }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    await api.put(`/jobs/${job._id}`, { status: newStatus });
    load();
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
          <div>
            <h1 style={{ fontSize:'1.75rem', marginBottom:'.3rem' }}>My Jobs</h1>
            <p style={{ color:'var(--text2)' }}>Manage all your job postings</p>
          </div>
          <Link to="/poster/jobs/new" className="btn btn-primary">+ Post New Job</Link>
        </div>

        {msg && <div className={`alert ${msg.includes('deleted') || msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          jobs.length === 0 ? (
            <div className="card empty-state">
              <h3>No jobs yet</h3>
              <p>Post your first job to start receiving applications</p>
              <Link to="/poster/jobs/new" className="btn btn-primary" style={{ marginTop:'1rem' }}>Post a Job</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {jobs.map(job => (
                <div className="card" key={job._id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.4rem', flexWrap:'wrap' }}>
                        <h3 style={{ fontSize:'1.05rem' }}>{job.title}</h3>
                        <span className={`badge badge-${job.status}`}>{job.status}</span>
                        <span style={{ color:'var(--text3)', fontSize:'.8rem', textTransform:'capitalize' }}>{job.type} · {job.category}</span>
                      </div>
                      <p style={{ color:'var(--text2)', fontSize:'.88rem', marginBottom:'.75rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        {job.description}
                      </p>
                      <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap' }}>
                        {job.skills?.map(s => <span key={s._id} className="skill-tag">{s.name}</span>)}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.5rem', flexShrink:0 }}>
                      <div style={{ textAlign:'right', color:'var(--text2)', fontSize:'.8rem' }}>
                        <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text)', fontFamily:'var(--font-head)' }}>
                          {job.applicationsCount || 0} <span style={{ fontSize:'.75rem', fontWeight:400 }}>applicants</span>
                        </div>
                        <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                        <Link to={`/poster/jobs/${job._id}/applicants`} className="btn btn-secondary btn-sm">👥 Applicants</Link>
                        <Link to={`/poster/jobs/${job._id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
                        <button onClick={() => toggleStatus(job)} className="btn btn-secondary btn-sm">
                          {job.status === 'open' ? '🔒 Close' : '🔓 Open'}
                        </button>
                        <button onClick={() => handleDelete(job._id)} disabled={deleting === job._id} className="btn btn-danger btn-sm">
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
