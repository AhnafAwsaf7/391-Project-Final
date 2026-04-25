import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [msg, setMsg]         = useState('');
  const [working, setWorking] = useState(null);

  const load = (s=search, r=role, p=page) => {
    setLoading(true);
    const params = new URLSearchParams({ limit:20, page:p });
    if (s) params.set('search', s);
    if (r) params.set('role', r);
    api.get(`/admin/users?${params}`).then(({ data }) => {
      setUsers(data.users);
      setTotal(data.total);
      setPages(Math.ceil(data.total / 20));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const toggleBlock = async (user) => {
    setWorking(user._id);
    try {
      const action = user.isBlocked ? 'unblock' : 'block';
      await api.put(`/admin/users/${user._id}/${action}`);
      flash(`User ${action}ed`);
      load();
    } finally { setWorking(null); }
  };

  const toggleFlag = async (user) => {
    setWorking(user._id + 'flag');
    try {
      const action = user.isFlagged ? 'unflag' : 'flag';
      await api.put(`/admin/users/${user._id}/${action}`, { reason: 'Flagged by admin' });
      flash(`User ${action}ged`);
      load();
    } finally { setWorking(null); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    setWorking(id);
    try {
      await api.delete(`/admin/users/${id}`);
      flash('User deleted');
      load();
    } finally { setWorking(null); }
  };

  const roleBadge = r => {
    const colours = { jobseeker:'var(--accent)', jobposter:'#ffd166', systemadmin:'var(--accent2)' };
    const labels  = { jobseeker:'Seeker', jobposter:'Poster', systemadmin:'Admin' };
    return <span style={{ padding:'.15rem .55rem', borderRadius:'99px', fontSize:'.75rem', fontWeight:700, background: colours[r]+'22', color: colours[r] }}>{labels[r] || r}</span>;
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Users <span style={{ color:'var(--text2)', fontSize:'1rem', fontWeight:400 }}>({total})</span></h1>
          <p>Manage all platform users</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="search-bar">
          <input placeholder="Search by name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); load(e.target.value, role, 1); }} />
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); load(search, e.target.value, 1); }}>
            <option value="">All Roles</option>
            <option value="jobseeker">Job Seeker</option>
            <option value="jobposter">Job Poster</option>
            <option value="systemadmin">Admin</option>
          </select>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                        <span style={{ fontWeight:600 }}>{u.name}</span>
                        {u.isFlagged && <span style={{ background:'#ff4d6d22', color:'#ff4d6d', borderRadius:'99px', padding:'.1rem .45rem', fontSize:'.7rem', fontWeight:700 }}>🚩</span>}
                      </div>
                    </td>
                    <td style={{ color:'var(--text2)' }}>{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap' }}>
                        {u.isBlocked && <span className="badge badge-closed">Blocked</span>}
                        {u.isFlagged && <span className="badge badge-rejected">Flagged</span>}
                        {!u.isBlocked && !u.isFlagged && <span className="badge badge-open">Active</span>}
                      </div>
                    </td>
                    <td style={{ color:'var(--text3)', fontSize:'.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                        {u.role === 'jobseeker' && (
                          <Link to={`/admin/seekers/${u._id}/history`} className="btn btn-secondary btn-sm">
                            📋 History
                          </Link>
                        )}
                        <button
                          className={`btn btn-sm ${u.isFlagged ? 'btn-success' : 'btn-secondary'}`}
                          disabled={working === u._id + 'flag' || u.role === 'systemadmin'}
                          onClick={() => toggleFlag(u)}
                        >{u.isFlagged ? '✅ Unflag' : '🚩 Flag'}</button>
                        <button
                          className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-secondary'}`}
                          disabled={working === u._id || u.role === 'systemadmin'}
                          onClick={() => toggleBlock(u)}
                        >{u.isBlocked ? '🔓 Unblock' : '🔒 Block'}</button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={working === u._id || u.role === 'systemadmin'}
                          onClick={() => deleteUser(u._id)}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i+1).map(p => (
              <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => { setPage(p); load(search, role, p); }}>{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}