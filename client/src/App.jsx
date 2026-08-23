import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { tenantApi } from './api';
import './index.css';

function Dashboard(){
  return <main className="shell"><header><div><p className="eyebrow">BUILD-OWN PLATFORM</p><h1>Construction Management System</h1><p className="muted">Multi-tenant construction operations platform.</p></div><Link className="button" to="/superadmin/companies">Manage companies</Link></header><section className="hero"><h2>SuperAdmin Control Center</h2><p>Manage construction companies, platform access and tenant status from one secure platform-level workspace.</p></section></main>;
}

function Companies(){
  const [tenants,setTenants]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [search,setSearch]=useState(''); const [busy,setBusy]=useState(null);
  const load=async()=>{setLoading(true);setError('');try{const r=await tenantApi.list({search:search||undefined});setTenants(r.data.data||[]);}catch(e){setError(e.response?.data?.message||'Unable to load companies. Sign in as a SuperAdmin first.');}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const status=async(id,value)=>{setBusy(id);try{await tenantApi.setStatus(id,value);await load();}catch(e){setError(e.response?.data?.message||'Unable to update company status.');}finally{setBusy(null);}};
  const remove=async(t)=>{if(t.isSystem)return;if(window.prompt(`Permanently delete ${t.name}? Type DELETE to confirm.`)!=='DELETE')return;setBusy(t._id);try{await tenantApi.remove(t._id);await load();}catch(e){setError(e.response?.data?.message||'Unable to delete company.');}finally{setBusy(null);}};
  return <main className="shell"><header><div><p className="eyebrow">SUPERADMIN</p><h1>Companies</h1><p className="muted">Manage every construction company on the platform.</p></div><Link className="button secondary" to="/">Dashboard</Link></header><section className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search companies..."/><button className="button" onClick={load}>Search</button></section>{error&&<div className="alert">{error}</div>}{loading?<div className="card">Loading companies...</div>:tenants.length===0?<div className="card empty"><h3>No companies found</h3><p>Create your first tenant through the SuperAdmin API.</p></div>:<div className="tableWrap"><table><thead><tr><th>Company</th><th>Owner</th><th>Contact</th><th>Status</th><th>Subscription</th><th>Created</th><th>Management</th></tr></thead><tbody>{tenants.map(t=><tr key={t._id}><td><strong>{t.name}</strong><span className="sub">{t.slug}</span></td><td>{t.owner?.name||'—'}<span className="sub">{t.owner?.email||'—'}</span></td><td>{t.email||'—'}<span className="sub">{t.phone||'—'}</span></td><td><span className={`badge ${t.status}`}>{t.status}</span></td><td>{t.subscription?.plan||'starter'}</td><td>{new Date(t.createdAt).toLocaleDateString()}</td><td className="actions"><button disabled={busy===t._id} onClick={()=>status(t._id,t.status==='active'?'suspended':'active')}>{t.status==='active'?'Suspend':'Activate'}</button><button disabled={t.isSystem||busy===t._id} className="danger" onClick={()=>remove(t)}>Delete</button></td></tr>)}</tbody></table></div>}</main>;
}

export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Dashboard/>}/><Route path="/superadmin/companies" element={<Companies/>}/></Routes></BrowserRouter>}
