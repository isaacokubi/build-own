import {Link} from 'react-router-dom';

const items=[
  ['Construction Operations','Projects, clients, contracts, BOQs and budgets','/construction','01'],
  ['Finance & Procurement','Expenses, purchasing, suppliers and approvals','/finance','02'],
  ['HR & Workforce','Employees, attendance and workforce operations','/hr','03'],
  ['Payroll','Payroll runs, allowances and deductions','/payroll','04'],
  ['Safety & Quality','Incidents, inspections, quality and corrective actions','/safety-quality','05'],
  ['Documents & Reports','Tenant documents and business reporting','/documents-reporting','06'],
  ['Equipment & Inventory','Equipment, materials and inventory control','/equipment-inventory','07'],
  ['Administration','Company workspace and operational settings','/admin','08']
];

export default function OperationsHub(){
  return <main className="shell operations-page">
    <header><div><p className="eyebrow">BUILD-OWN PLATFORM</p><h1>Operations Hub</h1><p className="muted">Your command center for planning, execution, compliance and workforce operations.</p></div><div className="actions"><Link className="button secondary" to="/">Dashboard</Link><Link className="button" to="/construction">Open projects</Link></div></header>
    <section className="operations-banner"><div><span className="eyebrow inverse">CONTROL CENTER</span><h2>Move from insight to execution.</h2><p>Each workspace module keeps its own workflows while sharing the same navigation, tenant context and operational standards.</p></div><div className="banner-actions"><span className="status-pill healthy"><span className="status-dot"/>Workspace ready</span></div></section>
    <section className="dashboard-section"><div className="section-heading"><div><span className="eyebrow">MODULES</span><h2>Operational workspaces</h2><p>Open the area that matches the work you need to complete.</p></div></div><div className="module-grid-premium">{items.map(([title,desc,to,number])=><Link className="module-card-premium" to={to} key={to}><div className="module-card-top"><span className="module-number">{number}</span><span className="module-group">Workspace</span></div><h3>{title}</h3><p>{desc}</p><span className="module-link">Open workspace <b>→</b></span></Link>)}</div></section>
    <section className="surface-panel operations-note"><div><span className="eyebrow">WORKFLOW PRINCIPLE</span><h2>One workspace, one operational context.</h2><p>Use the persistent navigation to move between modules without losing your company context. Backend tenant and role controls remain the source of truth for authorization.</p></div><Link className="button secondary" to="/admin">Workspace administration</Link></section>
  </main>;
}
