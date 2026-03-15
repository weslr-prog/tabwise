import { usePaywall } from '../hooks/usePaywall'

const plans = [
  { id: 'monthly', label: 'Monthly', price: '$3.99/mo', note: '' },
  { id: 'yearly', label: 'Yearly', price: '$29.99/yr', note: 'BEST VALUE — save 37%' },
]

export function PaywallGate({ feature, children }) {
  const { isPro, loading, paymentConfigured, triggerUpgrade, restorePurchase, refreshStatus } = usePaywall()
  if (loading) return null
  if (isPro) return children

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "#080c14", borderRadius: 12, border: "1px solid #1a2236", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>◎</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{feature}</div>
        <div style={{ fontSize: 13, color: "#8fa2bf", marginBottom: 20, lineHeight: 1.5 }}>
          This feature is part of TABWISE Pro.
        </div>
        {!paymentConfigured && (
          <div style={{ fontSize: 11, color: "#f5c842", marginBottom: 14, lineHeight: 1.5 }}>
            Payments are not configured yet. Add your ExtensionPay ID before shipping paid access.
          </div>
        )}
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => triggerUpgrade(plan.id)}
            style={{
              display: "block", width: "100%", marginBottom: 8,
              padding: "10px 16px", borderRadius: 8, cursor: "pointer",
              background: plan.id === 'yearly' ? "#6366f1" : "transparent",
              border: plan.id === 'yearly' ? "none" : "1px solid #1a2236",
              color: plan.id === 'yearly' ? "#fff" : "#b3c1d8",
              fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}>
            <span style={{ fontWeight: 600 }}>{plan.price}</span>
            {plan.note ? <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.8 }}>{plan.note}</span> : null}
          </button>
        ))}
        <button
          onClick={() => restorePurchase()}
          style={{
            display: "block", width: "100%", marginTop: 10,
            padding: "9px 14px", borderRadius: 8, cursor: "pointer",
            background: "transparent",
            border: "1px solid #1a2236",
            color: "#8fa2bf",
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
          }}>
          Already paid? Restore access
        </button>
        <button
          onClick={() => refreshStatus()}
          style={{
            display: "block", width: "100%", marginTop: 8,
            padding: "9px 14px", borderRadius: 8, cursor: "pointer",
            background: "transparent",
            border: "1px solid #1a2236",
            color: "#7f93b1",
            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
          }}>
          Refresh payment status
        </button>
      </div>
    </div>
  )
}
