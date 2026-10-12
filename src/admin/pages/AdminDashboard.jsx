import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, ClipboardList, Mail, UsersRound } from 'lucide-react'
import { adminRequest } from '../api.js'
import useReveal from '../useReveal.js'

const tiles = [
  { key: 'pendingApplications', label: 'Applications to review', to: '/admin/applications', icon: ClipboardList },
  { key: 'pendingRegistrations', label: 'Certification reviews', to: '/admin/registrations', icon: BadgeCheck },
  { key: 'newMessages', label: 'New messages', to: '/admin/messages', icon: Mail },
  { key: 'members', label: 'Member records', to: '/admin/members', icon: UsersRound },
]

const css = `
.ad{--ink:#10201a;--em:#0b8a3e;--em-deep:#047622;--gold:#b88a42;--line:rgba(16,32,26,.09);font-size:13px;color:var(--ink)}
.ad-glass{background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);border-radius:14px;
  backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);
  box-shadow:0 8px 24px rgba(16,32,26,.07),inset 0 1px 0 rgba(255,255,255,.85)}
.ad [data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0ms)}
.ad [data-reveal].is-in{opacity:1;transform:none}

.ad-grid{display:grid;gap:12px;grid-template-columns:repeat(4,minmax(0,1fr))}
.ad-tile{position:relative;display:block;padding:14px;color:inherit;text-decoration:none;overflow:hidden;
  transition:opacity .55s ease,transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .3s}
.ad-tile::before{content:'';position:absolute;width:120px;height:120px;right:-40px;top:-50px;border-radius:50%;
  background:radial-gradient(circle,rgba(11,138,62,.22),transparent 70%);transition:transform .5s}
.ad-tile.is-in:hover{transform:translateY(-4px);border-color:rgba(11,138,62,.35);box-shadow:0 16px 32px rgba(16,32,26,.13),inset 0 1px 0 rgba(255,255,255,.9)}
.ad-tile:hover::before{transform:scale(1.5)}
.ad-row{position:relative;display:flex;align-items:center;justify-content:space-between}
.ad-ico{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;color:var(--em-deep);
  background:rgba(11,138,62,.12);border:1px solid rgba(11,138,62,.15);transition:.3s}
.ad-tile:hover .ad-ico{background:var(--em);color:#fff;transform:rotate(-6deg) scale(1.08)}
.ad-arrow{color:rgba(16,32,26,.25);transition:.3s}
.ad-tile:hover .ad-arrow{transform:translateX(3px);color:var(--em)}
.ad-num{position:relative;margin:12px 0 0;font-family:var(--font-display,inherit);font-size:24px;font-weight:600;line-height:1}
.ad-lbl{position:relative;margin:4px 0 0;font-size:12px;color:rgba(16,32,26,.58)}

.ad-panel{margin-top:14px;overflow:hidden}
.ad-ph{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
.ad-ph h2{margin:0;font-family:var(--font-display,inherit);font-size:14px;font-weight:600}
.ad-ph p{margin:2px 0 0;font-size:11.5px;color:rgba(16,32,26,.5)}
.ad-all{display:inline-flex;align-items:center;height:28px;padding:0 11px;border-radius:999px;font-size:12px;font-weight:600;color:var(--em-deep);
  text-decoration:none;background:rgba(11,138,62,.1);border:1px solid rgba(11,138,62,.18);transition:.2s}
.ad-all:hover{background:var(--em);color:#fff;transform:translateY(-1px);box-shadow:0 6px 14px rgba(4,118,34,.28)}
.ad-scroll{overflow-x:auto}
.ad table{width:100%;min-width:480px;border-collapse:collapse;text-align:left}
.ad th{padding:8px 14px;font-size:11.5px;font-weight:600;color:rgba(16,32,26,.5);background:rgba(255,255,255,.45)}
.ad td{padding:9px 14px;font-size:12.5px;color:rgba(16,32,26,.65);border-top:1px solid rgba(16,32,26,.05)}
.ad td.nm{font-weight:600;color:var(--ink)}
.ad tbody tr{transition:background .2s}
.ad tbody tr:hover{background:rgba(11,138,62,.07)}
.ad-pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:500;text-transform:capitalize;
  color:#7a5a22;background:rgba(184,138,66,.16);border:1px solid rgba(184,138,66,.28)}
.ad-pill.approved{color:var(--em-deep);background:rgba(11,138,62,.12);border-color:rgba(11,138,62,.25)}
.ad-pill.declined{color:#b42318;background:rgba(180,35,24,.1);border-color:rgba(180,35,24,.25)}
.ad-empty{padding:26px 14px!important;text-align:center;color:rgba(16,32,26,.5)}
.ad-foot{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ad-chip{padding:5px 11px;border-radius:999px;font-size:11.5px;color:rgba(16,32,26,.62);background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);backdrop-filter:blur(10px);transition:.2s}
.ad-chip:hover{transform:translateY(-2px);color:var(--ink);box-shadow:0 6px 12px rgba(16,32,26,.08)}
.ad-chip b{color:var(--ink)}
.ad-err{padding:10px 12px;border-radius:10px;font-size:12.5px;color:#b42318;background:rgba(180,35,24,.08);border:1px solid rgba(180,35,24,.22)}
.ad-load{font-size:12.5px;color:rgba(16,32,26,.55)}
@media(max-width:1000px){.ad-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.ad-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ad [data-reveal]{opacity:1;transform:none;transition:none}.ad *{transition:none!important}}
`

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminRequest('/admin/summary/').then(setSummary).catch((requestError) => setError(requestError.message))
  }, [])

  useReveal(summary)

  if (error) return <div className="ad"><style>{css}</style><p role="alert" className="ad-err">{error}</p></div>
  if (!summary) return <div className="ad"><style>{css}</style><p className="ad-load">Loading workspace…</p></div>

  return (
    <div className="ad">
      <style>{css}</style>

      <section className="ad-grid">
        {tiles.map(({ key, label, to, icon: Icon }, index) => (
          <Link key={key} to={to} data-reveal style={{ '--d': `${index * 70}ms` }} className="ad-glass ad-tile">
            <div className="ad-row">
              <span className="ad-ico"><Icon size={15} aria-hidden="true" /></span>
              <ArrowRight size={15} className="ad-arrow" aria-hidden="true" />
            </div>
            <p className="ad-num">{summary[key]}</p>
            <p className="ad-lbl">{label}</p>
          </Link>
        ))}
      </section>

      <section data-reveal className="ad-glass ad-panel">
        <div className="ad-ph">
          <div><h2>Recent applications</h2><p>Newest submissions awaiting Secretariat review.</p></div>
          <Link to="/admin/applications" className="ad-all">All applications</Link>
        </div>
        <div className="ad-scroll">
          <table>
            <thead><tr><th>Applicant</th><th>Stream</th><th>Received</th><th>Status</th></tr></thead>
            <tbody>
              {summary.recentApplications.length
                ? summary.recentApplications.map((record) => (
                  <tr key={record.id}>
                    <td className="nm">{record.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{record.stream}</td>
                    <td>{new Date(record.created_at).toLocaleDateString()}</td>
                    <td><span className={`ad-pill ${record.status}`}>{record.status}</span></td>
                  </tr>
                ))
                : <tr><td colSpan={4} className="ad-empty">No applications received yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div data-reveal className="ad-foot">
        <span className="ad-chip"><b>{summary.applications}</b> applications</span>
        <span className="ad-chip"><b>{summary.registrations}</b> certifications</span>
        <span className="ad-chip"><b>{summary.messages}</b> messages</span>
        <span className="ad-chip"><b>{summary.certificates}</b> certificates</span>
      </div>
    </div>
  )
}