import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './DashboardPage.css';

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card" style={{ '--card-accent': color }}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
    <div className="stat-bar" />
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects').then(r => r.data),
      api.get('/tasks/my').then(r => r.data),
      api.get('/teams').then(r => r.data),
    ]).then(([p, t, te]) => {
      setProjects(p); setTasks(t); setTeams(te);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" /></div>;

  const tasksByStatus = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, fill: '#50596e' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, fill: '#3b82f6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, fill: '#f59e0b' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, fill: '#22c55e' },
  ];

  const projectProgress = projects.slice(0, 5).map(p => ({ name: p.name.slice(0,14), progress: p.progress }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good to see you, {user?.name} 👋</p>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:24}}>
        <StatCard label="Total Projects" value={projects.length} sub={`${projects.filter(p=>p.status==='active').length} active`} color="var(--accent)" />
        <StatCard label="My Tasks" value={tasks.length} sub={`${tasks.filter(t=>t.status==='done').length} done`} color="var(--green)" />
        <StatCard label="Teams" value={teams.length} color="var(--purple)" />
        <StatCard label="Avg Progress" value={`${projects.length ? Math.round(projects.reduce((s,p)=>s+p.progress,0)/projects.length) : 0}%`} color="var(--yellow)" />
      </div>

      <div className="grid-2" style={{marginBottom:24}}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Task Distribution</h3></div>
          {tasks.length === 0 ? <div className="empty-state"><div className="empty-desc">No tasks yet</div></div> : (
            <div style={{height:220}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByStatus} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,fontSize:12,color:'var(--text-primary)'}} cursor={{fill:'var(--bg-hover)'}} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {tasksByStatus.map((entry, i) => <rect key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Project Progress</h3></div>
          {projectProgress.length === 0 ? <div className="empty-state"><div className="empty-desc">No projects yet</div></div> : (
            <div style={{height:220}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgress} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{fill:'var(--text-secondary)',fontSize:11}} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,fontSize:12,color:'var(--text-primary)'}} />
                  <Bar dataKey="progress" fill="var(--accent)" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Projects</h3>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {projects.length === 0 ? <div className="empty-state"><div className="empty-desc">No projects assigned</div></div> : (
            <div className="project-list">
              {projects.slice(0,4).map(p => (
                <Link to={`/projects/${p._id}`} key={p._id} className="project-row">
                  <div>
                    <div className="project-row-name">{p.name}</div>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                  <div style={{textAlign:'right',minWidth:80}}>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',marginBottom:4}}>{p.progress}%</div>
                    <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${p.progress}%`}} /></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Tasks</h3>
            <Link to="/my-tasks" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {tasks.length === 0 ? <div className="empty-state"><div className="empty-desc">No tasks assigned</div></div> : (
            <div className="task-list">
              {tasks.slice(0,5).map(t => (
                <div key={t._id} className="task-row">
                  <div className={`task-dot status-${t.status}`} />
                  <div style={{flex:1,minWidth:0}}>
                    <div className="task-row-title truncate">{t.title}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{t.project?.name}</div>
                  </div>
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
