import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './TeamsPage.css';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

function TeamModal({ team, allUsers, onClose, onSave }) {
  const [form, setForm] = useState(team
    ? { name: team.name, description: team.description || '', color: team.color, members: team.members.map(m => m._id || m) }
    : { name: '', description: '', color: COLORS[0], members: [] }
  );
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleMember = (id) => set('members', form.members.includes(id)
    ? form.members.filter(m => m !== id) : [...form.members, id]);

  const filteredUsers = allUsers
    .filter(u => u.role !== 'admin')
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (team?._id) {
        const { data } = await api.put(`/teams/${team._id}`, form);
        onSave(data, 'edit'); toast.success('Team updated');
      } else {
        const { data } = await api.post('/teams', form);
        onSave(data, 'add'); toast.success('Team created');
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving team'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{team ? 'Edit Team' : 'Create Team'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Team Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Frontend Team" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What does this team work on?" />
            </div>
            <div className="form-group">
              <label className="form-label">Team Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button key={c} type="button" className={`color-dot ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => set('color', c)} />
                ))}
              </div>
              <div className="color-preview" style={{ borderColor: form.color }}>
                <div className="color-preview-dot" style={{ background: form.color }} />
                <span style={{ color: form.color, fontWeight: 600 }}>{form.name || 'Team preview'}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Members
                <span className="member-count-badge">{form.members.length} selected</span>
              </label>
              <input className="form-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
              <div className="member-list">
                {filteredUsers.length === 0 && (
                  <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                    {allUsers.filter(u => u.role !== 'admin').length === 0 ? 'No users registered yet' : 'No users match search'}
                  </div>
                )}
                {filteredUsers.map(u => {
                  const selected = form.members.includes(u._id);
                  return (
                    <label key={u._id} className={`member-check ${selected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleMember(u._id)} />
                      <div className="member-av" style={{ background: selected ? form.color : 'var(--bg-card)' }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      </div>
                      {selected && <span className="check-tick">✓</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : team ? 'Update Team' : 'Create Team'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamDetailPanel({ team, allUsers, onClose, onUpdate, onDelete }) {
  const [tab, setTab] = useState('members');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState({ name: team.name, description: team.description || '', color: team.color });

  const memberIds = team.members.map(m => m._id || m);
  const nonMembers = allUsers.filter(u => u.role !== 'admin' && !memberIds.includes(u._id));
  const filteredNon = nonMembers.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()));

  const addMember = async (userId) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/teams/${team._id}`, { name: team.name, description: team.description, color: team.color, members: [...memberIds, userId] });
      onUpdate(data); toast.success('Member added');
    } catch { toast.error('Failed to add member'); }
    finally { setSaving(false); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/teams/${team._id}`, { name: team.name, description: team.description, color: team.color, members: memberIds.filter(id => id !== userId) });
      onUpdate(data); toast.success('Member removed');
    } catch { toast.error('Failed to remove member'); }
    finally { setSaving(false); }
  };

  const saveSettings = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put(`/teams/${team._id}`, { ...editForm, members: memberIds });
      onUpdate(data); toast.success('Settings saved');
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header" style={{ background: `${team.color}18`, borderBottom: `1px solid ${team.color}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="team-icon-lg" style={{ background: team.color }}>{team.name?.charAt(0)}</div>
            <div>
              <h2 className="modal-title">{team.name}</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{team.members?.length || 0} members</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="detail-tabs">
          {['members', 'settings'].map(t => (
            <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'members' ? '👥 Members' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {tab === 'members' && (
          <div className="modal-body">
            <div>
              <div className="section-label">Current Members ({team.members?.length || 0})</div>
              {team.members?.length === 0 ? (
                <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>No members yet. Add some below.</div>
              ) : (
                <div className="member-rows">
                  {team.members.map(m => (
                    <div key={m._id || m} className="member-row">
                      <div className="member-av-md" style={{ background: team.color }}>{m.name?.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeMember(m._id)} disabled={saving}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {nonMembers.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div className="section-label">Add Members</div>
                <input className="form-input" placeholder="Search users to add…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
                <div className="member-rows">
                  {filteredNon.map(u => (
                    <div key={u._id} className="member-row">
                      <div className="member-av-md" style={{ background: 'var(--bg-card)' }}>{u.name?.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => addMember(u._id)} disabled={saving}>+ Add</button>
                    </div>
                  ))}
                  {filteredNon.length === 0 && search && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No users match search</div>
                  )}
                </div>
              </div>
            )}
            {nonMembers.length === 0 && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--green-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--green)' }}>
                ✓ All available users are already in this team
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <form onSubmit={saveSettings}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Team Color</label>
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button key={c} type="button" className={`color-dot ${editForm.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setEditForm(p => ({ ...p, color: c }))} />
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--red-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,.25)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)', marginBottom: 6 }}>Danger Zone</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Deleting a team is permanent. All members will be unassigned.</div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(team._id)}>Delete This Team</button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [detailTeam, setDetailTeam] = useState(null);

  useEffect(() => {
    const reqs = [api.get('/teams')];
    if (isAdmin) reqs.push(api.get('/users'));
    Promise.all(reqs).then(([t, u]) => {
      setTeams(t.data);
      if (u) setAllUsers(u.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = (saved, mode) => {
    if (mode === 'add') setTeams(p => [saved, ...p]);
    else setTeams(p => p.map(x => x._id === saved._id ? saved : x));
  };

  const handleUpdate = (updated) => {
    setTeams(p => p.map(x => x._id === updated._id ? updated : x));
    setDetailTeam(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team? All members will be unassigned.')) return;
    try {
      await api.delete(`/teams/${id}`);
      setTeams(p => p.filter(x => x._id !== id));
      setDetailTeam(null);
      toast.success('Team deleted');
    } catch { toast.error('Failed to delete team'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  const myTeam = !isAdmin && user?.team ? teams.find(t => t._id === (user.team._id || user.team)) : null;
  const displayTeams = isAdmin ? teams : (myTeam ? [myTeam] : []);
  const unassigned = isAdmin ? allUsers.filter(u => u.role !== 'admin' && !u.team) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">{displayTeams.length} team{displayTeams.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setCreateModal(true)}>+ New Team</button>}
      </div>

      {isAdmin && (
        <div className="teams-summary">
          {[
            { num: teams.length, label: 'Teams' },
            { num: allUsers.filter(u => u.role !== 'admin').length, label: 'Total Users' },
            { num: allUsers.filter(u => u.role !== 'admin' && u.team).length, label: 'Assigned', color: 'var(--green)' },
            { num: unassigned.length, label: 'Unassigned', color: unassigned.length > 0 ? 'var(--yellow)' : 'var(--text-primary)' },
          ].map(s => (
            <div key={s.label} className="summary-stat">
              <span className="summary-num" style={s.color ? { color: s.color } : {}}>{s.num}</span>
              <span className="summary-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {displayTeams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">{isAdmin ? 'No teams yet' : 'You are not assigned to a team'}</div>
          <div className="empty-desc">{isAdmin ? 'Create your first team to get started' : 'Ask your admin to assign you to a team'}</div>
          {isAdmin && <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setCreateModal(true)}>+ Create First Team</button>}
        </div>
      ) : (
        <div className="grid-3">
          {displayTeams.map(team => (
            <div key={team._id} className="team-card">
              <div className="team-card-stripe" style={{ background: team.color }} />
              <div className="team-card-body">
                <div className="team-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="team-icon" style={{ background: team.color }}>{team.name?.charAt(0)}</div>
                    <div>
                      <div className="team-card-name">{team.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setDetailTeam(team)}>Manage</button>}
                </div>

                {team.description && <p className="team-desc">{team.description}</p>}

                <div className="team-members-grid">
                  {team.members?.slice(0, 4).map(m => (
                    <div key={m._id || m} className="team-member-chip">
                      <div className="team-member-av" style={{ background: team.color }}>{m.name?.charAt(0)}</div>
                      <span className="team-member-name">{m.name?.split(' ')[0]}</span>
                    </div>
                  ))}
                  {team.members?.length > 4 && <div className="team-member-chip more">+{team.members.length - 4}</div>}
                  {(!team.members || team.members.length === 0) && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No members yet</div>
                  )}
                </div>

                {isAdmin && (
                  <div className="team-card-footer">
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setDetailTeam(team)}>👥 Manage Members</button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(team._id)} title="Delete">✕</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && unassigned.length > 0 && (
        <div className="card" style={{ marginTop: 28 }}>
          <div className="card-header">
            <h3 className="card-title">⚠️ Unassigned Users</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unassigned.length} user{unassigned.length !== 1 ? 's' : ''} not in any team</span>
          </div>
          <div className="unassigned-grid">
            {unassigned.map(u => (
              <div key={u._id} className="unassigned-chip">
                <div className="member-av-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{u.name?.charAt(0).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {createModal && <TeamModal allUsers={allUsers} onClose={() => setCreateModal(false)} onSave={handleSave} />}
      {detailTeam && <TeamDetailPanel team={detailTeam} allUsers={allUsers} onClose={() => setDetailTeam(null)} onUpdate={handleUpdate} onDelete={handleDelete} />}
    </div>
  );
}
