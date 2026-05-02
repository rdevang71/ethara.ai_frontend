import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './ProjectDetailPage.css';

const TASK_STATUSES = ['todo','in-progress','review','done'];
const PRIORITIES = ['low','medium','high','critical'];

function TaskModal({ task, projectId, users, onClose, onSave, isAdmin }) {
  const { user } = useAuth();
  const [form, setForm] = useState(task || {
    title:'', description:'', status:'todo', priority:'medium', assignedTo:'', dueDate:'', progress:0
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (task?._id) {
        ({ data } = await api.put(`/tasks/${task._id}`, form));
      } else {
        ({ data } = await api.post(`/projects/${projectId}/tasks`, form));
      }
      onSave(data, task ? 'edit' : 'add');
      toast.success(task ? 'Task updated' : 'Task created');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isAdmin && <>
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
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-select" value={form.assignedTo||''} onChange={e=>set('assignedTo',e.target.value)}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate?.slice(0,10)||''} onChange={e=>set('dueDate',e.target.value)} />
              </div>
            </>}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Progress: {form.progress}%</label>
              <input type="range" min={0} max={100} step={5} value={form.progress}
                onChange={e=>set('progress',Number(e.target.value))} className="progress-slider" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Add notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{task ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
    ]).then(([p, t]) => {
      setProject(p.data);
      setTasks(t.data);
      setMembers(p.data.team?.members || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleTaskSave = (saved, mode) => {
    if (mode === 'add') setTasks(p => [...p, saved]);
    else setTasks(p => p.map(x => x._id === saved._id ? saved : x));
    // Refresh project progress
    api.get(`/projects/${id}`).then(r => setProject(r.data));
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(p => p.filter(x => x._id !== taskId));
      api.get(`/projects/${id}`).then(r => setProject(r.data));
      toast.success('Task deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" /></div>;
  if (!project) return <div className="empty-state"><div className="empty-title">Project not found</div></div>;

  const tasksByCol = TASK_STATUSES.map(s => ({
    status: s,
    tasks: tasks.filter(t => t.status === s)
  }));

  const myTasks = tasks.filter(t => String(t.assignedTo?._id) === String(user?._id));

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/projects" className="btn btn-ghost btn-sm">← Back</Link>
          <div>
            <h1 className="page-title">{project.name}</h1>
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
              <span className={`badge badge-${project.priority}`}>{project.priority}</span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setTaskModal('new')}>+ Add Task</button>
        )}
      </div>

      {project.description && (
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:20}}>{project.description}</p>
      )}

      <div className="project-meta">
        <div className="meta-item">
          <span className="meta-label">Progress</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div className="progress-bar-wrap" style={{width:120}}><div className="progress-bar-fill" style={{width:`${project.progress}%`}} /></div>
            <span style={{fontWeight:600,fontSize:13}}>{project.progress}%</span>
          </div>
        </div>
        {project.team && <div className="meta-item"><span className="meta-label">Team</span><span>{project.team.name}</span></div>}
        {project.dueDate && <div className="meta-item"><span className="meta-label">Due</span><span>{new Date(project.dueDate).toLocaleDateString()}</span></div>}
        <div className="meta-item">
          <span className="meta-label">Members</span>
          <div className="assigned-avatars">
            {project.assignedTo?.slice(0,5).map(u => (
              <div key={u._id} className="mini-avatar" title={u.name}>{u.name?.charAt(0)}</div>
            ))}
          </div>
        </div>
      </div>

      {!isAdmin && myTasks.length > 0 && (
        <div className="my-tasks-banner">
          <span style={{fontWeight:600}}>Your tasks on this project:</span>
          <span style={{color:'var(--text-muted)'}}>{myTasks.length} task{myTasks.length>1?'s':''}</span>
        </div>
      )}

      <div className="kanban-board">
        {tasksByCol.map(col => (
          <div key={col.status} className="kanban-col">
            <div className="kanban-header">
              <span className={`badge badge-${col.status}`}>{col.status}</span>
              <span className="kanban-count">{col.tasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {col.tasks.map(task => {
                const canEdit = isAdmin || String(task.assignedTo?._id) === String(user?._id);
                return (
                  <div key={task._id} className="task-card">
                    <div className="task-card-header">
                      <div className="task-card-title">{task.title}</div>
                      <div style={{display:'flex',gap:4}}>
                        {canEdit && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setTaskModal(task)}>✎</button>}
                        {isAdmin && <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTask(task._id)}>✕</button>}
                      </div>
                    </div>
                    {task.description && <p className="task-card-desc">{task.description}</p>}
                    <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.dueDate && <span style={{fontSize:11,color:'var(--text-muted)'}}>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                    <div style={{marginTop:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                        <span style={{color:'var(--text-muted)'}}>Progress</span>
                        <span style={{fontWeight:600}}>{task.progress}%</span>
                      </div>
                      <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${task.progress}%`}} /></div>
                    </div>
                    {task.assignedTo && (
                      <div className="task-assignee">
                        <div className="mini-avatar" style={{width:20,height:20,fontSize:8}}>{task.assignedTo.name?.charAt(0)}</div>
                        <span style={{fontSize:11,color:'var(--text-secondary)'}}>{task.assignedTo.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {col.tasks.length === 0 && (
                <div style={{padding:'20px 0',textAlign:'center',color:'var(--text-muted)',fontSize:12}}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          projectId={id}
          users={members}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
