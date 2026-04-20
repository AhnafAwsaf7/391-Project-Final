import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

const CATEGORIES = ['','technology','design','writing','marketing','finance','legal','engineering','other'];
const TYPES      = ['','full-time','part-time','contract','freelance','internship'];

export default function BrowseJobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search:'', category:'', type:'', page:1 });
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);

  const load = (f = filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.search)   params.set('search',   f.search);
    if (f.category) params.set('category', f.category);
    if (f.type)     params.set('type',     f.type);
    params.set('page', f.page);
    params.set('limit', '12');
    api.get(`/jobs?${params}`).then(({ data }) => {
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setFilter = (key, val) => {
    const updated = { ...filters, [key]: val, page: 1 };
    setFilters(updated); load(updated);
  };
  const setPage = (p) => {
    const updated = { ...filters, page: p };
    setFilters(updated); load(updated);
  };

  const budgetLabel = job =>
    job.budget?.type === 'hourly'
      ? `$${job.budget.min}–$${job.budget.max}/hr`
      : `$${job.budget?.min?.toLocaleString()}–$${job.budget?.max?.toLocaleString()}`;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Browse Jobs</h1>
          <p>{total} jobs available — find your next opportunity</p>
        </div>

        <div className="search-bar">
          <input
            placeholder="Search jobs by title or keyword…"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <select value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="card empty-state">
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="grid-2">
              {jobs.map(job => (
                <Link key={job._id} to={`/seeker/jobs/${job._id}`} style={{ textDecoration:'none' }}>
                  <div className="card card-hover job-card">
                    <div className="job-card-header">
                      <div>
                        <div className="job-card-title">{job.title}</div>
                        <div className="job-card-meta">
                          <span>🏢 {job.poster?.name}</span>
                          <span style={{ textTransform:'capitalize' }}>📁 {job.category}</span>
                          <span>📍 {job.location}</span>
                        </div>
                      </div>
                      <span className={`badge badge-${job.status}`}>{job.status}</span>
                    </div>
                    <p style={{ color:'var(--text2)', fontSize:'.85rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {job.description}
                    </p>
                    <div className="job-card-skills">
                      {job.skills?.map(s=><span key={s._id} className="skill-tag">{s.name}</span>)}
                    </div>
                    <div className="job-card-footer">
                      <span style={{ color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-head)' }}>
                        {budgetLabel(job)}
                      </span>
                      <span style={{ color:'var(--text3)', fontSize:'.78rem', textTransform:'capitalize' }}>{job.type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
