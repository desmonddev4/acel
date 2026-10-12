import { useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { signIn } from './api.js'

const css = `
.lg{--ink:#10201a;--em:#0b8a3e;--em-deep:#047622;--gold:#b88a42;--gold-br:#e0b062;
  min-height:100vh;display:grid;grid-template-columns:1.1fr .9fr;font-size:14px;color:var(--ink);
  background:#0d1a14;position:relative;overflow:hidden}
.lg *{box-sizing:border-box}
.lg-orb{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:lgFloat 14s ease-in-out infinite}
.lg-orb.a{width:380px;height:380px;background:#0b8a3e;top:-90px;left:-80px}
.lg-orb.b{width:320px;height:320px;background:#b88a42;bottom:-80px;right:30%;animation-delay:-5s}
.lg-orb.c{width:260px;height:260px;background:#14c26a;top:40%;right:-60px;opacity:.35;animation-delay:-9s}
@keyframes lgFloat{50%{transform:translate(26px,-22px) scale(1.06)}}

.lg-brand{position:relative;z-index:1;padding:44px 52px;display:flex;flex-direction:column;justify-content:space-between;color:#fff}
.lg-logo{font-family:var(--font-display,inherit);font-size:17px;font-weight:600}
.lg-logo span{color:var(--gold-br)}
.lg-hero h1{font-family:var(--font-display,inherit);font-size:34px;line-height:1.15;margin:0;max-width:420px;font-weight:600}
.lg-hero p{margin:14px 0 0;max-width:380px;font-size:14px;line-height:1.65;color:rgba(255,255,255,.66)}
.lg-chips{display:flex;gap:8px;margin-top:22px;flex-wrap:wrap}
.lg-chip{padding:6px 12px;border-radius:999px;font-size:12px;color:rgba(255,255,255,.85);
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px);transition:.25s}
.lg-chip:hover{background:rgba(255,255,255,.16);transform:translateY(-2px)}
.lg-note{font-size:12px;color:rgba(255,255,255,.45)}

.lg-side{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;padding:32px 24px}
.lg-card{width:100%;max-width:380px;padding:28px;border-radius:20px;
  background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);
  box-shadow:0 20px 50px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.3);
  color:#fff;animation:lgIn .6s cubic-bezier(.2,.8,.2,1) both}
@keyframes lgIn{from{opacity:0;transform:translateY(18px) scale(.98)}}
.lg-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:var(--gold-br);
  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);margin-bottom:16px}
.lg-card h2{margin:0;font-family:var(--font-display,inherit);font-size:21px;font-weight:600}
.lg-card .sub{margin:6px 0 20px;font-size:13px;color:rgba(255,255,255,.65)}
.lg-field{display:block;margin-top:14px}
.lg-field span{display:block;font-size:12px;font-weight:500;color:rgba(255,255,255,.8);margin-bottom:6px}
.lg-field input{width:100%;padding:10px 12px;font-size:13.5px;color:#fff;border-radius:10px;outline:none;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);transition:.2s}
.lg-field input:focus{border-color:var(--gold-br);background:rgba(255,255,255,.16);box-shadow:0 0 0 3px rgba(224,176,98,.18)}
.lg-err{margin:14px 0 0;padding:8px 10px;border-radius:8px;font-size:12.5px;color:#ffd9d4;background:rgba(180,35,24,.3);border:1px solid rgba(255,140,128,.35)}
.lg-btn{position:relative;overflow:hidden;margin-top:20px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:11px 14px;border:0;border-radius:11px;font-size:13.5px;font-weight:600;color:#fff;cursor:pointer;
  background:linear-gradient(135deg,#0b8a3e,#047622);box-shadow:0 8px 20px rgba(4,118,34,.4);
  transition:transform .2s,box-shadow .2s,filter .2s}
.lg-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.35) 50%,transparent 65%);
  transform:translateX(-120%);transition:transform .6s}
.lg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 26px rgba(4,118,34,.5);filter:brightness(1.08)}
.lg-btn:hover:not(:disabled)::after{transform:translateX(120%)}
.lg-btn:active:not(:disabled){transform:translateY(0)}
.lg-btn:disabled{opacity:.6;cursor:wait}
.lg-back{display:inline-block;margin-top:16px;font-size:12.5px;color:rgba(255,255,255,.6);text-decoration:none;transition:.2s}
.lg-back:hover{color:#fff;transform:translateX(-2px)}
@media(max-width:900px){.lg{grid-template-columns:1fr}.lg-brand{display:none}}
@media(prefers-reduced-motion:reduce){.lg *{animation:none!important;transition:none!important}}
`

export default function AdminLogin({ onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(username, password)
      onAuthenticated()
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="lg">
      <style>{css}</style>
      <span className="lg-orb a" /><span className="lg-orb b" /><span className="lg-orb c" />

      <section className="lg-brand">
        <p className="lg-logo">ACEL <span>/</span> Secretariat</p>
        <div className="lg-hero">
          <h1>The Chamber, in good order.</h1>
          <p>Manage applications, member records, certification and correspondence from one secure workspace.</p>
          <div className="lg-chips">
            {['Applications', 'Members', 'Certificates', 'Messages'].map((label) => <span key={label} className="lg-chip">{label}</span>)}
          </div>
        </div>
        <p className="lg-note">Restricted to authorised ACEL staff.</p>
      </section>

      <section className="lg-side">
        <form onSubmit={submit} className="lg-card">
          <div className="lg-icon"><ShieldCheck size={18} aria-hidden="true" /></div>
          <h2>Admin portal</h2>
          <p className="sub">Sign in with your staff account.</p>

          <label className="lg-field"><span>Username</span>
            <input id="admin-username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="lg-field"><span>Password</span>
            <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          {error && <p role="alert" className="lg-err">{error}</p>}
          <button type="submit" disabled={busy} className="lg-btn">
            <LockKeyhole size={15} aria-hidden="true" />{busy ? 'Signing in…' : 'Sign in'}
          </button>
          <a href="/" className="lg-back">← Back to public website</a>
        </form>
      </section>
    </main>
  )
}