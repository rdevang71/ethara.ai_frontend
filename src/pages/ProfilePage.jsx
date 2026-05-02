import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'U';

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile/me', form);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="grid-2" style={{alignItems:'start'}}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Personal Info</h3></div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,padding:'0 0 20px',borderBottom:'1px solid var(--border)'}}>
            <div style={{
              width:64,height:64,borderRadius:'50%',flexShrink:0,
              background:'linear-gradient(135deg, var(--accent), var(--purple))',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:22,fontWeight:700,color:'#fff',
              boxShadow:'var(--shadow-accent)'
            }}>{initials}</div>
            <div>
              <div style={{fontWeight:700,fontSize:18,color:'var(--text-primary)'}}>{user?.name}</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>{user?.email}</div>
              <div style={{
                marginTop:6,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',
                color: user?.role==='admin' ? 'var(--accent-light)' : 'var(--text-secondary)'
              }}>{user?.role}</div>
            </div>
          </div>

          <form onSubmit={handleProfile} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{opacity:.5,cursor:'not-allowed'}} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Account Details</h3></div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[
              { label: 'Account ID', value: user?._id, mono: true },
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—' },
              { label: 'Role', value: user?.role === 'admin' ? '🔑 Administrator' : '👤 Team Member' },
              { label: 'Team', value: user?.team?.name || 'Not assigned' },
              { label: 'Status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
            ].map(item => (
              <div key={item.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',color:'var(--text-muted)'}}>{item.label}</span>
                <span style={{fontSize:13,color:'var(--text-secondary)',fontFamily: item.mono ? 'var(--font-mono)' : 'inherit', fontSize: item.mono ? 11 : 13}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
