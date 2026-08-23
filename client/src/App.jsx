import {BrowserRouter,Link,Route,Routes} from 'react-router-dom';
import {useEffect,useState} from 'react';
import {tenantApi,default as api} from './api';
import AppShell from './components/AppShell';
import ConstructionCore from './ConstructionCore';
import FinanceProcurement from './FinanceProcurement';
import HRWorkforce from './HRWorkforce';
import Payroll from './Payroll';
import OperationsHub from './pages/OperationsHub';
import SafetyQualityManagement from './pages/SafetyQualityManagement';
import DocumentsReporting from './pages/DocumentsReporting';
import TenantAdmin from './pages/TenantAdmin';
import EquipmentInventory from './EquipmentInventory';
import './index.css';

const modules=[
  ['Projects','Projects, contracts, BOQs and budgets','/construction','Projects'],
  ['Finance','Budgets, procurement and approvals','/finance','Finance'],
  ['Workforce','HR, attendance and workforce','/hr','People'],
  ['Payroll','Payroll runs and compensation','/payroll','Finance'],
  ['Safety & Quality','Incidents, inspections and corrective actions','/safety-quality','Compliance'],
  ['Documents','Documents, reports and records','/documents-reporting','Compliance'],
  ['Equipment','Equipment and inventory control','/equipment-inventory','Assets'],
  ['Administration','Tenant administration and settings','/admin','Administration']
];

function Dashboard(){
  const [tenant,setTenant]=useState(null);
  const [health,setHealth]=useState({status:'checking',database:'checking'});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    Promise.allSettled([tenantApi.me(),api.get('/health')]).then(([tenantResult,healthResult])=>{
      if(!active)return;
      if(tenantResult.status==='fulfilled')setTenant(tenantResult.value.data?.data||null);
      if(healthResult.status==='fulfilled')setHealth(healthResult.value.data||{});
      setLoading(false);
    });
    return()=>{active=false};
  },[]);
  const healthy=health.status==='healthy'&&health.database==='connected';
  const workspaceName=tenant?.name||tenant?.tenant?.name||'Current Workspace';
  return <main className="shell dashboard-page">
    <section className="executive-hero">
      <div className="executive-copy">
        <span className="eyebrow inverse">BUILD-OWN PLATFORM</span>
        <h1>Construction operations, under control.</h1>
        <p>Run projects, finance, people, assets and compliance from one secure multi-tenant workspace designed for modern construction teams.</p>
        <div className="actions"><Link className="button light" to="/operations">Open operations hub</Link><Link className="button ghost-light" to="/construction">Open projects</Link></div>
      </div>
      <div className="executive-status"><span className={`status-pill ${healthy?'healthy':'degraded'}`}><span className="status-dot"/>{healthy?'System healthy':'System attention'}</span><strong>{workspaceName}</strong><small>{loading?'Loading workspace context…':'Workspace context active'}</small></div>
    </section>

    <section className="metric-strip" aria-label="Operational readiness">
      <div className="executive-metric"><span>Workspace modules</span><strong>{modules.length}</strong><small>Core operating areas</small></div>
      <div className="executive-metric"><span>API status</span><strong>{health.status==='healthy'?'Healthy':'Check'}</strong><small>Live application health</small></div>
      <div className="executive-metric"><span>Database</span><strong>{health.database==='connected'?'Connected':'Check'}</strong><small>Persistence layer</small></div>
      <div className="executive-metric"><span>Data model</span><strong>Tenant-scoped</strong><small>Isolation enforced server-side</small></div>
    </section>

    <section className="dashboard-section">
      <div className="section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Operational control center</h2><p>Use the areas below to move from overview to execution without losing context.</p></div><Link className="text-link" to="/operations">View all operations →</Link></div>
      <div className="module-grid-premium">{modules.map(([title,desc,to,group],index)=><Link className="module-card-premium" to={to} key={to}><div className="module-card-top"><span className="module-number">{String(index+1).padStart(2,'0')}</span><span className="module-group">{group}</span></div><h3>{title}</h3><p>{desc}</p><span className="module-link">Open module <b>→</b></span></Link>)}</div>
    </section>

    <section className="dashboard-bottom-grid">
      <div className="surface-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Move work forward</h2></div></div><div className="quick-actions"><Link to="/construction"><strong>Review projects</strong><span>Projects, contracts and BOQs →</span></Link><Link to="/finance"><strong>Review finance</strong><span>Procurement and approvals →</span></Link><Link to="/hr"><strong>Review workforce</strong><span>Employees and attendance →</span></Link><Link to="/safety-quality"><strong>Review compliance</strong><span>Incidents and inspections →</span></Link></div></div>
      <div className="surface-panel readiness-panel"><div className="panel-heading"><div><span className="eyebrow">PLATFORM READINESS</span><h2>Production posture</h2></div></div><div className="readiness-list"><div><span className="readiness-icon success">✓</span><span><strong>API health monitoring</strong><small>Live health endpoint is checked from the workspace shell.</small></span></div><div><span className="readiness-icon success">✓</span><span><strong>Tenant-aware architecture</strong><small>Workspace navigation is designed around isolated tenant context.</small></span></div><div><span className="readiness-icon">i</span><span><strong>Role-aware navigation</strong><small>Administrative links adapt to the current access role.</small></span></div></div></div>
    </section>
  </main>;
}

