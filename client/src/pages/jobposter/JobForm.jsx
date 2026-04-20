import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios';

const EMPTY = {
  title:'', description:'', type:'freelance', category:'technology',
  location:'Remote', remote:true, deadline:'',
  budget: { type:'fixed', min:'', max:'', currency:'USD' },
  skills: [],
};

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [allSkills, setAllSkills] = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    api.get('/skills').then(({ data }) => setAllSkills(data.skills));
    if (isEdit) {
      api.get(`/jobs/${id}`).then(({ data }) => {
        const j = data.job;
        setForm({
          title: j.title, description: j.description, type: j.type,
          category: j.category, location: j.location, remote: j.remote,
          deadline: j.deadline ? j.deadline.slice(0,10) : '',
          budget: { ...j.budget, min: j.budget.min||'', max: j.budget.max||'' },
          skills: j.skills.map(s => s._id),
        });
      }).finally(() => setFetching(false));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBudget = (key, val) => setForm(f => ({ ...f, budget: { ...f.budget, [key]: val } }));

  const toggleSkill = (skillId) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skillId) ? f.skills.filter(s => s !== skillId) : [...f.skills, skillId],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        budget: { ...form.budget, min: Number(form.budget.min), max: Number(form.budget.max) },
      };
      if (isEdit) await api.put(`/jobs/${id}`, payload);
      else        await api.post('/jobs', payload);
      navigate('/poster/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="page-wrapper"><Sidebar /><main className="main-content"><div className="spinner-wrap"><div className="spinner" /></div></main></div>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
          <p>{isEdit ? 'Update your job listing details' : 'Describe the role and find the right talent'}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'1.5rem', alignItems:'start' }}>
            {/* Left column */}
            <div>
              <div className="card" style={{ marginBottom:'1.25rem' }}>
                <h3 className="section-title">Job Details</h3>
                <div className="form-group">
                  <label>Job Title *</label>
                  <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Senior React Developer" required />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={6} placeholder="Describe the project, responsibilities, and requirements…" required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select value={form.type} onChange={e=>set('type',e.target.value)}>
                      {['full-time','part-time','contract','freelance','internship'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e=>set('category',e.target.value)}>
                      {['technology','design','writing','marketing','finance','legal','engineering','other'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Remote, New York, London" />
                </div>
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input type="date" value={form.deadline} onChange={e=>set('deadline',e.target.value)} />
                </div>
              </div>

              <div className="card">
                <h3 className="section-title">Budget</h3>
                <div className="form-group">
                  <label>Budget Type</label>
                  <select value={form.budget.type} onChange={e=>setBudget('type',e.target.value)}>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                  <div className="form-group">
                    <label>Min (USD)</label>
                    <input type="number" value={form.budget.min} onChange={e=>setBudget('min',e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Max (USD)</label>
                    <input type="number" value={form.budget.max} onChange={e=>setBudget('max',e.target.value)} placeholder="0" min="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column – Skills */}
            <div>
              <div className="card">
                <h3 className="section-title">Required Skills</h3>
                <p style={{ color:'var(--text2)', fontSize:'.85rem', marginBottom:'1rem' }}>
                  Selected: {form.skills.length} skill{form.skills.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
                  {allSkills.map(s => (
                    <button
                      key={s._id} type="button"
                      onClick={() => toggleSkill(s._id)}
                      style={{
                        padding:'.3rem .8rem', borderRadius:'99px', cursor:'pointer',
                        border:`1px solid ${form.skills.includes(s._id) ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.skills.includes(s._id) ? 'var(--accent)' : 'var(--bg3)',
                        color: form.skills.includes(s._id) ? '#fff' : 'var(--text2)',
                        fontSize:'.82rem', fontWeight:600, transition:'all var(--transition)',
                        textTransform:'capitalize', fontFamily:'var(--font-body)',
                      }}
                    >{s.name}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Job' : 'Post Job'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/poster/jobs')}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}
