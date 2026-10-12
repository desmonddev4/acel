import { NavLink } from 'react-router-dom'
import { BadgeCheck, ClipboardList, FileBadge2, LayoutDashboard, Mail, UsersRound } from 'lucide-react'

export const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/applications', label: 'Membership applications', icon: ClipboardList },
  { to: '/admin/registrations', label: 'Certification registrations', icon: BadgeCheck },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/members', label: 'Members', icon: UsersRound },
  { to: '/admin/certificates', label: 'Certificates', icon: FileBadge2 },
]

const css = `
.as{--ink:#10201a;--em:#0b8a3e;--em-deep:#047622;--gold:#b88a42;
  position:sticky;top:70px;align-self:start;margin:14px 0 14px 14px;padding:10px;border-radius:16px;
  background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.7);
  backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);
  box-shadow:0 8px 24px rgba(16,32,26,.07),inset 0 1px 0 rgba(255,255,255,.8)}
.as-title{margin:4px 10px 8px;font-size:11.5px;font-weight:600;color:rgba(16,32,26,.45)}
.as-nav{display:flex;flex-direction:column;gap:3px}
.as-link{position:relative;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;
  font-size:12.5px;color:rgba(16,32,26,.68);text-decoration:none;transition:background .2s,color .2s,transform .2s}
.as-link svg{flex:none;transition:transform .25s}
.as-link:hover{background:rgba(255,255,255,.7);color:var(--ink);transform:translateX(3px)}
.as-link:hover svg{transform:scale(1.15) rotate(-4deg)}
.as-link.on{font-weight:600;color:var(--em-deep);
  background:linear-gradient(135deg,rgba(11,138,62,.16),rgba(255,255,255,.7));
  box-shadow:0 4px 12px rgba(11,138,62,.12),inset 0 0 0 1px rgba(11,138,62,.15)}
.as-link.on::before{content:'';position:absolute;left:-10px;top:22%;bottom:22%;width:3px;border-radius:3px;background:var(--gold)}
@media(max-width:767px){
  .as{position:static;margin:10px 10px 0;padding:6px}
  .as-title{display:none}
  .as-nav{flex-direction:row;overflow-x:auto;scrollbar-width:none}
  .as-nav::-webkit-scrollbar{display:none}
  .as-link{flex:none;white-space:nowrap}
  .as-link:hover{transform:none}
  .as-link.on::before{display:none}
}
@media(prefers-reduced-motion:reduce){.as *{transition:none!important}}
`

export default function AdminSidebar() {
  return (
    <aside className="as">
      <style>{css}</style>
      <p className="as-title">Workspace</p>
      <nav aria-label="Admin navigation" className="as-nav">
        {adminLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `as-link${isActive ? ' on' : ''}`}>
            <Icon size={15} aria-hidden="true" /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}