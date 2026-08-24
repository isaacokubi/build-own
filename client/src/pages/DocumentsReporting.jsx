import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary, getDocuments, getReports } from '../api/documentReportApi';

const money = (value, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);

const statusTone = (status) => {
  if (['Active', 'Awarded', 'Completed'].includes(status)) return 'success';
  if (['Delayed', 'On Hold', 'Pending Approval'].includes(status)) return 'warning';
  if (['Cancelled', 'Rejected'].includes(status)) return 'danger';
  return 'neutral';
};

export default function DocumentsReporting() {
  const [data, setData] = useState({ documents: [], reports: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.allSettled([getDocuments(), getReports(), getAnalyticsSummary()]).then(([documentsResult, reportsResult, analyticsResult]) => {
      if (!active) return;
      if (documentsResult.status === 'fulfilled') setData((current) => ({ ...current, documents: documentsResult.value.data?.data || [] }));
      if (reportsResult.status === 'fulfilled') setData((current) => ({ ...current, reports: reportsResult.value.data?.data || [] }));
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value.data?.data || null);
      else setError(analyticsResult.reason?.response?.data?.message || 'Executive analytics are currently unavailable.');
      setLoading(false);
      setAnalyticsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const projectStatuses = analytics?.projects?.statuses || [];
  const maxStatusCount = useMemo(() => Math.max(1, ...projectStatuses.map((item) => item.count || 0)), [projectStatuses]);
  const primaryCurrency = analytics?.finance?.expensesByCurrency?.[0];

  if (loading) return <main className="shell admin-page"><div className="card">Loading reporting workspace…</div></main>;

  return (
    <main className="shell admin-page">
      <header>
        <div><p className="eyebrow">REPORTING & INTELLIGENCE</p><h1>Executive reporting</h1><p className="muted">A tenant-scoped operational view of projects, financial commitments, workforce and records.</p></div>
        <div className="actions"><span className="badge active">Tenant scoped</span>{analytics?.generatedAt && <span className="muted">Updated {new Date(analytics.generatedAt).toLocaleTimeString()}</span>}</div>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="moduleGrid" aria-label="Executive metrics">
        <div className="metric"><span className="metric-label">Projects</span><strong className="metric-value">{analytics?.projects?.count ?? '—'}</strong><span className="sub">{analytics?.projects ? `${analytics.projects.averageProgress}% average progress` : 'Analytics unavailable'}</span></div>
        <div className="metric"><span className="metric-label">Contract value</span><strong className="metric-value">{money(analytics?.projects?.contractValue)}</strong><span className="sub">Across portfolio</span></div>
        <div className="metric"><span className="metric-label">Procurement committed</span><strong className="metric-value">{money(analytics?.procurement?.committedValue)}</strong><span className="sub">{analytics?.procurement?.pendingApproval ?? 0} awaiting approval</span></div>
        <div className="metric"><span className="metric-label">Active workforce</span><strong className="metric-value">{analytics?.workforce?.activeEmployees ?? '—'}</strong><span className="sub">Employees currently active</span></div>
      </section>

      <section className="dashboard-bottom-grid">
        <div className="surface-panel">
          <div className="panel-heading"><div><span className="eyebrow">PORTFOLIO</span><h2>Project health</h2></div>{analytics?.projects?.budget > 0 && <span className="muted">Budget {money(analytics.projects.budget)}</span>}</div>
          {analyticsLoading ? <p className="muted">Refreshing portfolio intelligence…</p> : projectStatuses.length ? (
            <div className="readiness-list">
              {projectStatuses.map((item) => <div key={item.status}><span className={`readiness-icon ${statusTone(item.status)}`}>{item.count}</span><span style={{ flex: 1 }}><strong>{item.status}</strong><small>{item.count} project{item.count === 1 ? '' : 's'}</small><span style={{ display: 'block', height: 6, marginTop: 8, borderRadius: 99, background: 'var(--surface-muted, #e5e7eb)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${(item.count / maxStatusCount) * 100}%`, borderRadius: 99, background: 'currentColor', opacity: 0.65 }} /></span></span></div>)}
            </div>
          ) : <div className="empty">No project data available yet.</div>}
        </div>

        <div className="surface-panel">
          <div className="panel-heading"><div><span className="eyebrow">CONTROL SIGNALS</span><h2>Attention required</h2></div></div>
          <div className="quick-actions"><div><strong>{analytics?.procurement?.pendingApproval ?? 0} purchase orders</strong><span>Awaiting procurement approval</span></div><div><strong>{analytics?.inventory?.lowStockMaterials ?? 0} materials</strong><span>Below minimum stock level</span></div><div><strong>{analytics?.records?.documents ?? data.documents.length} documents</strong><span>Tenant records available</span></div><div><strong>{analytics?.records?.reports ?? data.reports.length} reports</strong><span>Generated business reports</span></div></div>
        </div>
      </section>

      <section className="surface-panel">
        <div className="panel-heading"><div><span className="eyebrow">FINANCE</span><h2>Spend by currency</h2></div>{primaryCurrency && <strong>{money(primaryCurrency.total, primaryCurrency.currency)}</strong>}</div>
        {analytics?.finance?.expensesByCurrency?.length ? <div className="tableWrap"><table><thead><tr><th>Currency</th><th>Expense records</th><th>Total spend</th></tr></thead><tbody>{analytics.finance.expensesByCurrency.map((item) => <tr key={item.currency}><td><strong>{item.currency}</strong></td><td>{item.count}</td><td>{money(item.total, item.currency)}</td></tr>)}</tbody></table></div> : <div className="empty">No expense data available yet.</div>}
      </section>

      <section className="surface-panel">
        <div className="panel-heading"><div><span className="eyebrow">DOCUMENT CONTROL</span><h2>Recent documents</h2></div><span className="muted">{data.documents.length} loaded</span></div>
        <div className="tableWrap"><table><thead><tr><th>Document</th><th>Category</th><th>Visibility</th><th>Created</th></tr></thead><tbody>{data.documents.slice(0, 8).map((document) => <tr key={document._id}><td><strong>{document.name}</strong></td><td>{document.category || '—'}</td><td><span className="badge">{document.visibility || 'Tenant'}</span></td><td>{document.createdAt ? new Date(document.createdAt).toLocaleDateString() : '—'}</td></tr>)}{!data.documents.length && <tr><td colSpan="4" className="p-6 text-center">No documents available.</td></tr>}</tbody></table></div>
      </section>
    </main>
  );
}
