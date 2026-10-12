import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { signIn } from './api.js'

/*
  ACEL Secretariat - admin sign-in
  Design notes
  - Palette: Chamber green #0a3d27, deep #062a1a, brass #c49a4f, paper #f5f7f4, ink #14231b
  - Type: Newsreader (headings) + Hanken Grotesk (UI), with system fallbacks
  - One memorable element: a guilloche rosette (the engraved pattern on certificates
    and banknotes), generated in SVG. Everything else stays quiet.
*/

const font = "@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap');"

const css = `${font}
.al{--green:#0a3d27;--green-deep:#062a1a;--brass:#c49a4f;--brass-lt:#e3c58a;--paper:#f5f7f4;--ink:#14231b;--muted:#5b6b62;--line:#cfd8d2;--danger:#a3261b;
  min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  font-family:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;color:var(--ink);background:var(--paper)}
.al *{box-sizing:border-box}

/* ---------- brand panel ---------- */
.al-brand{position:relative;overflow:hidden;background:var(--green);color:#fff;
  padding:40px 56px;display:flex;flex-direction:column;justify-content:space-between;gap:32px;
  background-image:radial-gradient(120% 90% at 100% 100%,var(--green-deep) 0%,transparent 60%)}
.al-name{position:relative;z-index:2;margin:0;font-size:15px;font-weight:600;letter-spacing:.01em}
.al-name small{display:block;margin-top:2px;font-size:13px;font-weight:400;color:rgba(255,255,255,.62)}

.al-seal{position:absolute;z-index:1;width:min(760px,125%);aspect-ratio:1;right:-26%;top:50%;margin-top:calc(min(760px,125%) / -2 + 40px);
  opacity:0;animation:alSeal 1.4s cubic-bezier(.2,.7,.2,1) .1s forwards;pointer-events:none}
@keyframes alSeal{from{opacity:0;transform:scale(.94) rotate(-6deg)}to{opacity:1;transform:none}}

.al-copy{position:relative;z-index:2;max-width:430px}
.al-copy h1{margin:0;font-family:'Newsreader',Georgia,'Times New Roman',serif;font-weight:500;
  font-size:clamp(32px,3.3vw,44px);line-height:1.12;letter-spacing:-.01em}
.al-copy p{margin:16px 0 0;max-width:400px;line-height:1.65;color:rgba(255,255,255,.72)}
.al-foot{position:relative;z-index:2;margin:0;font-size:13px;color:rgba(255,255,255,.55)}

/* ---------- form panel ---------- */
.al-side{display:flex;align-items:center;justify-content:center;padding:40px 28px}
.al-form{width:100%;max-width:392px}
.al-form h2{margin:0;font-family:'Newsreader',Georgia,'Times New Roman',serif;font-weight:600;font-size:30px;letter-spacing:-.01em}
.al-sub{margin:8px 0 28px;color:var(--muted);line-height:1.55}

.al-field{display:block;margin-bottom:18px}
.al-label{display:block;margin-bottom:7px;font-size:14px;font-weight:500}
.al-inputwrap{position:relative}
.al-input{width:100%;height:46px;padding:0 14px;font:inherit;color:var(--ink);background:#fff;
  border:1px solid var(--line);border-radius:8px;transition:border-color .15s,box-shadow .15s}
.al-input:hover{border-color:#aebbb3}
.al-input:focus-visible{outline:none;border-color:var(--green);box-shadow:0 0 0 3px rgba(10,61,39,.18)}
.al-input[aria-invalid="true"]{border-color:var(--danger)}
.al-input.has-btn{padding-right:48px}
.al-eye{position:absolute;top:50%;right:6px;transform:translateY(-50%);width:34px;height:34px;display:grid;place-items:center;
  border:0;border-radius:6px;background:transparent;color:var(--muted);cursor:pointer}
.al-eye:hover{color:var(--ink);background:rgba(10,61,39,.07)}
.al-eye:focus-visible{outline:2px solid var(--green);outline-offset:1px}

.al-hint{margin:8px 0 0;font-size:13px;color:#8a5a12}
.al-err{display:flex;gap:10px;align-items:flex-start;margin:0 0 18px;padding:11px 13px;border-radius:8px;
  font-size:14px;line-height:1.45;color:#7d1d14;background:#fdecea;border:1px solid #f1b9b2}
.al-err svg{flex:none;margin-top:2px}

.al-btn{width:100%;height:48px;display:inline-flex;align-items:center;justify-content:center;gap:9px;margin-top:6px;
  border:0;border-radius:8px;font:inherit;font-weight:600;color:#fff;background:var(--green);cursor:pointer;
  transition:background .15s,box-shadow .15s,transform .1s}
.al-btn:hover:not(:disabled){background:var(--green-deep)}
.al-btn:active:not(:disabled){transform:translateY(1px)}
.al-btn:focus-visible{outline:2px solid var(--green);outline-offset:3px}
.al-btn:disabled{opacity:.72;cursor:progress}
.al-spin{animation:alSpin .8s linear infinite}
@keyframes alSpin{to{transform:rotate(360deg)}}

.al-back{display:inline-block;margin-top:24px;font-size:14px;color:var(--muted);text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}
.al-back:hover{color:var(--ink);text-decoration-color:currentColor}
.al-back:focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:2px}

/* ---------- small screens ---------- */
@media(max-width:900px){
  .al{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .al-brand{padding:22px 24px}
  .al-seal,.al-copy,.al-foot{display:none}
  .al-side{align-items:flex-start;padding:36px 24px 48px}
}
@media(prefers-reduced-motion:reduce){
  .al-seal{animation:none;opacity:1}
  .al-spin{animation-duration:2s}
  .al *{transition:none!important}
}
`