function Companies(){
  const[tenants,setTenants]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[search,setSearch]=useState(''),[busy,setBusy]=useState(null);
  const load=async()=>{setLoading(true);setError('');try{const r=await tenantApi.list({search:search||undefined});setTenants(r.data.data||[])}catch(e){setError(e.response?.data?.message||'Unable to load companies.')}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const status=async(id,value)=>{setBusy(id);try{await tenantApi.setStatus(id,value);await load()}catch(e){setError(e.response?.data?.message||'Unable to update company.')}finally{setBusy(null)}};
  const remove=async t=>{if(t.isSystem||window.prompt(`Permanently delete ${t.name}? Type DELETE to confirm.`)!=='DELETE')return;setBusy(t._id);try{await tenantApi.remove(t._id);await load()}catch(e){setError(e.response?.data?.message||'Unable to delete company.')}finally{setBusy(null)}};
  return <main className="shell admin-page"><header><div><p className="eyebrow">SUPERADMIN</p><h1>Companies</h1><p className="muted">Manage tenant organizations, status and subscriptions from one controlled workspace.</p></div><div className="actions"><Link className="button secondary" to="/">Dashboard</Link><Link className="button" to="/operations">Operations</Link></div></header><div className="moduleGrid"><div className="metric"><span className="metric-label">Total companies</span><strong className="metric-value">{tenants.length}</strong></div><div className="metric"><span className="metric-label">Active</span><strong className="metric-value">{tenants.filter(t=>t.status==='active').length}</strong></div><div className="metric"><span className="metric-label">Suspended</span><strong className="metric-value">{tenants.filter(t=>t.status==='suspended').length}</strong></div><div className="metric"><span className="metric-label">System tenants</span><strong className="metric-value">{tenants.filter(t=>t.isSystem).length}</strong></div></div><section className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search by company name, slug or contact..."/><button onClick={load}>Search</button></section>{error&&<div className="alert">{error}</div>}{loading?<div className="card">Loading companies...</div>:!tenants.length?<div className="card empty">No companies found.</div>:<div className="tableWrap"><table><thead><tr><th>Company</th><th>Owner</th><th>Contact</th><th>Status</th><th>Subscription</th><th>Management</th></tr></thead><tbody>{tenants.map(t=><tr key={t._id}><td><strong>{t.name}</strong><span className="sub">{t.slug}</span></td><td>{t.owner?.name||'—'}<span className="sub">{t.owner?.email||'—'}</span></td><td>{t.email||'—'}<span className="sub">{t.phone||'—'}</span></td><td><span className={`badge ${t.status}`}>{t.status}</span></td><td>{t.subscription?.plan||'starter'}</td><td className="actions"><button disabled={busy===t._id} onClick={()=>status(t._id,t.status==='active'?'suspended':'active')}>{t.status==='active'?'Suspend':'Activate'}</button><button disabled={t.isSystem||busy===t._id} className="danger" onClick={()=>remove(t)}>Delete</button></td></tr>)}</tbody></table></div>}</main>;
}

export default function App(){return <BrowserRouter><AppShell><Routes><Route path="/" element={<Dashboard/>}/><Route path="/operations" element={<OperationsHub/>}/><Route path="/admin" element={<TenantAdmin/>}/><Route path="/construction" element={<ConstructionCore/>}/><Route path="/finance" element={<FinanceProcurement/>}/><Route path="/hr" element={<HRWorkforce/>}/><Route path="/payroll" element={<Payroll/>}/><Route path="/equipment-inventory" element={<EquipmentInventory/>}/><Route path="/safety-quality" element={<SafetyQualityManagement/>}/><Route path="/documents-reporting" element={<DocumentsReporting/>}/><Route path="/superadmin/companies" element={<Companies/>}/></Routes></AppShell></BrowserRouter>}
