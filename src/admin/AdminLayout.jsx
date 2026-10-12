import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Globe, LogOut } from 'lucide-react'
import { clearAdminSession } from './api.js'
import AdminSidebar, { adminLinks } from './AdminSidebar.jsx'

const css = `
.al{--ink:#10201a;--em:#0b8a3e;--em-deep:#047622;--gold:#b88a42;
  position:relative;min-height:100vh;font-size:14px;color:var(--ink);background:#eaf1ec}
.al::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(520px 380px at 6% 2%,rgba(11,138,62,.22),transparent 65%),
  radial-gradient(460px 380px at 96% 8%,rgba(184,138,66,.24),transparent 65%),
  radial-gradient(560px 460px at 55% 105%,rgba(11,138,62,.16),transparent 65%)}
.al-head{position:sticky;top:0;z-index:30;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;
  background:rgba(255,255,255,.55);border-bottom:1px solid rgba(255,255,255,.7);
  backdrop-filter:blur(18px) saturate(170%);-webkit-backdrop-filter:blur(18px) saturate(170%);
  box-shadow:0 1px 0 rgba(16,32,26,.06)}
.al-logo{font-family:var(--font-display,inherit);font-size:15px;font-weight:600;color:var(--ink);text-decoration:none}
.al-logo span{color:var(--gold)}
.al-actions{display:flex;align-items:center;gap:8px}
.al-pill{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;font-size:12px;
  color:rgba(16,32,26,.7);text-decoration:none;background:rgba(255,255,255,.6);border:1px solid rgba(16,32,26,.08);
  transition:transform .2s,box-shadow .2s,color .2s}
.al-pill:hover{color:var(--em-deep);transform:translateY(-1px);box-shadow:0 6px 14px rgba(16,32,26,.1)}
.al-out{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;cursor:pointer;
  color:rgba(16,32,26,.7);background:rgba(255,255,255,.6);border:1px solid rgba(16,32,26,.08);transition:.2s}
.al-out:hover{color:#fff;background:#b42318;border-color:#b42318;transform:translateY(-1px) rotate(-8deg);box-shadow:0 6px 14px rgba(180,35,24,.3)}
.al-body{position:relative;z-index:1;display:grid;grid-template-columns:210px minmax(0,1fr);max-width:1500px;margin:0 auto;min-height:calc(100vh - 56px)}
.al-main{min-width:0;padding:18px 20px 40px}
.al-top{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.al-top i{width:4px;height:20px;border-radius:4px;background:linear-gradient(var(--em),var(--gold))}
.al-top h1{margin:0;font-family:var(--font-display,inherit);font-size:18px;font-weight:600}
.al-top small{margin-left:auto;font-size:12px;color:rgba(16,32,26,.5)}
.al-page{animation:alIn .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes alIn{from{opacity:0;transform:translateY(10px)}}
@media(max-width:767px){.al-body{grid-template-columns:1fr}.al-main{padding:14px 12px 32px}.al-top small,.al-pill span{display:none}.al-pill{padding:0 9px}}
@media(prefers-reduced-motion:reduce){.al *{animation:none!important;transition:none!important}}
`

export default function AdminLayout({ onSignOut }) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = adminLinks.find((link) => location.pathname === link.to)?.label || 'Overview'

  const signOut = () => {
    clearAdminSession()
    onSignOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="al">
      <style>{css}</style>
      <header className="al-head">
        <a href="/admin/dashboard" className="al-logo">ACEL <span>/</span> Admin</a>
        <div className="al-actions">
          <a href="/" className="al-pill"><Globe size={14} aria-hidden="true" /><span>Public website</span></a>
          <button type="button" onClick={signOut} title="Sign out" aria-label="Sign out" className="al-out"><LogOut size={15} aria-hidden="true" /></button>
        </div>
      </header>

      <div className="al-body">
        <AdminSidebar />
        <main className="al-main">
          <div className="al-top"><i /><h1>{title}</h1><small>ACEL Secretariat</small></div>
          <div key={location.pathname} className="al-page"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}