/* Guilloche rosette: overlapping rotated ellipses plus a fine inner lattice. */
function Rosette() {
  const outer = Array.from({ length: 48 }, (_, i) => (i * 180) / 48)
  const inner = Array.from({ length: 36 }, (_, i) => (i * 180) / 36 + 2.5)
  const rings = [120, 150, 178]
  return (
    <svg className="al-seal" viewBox="-200 -200 400 400" aria-hidden="true" focusable="false" fill="none">
      <g stroke="#c49a4f" strokeWidth=".45" opacity=".55">
        {outer.map((deg) => <ellipse key={deg} rx="185" ry="62" transform={`rotate(${deg})`} />)}
      </g>
      <g stroke="#e3c58a" strokeWidth=".4" opacity=".4">
        {inner.map((deg) => <ellipse key={deg} rx="118" ry="38" transform={`rotate(${deg})`} />)}
      </g>
      <g stroke="#c49a4f" strokeWidth=".6" opacity=".5">
        {rings.map((r) => <circle key={r} r={r} />)}
      </g>
      <circle r="34" fill="#062a1a" stroke="#e3c58a" strokeWidth=".8" opacity=".95" />
      <text textAnchor="middle" y="6" fontFamily="Newsreader, Georgia, serif" fontSize="17" fontWeight="600" fill="#e3c58a">ACEL</text>
    </svg>
  )
}

export default function AdminLogin({ onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await signIn(username.trim(), password)
      onAuthenticated()
    } catch (loginError) {
      setError(loginError?.message || 'We could not sign you in. Check your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  const trackCaps = (event) => setCapsOn(event.getModifierState?.('CapsLock') ?? false)

  return (
    <main className="al">
      <style>{css}</style>

      <section className="al-brand">
        <p className="al-name">ACEL Secretariat<small>Staff workspace</small></p>
        <Rosette />
        <div className="al-copy">
          <h1>Every member, application and certificate in one register.</h1>
          <p>Review applications, keep member records current, issue certificates and answer correspondence without leaving this workspace.</p>
        </div>
        <p className="al-foot">Restricted to authorised ACEL staff.</p>
      </section>

      <section className="al-side">
        <form onSubmit={submit} className="al-form" noValidate={false}>
          <h2>Sign in</h2>
          <p className="al-sub">Use the staff account issued by the Secretariat office.</p>

          {error && (
            <p role="alert" className="al-err">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <label className="al-field" htmlFor="admin-username">
            <span className="al-label">Username</span>
            <input
              id="admin-username"
              className="al-input"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              required
              autoFocus
              aria-invalid={error ? 'true' : undefined}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <div className="al-field">
            <label className="al-label" htmlFor="admin-password">Password</label>
            <div className="al-inputwrap">
              <input
                id="admin-password"
                className="al-input has-btn"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={capsOn ? 'admin-caps' : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={trackCaps}
                onKeyDown={trackCaps}
                onBlur={() => setCapsOn(false)}
              />
              <button
                type="button"
                className="al-eye"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {capsOn && <p id="admin-caps" className="al-hint">Caps Lock is on.</p>}
          </div>

          <button type="submit" disabled={busy} className="al-btn">
            {busy
              ? <><Loader2 size={17} className="al-spin" aria-hidden="true" />Signing in…</>
              : <><LockKeyhole size={16} aria-hidden="true" />Sign in</>}
          </button>

          <a href="/" className="al-back">Back to the public website</a>
        </form>
      </section>
    </main>
  )
}