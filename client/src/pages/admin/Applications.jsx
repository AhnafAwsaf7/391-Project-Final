import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function AdminApplications() {
  const [apps, setApps]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [msg, setMsg]         = useState('');

  const load = (st=status, p=page) => {
    setLoading(true);
    const params = new URLSearchParams({ limit:20, page:p });
    if (st) params.set('status', st);
    api.get(`/admin/applications?${params}`).then(({ data }) => {
      setApps(data.applications);
      setTotal(data.total);
      setPages(Math.ceil(data.total / 20));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return;
    await api.delete(`/admin/applications/${id}`);
    setMsg('Application deleted'); setTimeout(() => setMsg(''), 3000);
    load();
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Applications <span style={{ color:'var(--text2)', fontSize:'1rem', fontWeight:400 }}>({total})</span></h1>
          <p>All job applications across the platform</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="search-bar">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); load(e.target.value, 1); }}>
            <option value="">All Statuses</option>
            {['pending','reviewing','shortlisted','hired','rejected'].map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          apps.length === 0 ? <div className="card empty-state"><h3>No applications found</h3></div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Applicant</th><th>Job</th><th>Status</th><th>Proposed Rate</th><th>Applied</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div style={{ fontWeight:600 }}>{a.applicant?.name}</div>
                        <div style={{ color:'var(--text3)', fontSize:'.78rem' }}>{a.applicant?.email}</div>
                      </td>
                      <td style={{ color:'var(--text2)', maxWidth:180 }}>{a.job?.title}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td style={{ color:'var(--text2)' }}>{a.proposedRate ? `$${a.proposedRate}` : '—'}</td>
                      <td style={{ color:'var(--text3)', fontSize:'.82rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteApp(a._id)}>🗑 Delete</button>
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
              <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => { setPage(p); load(status, p); }}>{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
