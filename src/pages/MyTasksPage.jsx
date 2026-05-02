import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './ProjectsPage.css';
import { useAuth } from '../contexts/AuthContext';

const STATUSES = ['todo','in-progress','review','done'];

function UpdateModal({ task, onClose, onSave, isAdmin, projects, users }) {
  const [form, setForm] = useState(() => ({
    title: task.title || '',
    description: task.description || '',
    status: task.status, progress: task.progress, notes: task.notes||'',
    priority: task.priority || 'medium',
    assignedTo: task.assignedTo?._id || task.assignedTo || '',
    dueDate: task.dueDate || ''
  }));
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = isAdmin ? {
        title: form.title, description: form.description, priority: form.priority,
        assignedTo: form.assignedTo || null, dueDate: form.dueDate, status: form.status, progress: form.progress, notes: form.notes
      } : { status: form.status, progress: form.progress, notes: form.notes };
      const { data } = await api.put(`/tasks/${task._id}`, payload);
      onSave(data);
      toast.success('Task updated');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Update Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isAdmin && (
              <>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="critical">critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={form.assignedTo||''} onChange={e=>set('assignedTo',e.target.value)}>
                      <option value="">Unassigned</option>
                      {users?.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate?.slice(0,10)||''} onChange={e=>set('dueDate',e.target.value)} />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Progress: {form.progress}%</label>
              <input type="range" min={0} max={100} step={5} value={form.progress}
                onChange={e=>set('progress',Number(e.target.value))}
                style={{width:'100%',accentColor:'var(--accent)',cursor:'pointer'}} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Add notes or blockers..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [newTaskModal, setNewTaskModal] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isAdmin) {
      Promise.all([api.get('/tasks'), api.get('/projects'), api.get('/users')])
        .then(([t, p, u]) => { setTasks(t.data); setProjects(p.data); setUsers(u.data); })
        .finally(() => setLoading(false));
    } else {
      api.get('/tasks/my').then(r => setTasks(r.data)).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleSave = (saved) => setTasks(p => p.map(x => x._id === saved._id ? saved : x));

  const handleCreate = (saved) => setTasks(p => [saved, ...p]);

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(p => p.filter(x => x._id !== taskId));
      toast.success('Task deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} assigned tasks</p>
        </div>
        {isAdmin && <div style={{marginLeft:12}}>
          <button className="btn btn-primary" onClick={() => setNewTaskModal('new')}>+ New Task</button>
        </div>}
      </div>

      <div className="filter-tabs" style={{marginBottom:20}}>
        {['all',...STATUSES].map(s => (
          <button key={s} className={`filter-tab ${filter===s?'active':''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">No tasks here</div>
          <div className="empty-desc">Tasks assigned to you will appear here</div>
        </div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{task.title}</div>
                      {task.notes && <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{task.notes.slice(0,60)}{task.notes.length>60?'…':''}</div>}
                    </td>
                    <td>
                      {task.project ? (
                        <Link to={`/projects/${task.project._id}`} style={{color:'var(--accent-light)',fontSize:13}}>
                          {task.project.name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td><span className={`badge badge-${task.status}`}>{task.status}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8,minWidth:80}}>
                        <div className="progress-bar-wrap" style={{flex:1}}><div className="progress-bar-fill" style={{width:`${task.progress}%`}} /></div>
                        <span style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',minWidth:28}}>{task.progress}%</span>
                      </div>
                    </td>
                    <td style={{fontSize:12,color: task.dueDate && new Date(task.dueDate) < new Date() ? 'var(--red)' : 'var(--text-muted)'}}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditTask(task)}>Update</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editTask && <UpdateModal task={editTask} onClose={() => setEditTask(null)} onSave={handleSave} isAdmin={isAdmin} projects={projects} users={users} />}

      {newTaskModal && (
        <NewTaskModal
          projects={projects}
          users={users}
          onClose={() => setNewTaskModal(null)}
          onSave={(data) => { handleCreate(data); setNewTaskModal(null); }}
        />
      )}
    </div>
  );
}

function NewTaskModal({ projects, users, onClose, onSave }) {
  const [form, setForm] = useState({ title:'', description:'', project: projects[0]?._id || '', priority: 'medium', assignedTo:'', dueDate:'', status:'todo' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tasks', form);
      onSave(data);
      toast.success('Task created');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-select" value={form.project} onChange={e=>set('project',e.target.value)} required>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assignedTo} onChange={e=>set('assignedTo',e.target.value)}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate?.slice(0,10)||''} onChange={e=>set('dueDate',e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
