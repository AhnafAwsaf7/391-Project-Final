import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function AdminJobs() {
  const [jobs, setJobs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [msg, setMsg]         = useState('');
  const [working, setWorking] = useState(null);

  const load = (s=search, st=status, p=page) => {
    setLoading(true);
    const params = new URLSearchParams({ limit:15, page:p });
    if (s)  params.set('search', s);
    if (st) params.set('status', st);
    api.get(`/admin/jobs?${params}`).then(({ data }) => {
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(Math.ceil(data.total / 15));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const toggleStatus = async (job) => {
    setWorking(job._id);
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/admin/jobs/${job._id}`, { status: newStatus });
      flash(`Job marked as ${newStatus}`);
      load();
    } finally { setWorking(null); }
  };

  const deleteJob = async (id) => {
    if (!confirm('Delete this job and all applications?')) return;
    setWorking(id);
    try {
      await api.delete(`/admin/jobs/${id}`);
      flash('Job deleted');
      load();
    } finally { setWorking(null); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Jobs <span style={{ color:'var(--text2)', fontSize:'1rem', fontWeight:400 }}>({total})</span></h1>
          <p>Moderate and manage all job listings</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="search-bar">
          <input placeholder="Search by job title…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); load(e.target.value, status, 1); }} />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); load(search, e.target.value, 1); }}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          jobs.length === 0 ? (
            <div className="card empty-state"><h3>No jobs found</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Title</th><th>Posted By</th><th>Category</th><th>Type</th><th>Applicants</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j._id}>
                      <td style={{ fontWeight:600, maxWidth:200 }}><span title={j.title} style={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>{j.title}</span></td>
                      <td style={{ color:'var(--text2)' }}>{j.poster?.name}</td>
                      <td style={{ textTransform:'capitalize', color:'var(--text2)' }}>{j.category}</td>
                      <td style={{ textTransform:'capitalize', color:'var(--text2)' }}>{j.type}</td>
                      <td style={{ textAlign:'center' }}>{j.applicationsCount || 0}</td>
                      <td><span className={`badge badge-${j.status}`}>{j.status}</span></td>
                      <td style={{ color:'var(--text3)', fontSize:'.82rem' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display:'flex', gap:'.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={working===j._id}
                            onClick={() => toggleStatus(j)}
                          >{j.status==='open' ? '🔒 Close' : '🔓 Open'}</button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={working===j._id}
                            onClick={() => deleteJob(j._id)}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i+1).map(p => (
              <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => { setPage(p); load(search, status, p); }}>{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
