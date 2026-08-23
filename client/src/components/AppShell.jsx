import {useEffect,useMemo,useState} from 'react';
import {NavLink,useLocation,useNavigate} from 'react-router-dom';
import {tenantApi,default as api} from '../api';

const groups=[
  {label:'Workspace',items:[['Overview','/'],['Operations Hub','/operations']]},
  {label:'Projects',items:[['Projects & BOQs','/construction']]},
  {label:'Finance',items:[['Finance & Procurement','/finance'],['Payroll','/payroll']]},
  {label:'People',items:[['Workforce','/hr']]},
  {label:'Compliance',items:[['Safety & Quality','/safety-quality'],['Documents & Reports','/documents-reporting']]},
  {label:'Assets',items:[['Equipment & Inventory','/equipment-inventory']]},
  {label:'Administration',items:[['Company Administration','/admin'],['Platform Companies','/superadmin/companies', ['superadmin']]]}
];

function decodeRole(){
  try{
    const token=localStorage.getItem('accessToken');
    if(!token)return 'workspace-user';
    const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    return String(payload.role||'workspace-user').toLowerCase();
  }catch{return 'workspace-user'}
}

export default function AppShell({children}){
  const [open,setOpen]=useState(false);
  const [workspace,setWorkspace]=useState(null);
  const [health,setHealth]=useState({status:'checking',database:'checking'});
  const [noticeOpen,setNoticeOpen]=useState(false);
  const location=useLocation();
  const navigate=useNavigate();
  const role=useMemo(decodeRole, [location.pathname]);
  const isSuperadmin=role==='superadmin';
  const isAdmin=isSuperadmin||['admin','tenant_admin','tenant-admin'].includes(role);

  useEffect(()=>{
    let active=true;
    tenantApi.me().then(r=>{if(active)setWorkspace(r.data?.data||null)}).catch(()=>{});
    api.get('/health').then(r=>{if(active)setHealth(r.data||{})}).catch(()=>{if(active)setHealth({status:'unavailable',database:'unavailable'})});
    return()=>{active=false};
  },[location.pathname]);

  const visibleGroups=groups.map(group=>({...group,items:group.items.filter(([, ,roles])=>!roles||roles.includes(role))})).filter(group=>group.items.length);
  const workspaceName=workspace?.name||workspace?.tenant?.name||'Current Workspace';
  const roleLabel=role.replace(/[_-]/g,' ');
  const healthy=health.status==='healthy'&&health.database==='connected';

  const logout=()=>{localStorage.removeItem('accessToken');localStorage.removeItem('refreshToken');navigate('/');window.location.reload()};

  return <div className="app-frame">
    {open&&<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setOpen(false)}/>} 
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="brand-block">
        <NavLink to="/" className="brand" onClick={()=>setOpen(false)}><span className="brand-mark">B</span><span><strong>BUILD-OWN</strong><small>Construction OS</small></span></NavLink>
        <button className="sidebar-close" aria-label="Close navigation" onClick={()=>setOpen(false)}>×</button>
      </div>
      <div className="workspace-switcher">
        <span className="workspace-dot"/><div><small>Workspace</small><strong>{workspaceName}</strong></div>
      </div>
      <nav className="sidebar-nav">
        {visibleGroups.map(group=><section key={group.label} className="nav-group"><p>{group.label}</p>{group.items.map(([label,to])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><span className="nav-icon" aria-hidden="true">{label.slice(0,1)}</span><span>{label}</span></NavLink>)}</section>)}
      </nav>
      <div className="sidebar-footer">
        <div className={`system-mini ${healthy?'healthy':'degraded'}`}><span className="status-dot"/><div><strong>{healthy?'System healthy':'Check system status'}</strong><small>API · {health.database||'unknown'}</small></div></div>
        <button className="logout-button" onClick={logout}>Sign out</button>
      </div>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={()=>setOpen(true)}>☰</button><div><span className="topbar-kicker">Construction Operations</span><strong>{workspaceName}</strong></div></div>
        <div className="topbar-actions">
          <button className="notification-button" aria-label="Open notifications" onClick={()=>setNoticeOpen(value=>!value)}><span className="notification-bell">●</span><span className="notification-count">1</span></button>
          <div className="role-chip"><span className="avatar">{roleLabel.slice(0,1).toUpperCase()}</span><span><strong>{roleLabel}</strong><small>{isSuperadmin?'Platform access':isAdmin?'Administrative access':'Workspace access'}</small></span></div>
        </div>
        {noticeOpen&&<div className="notification-panel"><div className="notification-head"><strong>Notifications</strong><button onClick={()=>setNoticeOpen(false)}>×</button></div><div className="notification-item"><span className="notice-icon success">✓</span><div><strong>System status</strong><p>{healthy?'API and database are healthy.':'The API health check needs attention.'}</p></div></div><div className="notification-item"><span className="notice-icon">i</span><div><strong>Tenant isolation</strong><p>Workspace routes remain scoped through the existing backend authorization layer.</p></div></div></div>}
      </header>
      <main className="route-content">{children}</main>
    </div>
  </div>;
}
