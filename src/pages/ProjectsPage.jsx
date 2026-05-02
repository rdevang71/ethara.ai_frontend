import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './ProjectsPage.css';

const STATUSES = ['planning','active','on-hold','completed'];
const PRIORITIES = ['low','medium','high','critical'];

function ProjectModal({ project, teams, users, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (!project) return { name:'', description:'', status:'planning', priority:'medium', team:'', assignedTo:[], startDate:'', dueDate:'' };
    return {
      ...project,
      team: project.team?._id || project.team || '',
      assignedTo: (project.assignedTo || []).map(a => (a._id || a))
    };
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleUser = (id) => set('assignedTo', form.assignedTo.includes(id)
    ? form.assignedTo.filter(u => u !== id)
    : [...form.assignedTo, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, assignedTo: (form.assignedTo || []).map(a => (a._id || a)) };
      if (project?._id) {
        const { data } = await api.put(`/projects/${project._id}`, payload);
        onSave(data, 'edit');
      } else {
        const { data } = await api.post('/projects', payload);
        onSave(data, 'add');
      }
      toast.success(project ? 'Project updated' : 'Project created');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    }
  };

  const selectedTeam = teams.find(t => t._id === form.team);
  const teamMembers = users.filter(u => selectedTeam?.members.some(m => (m._id||m) === u._id));

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Team *</label>
              <select className="form-select" value={form.team} onChange={e=>set('team',e.target.value)} required>
                <option value="">Select team</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            {form.team && teamMembers.length > 0 && (
              <div className="form-group">
                <label className="form-label">Assign Members</label>
                <div className="member-list">
                  {teamMembers.map(u => (
                    <label key={u._id} className="member-check">
                      <input type="checkbox" checked={form.assignedTo.includes(u._id)}
                        onChange={() => toggleUser(u._id)} />
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate?.slice(0,10)||''} onChange={e=>set('startDate',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate?.slice(0,10)||''} onChange={e=>set('dueDate',e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{project ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | project obj
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const reqs = [api.get('/projects'), api.get('/teams')];
    if (isAdmin) reqs.push(api.get('/users'));
    Promise.all(reqs).then(([p, t, u]) => {
      setProjects(p.data); setTeams(t.data);
      if (u) setUsers(u.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = (saved, mode) => {
    if (mode === 'add') setProjects(p => [saved, ...p]);
    else setProjects(p => p.map(x => x._id === saved._id ? saved : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal('new')}>+ New Project</button>}
      </div>

      <div className="filter-tabs" style={{marginBottom:20}}>
        {['all',...STATUSES].map(s => (
          <button key={s} className={`filter-tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects found</div>
          {isAdmin && <div className="empty-desc">Create your first project to get started</div>}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => (
            <div key={p._id} className="project-card">
              <div className="project-card-header">
                <div>
                  <div className="project-card-name">{p.name}</div>
                  <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                    <span className={`badge badge-${p.priority}`}>{p.priority}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="project-card-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(p)} title="Edit">✎</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(p._id)} title="Delete">✕</button>
                  </div>
                )}
              </div>

              {p.description && <p className="project-card-desc">{p.description}</p>}

              <div style={{marginTop:'auto'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12}}>
                  <span style={{color:'var(--text-muted)'}}>Progress</span>
                  <span style={{fontWeight:600,color:'var(--text-primary)'}}>{p.progress}%</span>
                </div>
                <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${p.progress}%`}} /></div>
              </div>

              {p.team && (
                <div style={{marginTop:12,display:'flex',alignItems:'center',gap:6}}>
                  <div className="team-dot" style={{background: p.team.color || 'var(--accent)'}} />
                  <span style={{fontSize:12,color:'var(--text-secondary)'}}>{p.team.name}</span>
                </div>
              )}

              <div className="project-card-footer">
                {p.assignedTo?.length > 0 && (
                  <div className="assigned-avatars">
                    {p.assignedTo.slice(0,3).map(u => (
                      <div key={u._id} className="mini-avatar" title={u.name}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {p.assignedTo.length > 3 && <div className="mini-avatar">+{p.assignedTo.length-3}</div>}
                  </div>
                )}
                <Link to={`/projects/${p._id}`} className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}>View →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal === 'new' ? null : modal}
          teams={teams}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
