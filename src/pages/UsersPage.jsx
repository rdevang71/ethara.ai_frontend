import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function EditUserModal({ user: editUser, teams, onClose, onSave }) {
  const [form, setForm] = useState({
    name: editUser.name, email: editUser.email,
    role: editUser.role, isActive: editUser.isActive,
    team: editUser.team?._id || editUser.team || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/users/${editUser._id}`, form);
      onSave(data);
      toast.success('User updated');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit User</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.value==='true'}))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select className="form-select" value={form.team} onChange={e=>setForm(p=>({...p,team:e.target.value}))}>
                <option value="">No team</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/teams')]).then(([u, t]) => {
      setUsers(u.data); setTeams(t.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (id === me._id) return toast.error("You can't delete yourself");
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(p => p.filter(x => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleSave = (saved) => setUsers(p => p.map(x => x._id === saved._id ? saved : x));

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?';

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div style={{marginBottom:20}}>
        <input className="form-input" placeholder="Search users…" value={search}
          onChange={e=>setSearch(e.target.value)} style={{maxWidth:320}} />
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{
                        width:34,height:34,borderRadius:'50%',flexShrink:0,
                        background:'linear-gradient(135deg, var(--accent), var(--purple))',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:11,fontWeight:700,color:'#fff'
                      }}>{initials(u.name)}</div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{u.name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',
                      color: u.role==='admin' ? 'var(--accent-light)' : 'var(--text-secondary)'
                    }}>{u.role}</span>
                  </td>
                  <td>{u.team ? (
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:u.team.color||'var(--accent)'}} />
                      <span style={{fontSize:13}}>{u.team.name}</span>
                    </div>
                  ) : <span style={{color:'var(--text-muted)',fontSize:12}}>—</span>}</td>
                  <td>
                    <span style={{
                      fontSize:11,fontWeight:600,
                      color: u.isActive ? 'var(--green)' : 'var(--red)',
                      background: u.isActive ? 'var(--green-bg)' : 'var(--red-bg)',
                      padding:'2px 8px',borderRadius:100
                    }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>Edit</button>
                      {u._id !== me._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <EditUserModal user={editUser} teams={teams} onClose={() => setEditUser(null)} onSave={handleSave} />
      )}
    </div>
  );
}
