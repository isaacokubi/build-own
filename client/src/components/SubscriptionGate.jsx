import './subscriptionGate.css';

export default function SubscriptionGate({children,access,workspace,authenticated}){
  if(!authenticated || !access || access.allowed!==false)return children;

  const suspended=access.reason==='TENANT_SUSPENDED';
  const expired=access.reason==='SUBSCRIPTION_EXPIRED';
  const expiry=access.expiresAt?new Date(access.expiresAt).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):null;

  return <div className="subscription-lock" role="alert">
    <div className="subscription-lock-card">
      <span className="subscription-lock-icon">{suspended?'!':'$'}</span>
      <span className="eyebrow">WORKSPACE ACCESS</span>
      <h1>{suspended?'Workspace suspended':'Subscription required'}</h1>
      <p className="subscription-lock-lead">
        {suspended
          ? 'Your company workspace is currently suspended, so dashboard functionality is temporarily locked.'
          : expired
            ? 'Your trial or subscription has ended, so dashboard functionality is temporarily locked.'
            : 'Your company workspace needs an active subscription before dashboard functionality can be used.'}
      </p>
      <div className="subscription-lock-message">
        <strong>{access.message||'Please make a subscription to access the platform and unlock your workspace.'}</strong>
        {expiry&&<small>Previous access period ended: {expiry}</small>}
      </div>
      <div className="subscription-lock-actions">
        <button className="button" onClick={()=>window.location.reload()}>Check access again</button>
        <button className="button secondary" onClick={()=>{localStorage.removeItem('accessToken');localStorage.removeItem('refreshToken');window.location.reload()}}>Sign out</button>
      </div>
      <p className="subscription-lock-footer">
        {workspace?.name||'Your company'} remains safely stored. Once the subscription is restored, your workspace can be used again.
      </p>
    </div>
  </div>;
}
