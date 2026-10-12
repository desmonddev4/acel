import { useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, LockKeyhole, User,
} from 'lucide-react'
import { signIn } from './api.js'

/*
  ACEL Secretariat - admin sign-in
  Logo: /public/acel-logo.jpeg (served from "/acel-logo.jpeg")
  Palette: green #0a3d27 / deep #062a1a, brass #c49a4f, paper #f3f6f2, ink #10241a
  Tweak the validation rules below if your backend uses different limits.
*/

const LOGO_SRC = '/acel-logo.jpeg'
const MIN_USERNAME = 3
const MIN_PASSWORD = 6

const font = "@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap');"

const css = `${font}
.al{--green:#0a3d27;--green-deep:#062a1a;--green-soft:#e7f0ea;--brass:#c49a4f;--brass-lt:#e3c58a;--paper:#f3f6f2;
  --ink:#10241a;--muted:#5b6b62;--line:#d3dcd6;--ok:#12803f;--danger:#b3261e;
  height:100vh;height:100dvh;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  font-family:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;color:var(--ink);color:#fff;background:var(--green);
  background-image:radial-gradient(120% 90% at 100% 100%,var(--green-deep) 0%,transparent 60%)}
.al *{box-sizing:border-box}

/* ---------- brand panel ---------- */
.al-brand{position:relative;overflow:hidden;color:#fff;
  padding:32px 56px;display:flex;flex-direction:column;justify-content:space-between;gap:32px;}
.al-id{position:relative;z-index:2;display:flex;align-items:center;gap:14px}
.al-badge{width:56px;height:56px;flex:none;display:grid;place-items:center;border-radius:14px;background:#fff;
  box-shadow:0 6px 18px rgba(0,0,0,.28);overflow:hidden;padding:5px}
.al-badge img{width:100%;height:100%;object-fit:contain;display:block}
.al-name{margin:0;font-size:16px;font-weight:600;letter-spacing:.01em;line-height:1.25}
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
.al-side{display:flex;align-items:center;justify-content:center;padding:20px 32px;min-height:0;color:var(--ink)}

.al-card{width:100%;max-width:468px;max-height:100%;overflow-y:auto;display:flex;flex-direction:column;
  padding:32px 40px 28px;background:#fff;border:1px solid var(--line);border-radius:20px;position:relative;
  box-shadow:0 1px 2px rgba(16,36,26,.06),0 24px 48px -16px rgba(10,61,39,.22)}
.al-card::before{content:'';position:absolute;left:44px;right:44px;top:-1px;height:3px;border-radius:0 0 3px 3px;
  background:linear-gradient(90deg,var(--green),var(--brass))}

.al-head{display:flex;align-items:center;gap:14px;margin-bottom:16px}
@media(max-height:760px){.al-head{display:none}}
.al-logo{width:64px;height:64px;flex:none;border-radius:14px;border:1px solid var(--line);background:#fff;display:grid;place-items:center;overflow:hidden;padding:5px}
.al-logo img{width:100%;height:100%;object-fit:contain;display:block}
.al-logo.fallback{font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:17px;color:var(--green);background:var(--green-soft);border-color:transparent}
.al-head p{margin:0;font-size:13px;line-height:1.35;color:var(--muted)}
.al-head strong{display:block;font-size:15px;color:var(--green);font-weight:600}

.al-card h2{margin:0;font-family:'Newsreader',Georgia,'Times New Roman',serif;font-weight:600;font-size:32px;line-height:1.15;letter-spacing:-.01em;color:var(--ink)}
.al-sub{margin:6px 0 18px;color:var(--muted);line-height:1.55}

.al-form{display:flex;flex-direction:column;flex:1}
.al-field{margin-bottom:14px}
.al-label{display:block;margin-bottom:8px;font-size:14px;font-weight:600;color:var(--ink)}
.al-box{position:relative}
.al-lead{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#7f8f86;pointer-events:none;display:grid;transition:color .15s}
.al-input{width:100%;height:48px;padding:0 48px 0 46px;font:inherit;font-size:15px;color:var(--ink);background:#f8faf8;
  border:1.5px solid var(--line);border-radius:12px;transition:border-color .15s,box-shadow .15s,background .15s}
.al-input::placeholder{color:#9aa8a0}
.al-input:hover{border-color:#aebbb3;background:#fff}
.al-input:focus-visible{outline:none;border-color:var(--green);background:#fff;box-shadow:0 0 0 4px rgba(10,61,39,.14)}
.al-box:focus-within .al-lead{color:var(--green)}
.al-field.bad .al-input{border-color:var(--danger);background:#fff8f7}
.al-field.bad .al-input:focus-visible{box-shadow:0 0 0 4px rgba(179,38,30,.14)}
.al-field.bad .al-lead{color:var(--danger)}
.al-field.good .al-input{border-color:#7cbf97}

.al-trail{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:2px}
.al-ok{display:grid;color:var(--ok);margin-right:8px}
.al-eye{width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:8px;background:transparent;color:var(--muted);cursor:pointer;transition:background .15s,color .15s}
.al-eye:hover{color:var(--green);background:var(--green-soft)}
.al-eye:focus-visible{outline:2px solid var(--green);outline-offset:1px}

.al-msg{display:flex;align-items:center;gap:6px;margin:8px 0 0;font-size:13px;line-height:1.4}
.al-msg.err{color:var(--danger)}
.al-msg.warn{color:#8a5a12}
.al-msg svg{flex:none}

.al-banner{display:flex;gap:10px;align-items:flex-start;margin:0 0 20px;padding:12px 14px;border-radius:12px;
  font-size:14px;line-height:1.45;color:#7d1d14;background:#fdecea;border:1px solid #f1b9b2}
.al-banner svg{flex:none;margin-top:2px}

.al-btn{position:relative;overflow:hidden;width:100%;height:50px;display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:6px;
  border:0;border-radius:12px;font:inherit;font-size:15px;font-weight:600;letter-spacing:.01em;color:#fff;cursor:pointer;
  background:linear-gradient(135deg,#0d5535 0%,var(--green) 55%,var(--green-deep) 100%);
  box-shadow:0 10px 22px -8px rgba(10,61,39,.6);transition:transform .18s,box-shadow .18s,filter .18s}
.al-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.28) 50%,transparent 65%);
  transform:translateX(-120%);transition:transform .65s}
.al-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 28px -10px rgba(10,61,39,.7);filter:brightness(1.07)}
.al-btn:hover:not(:disabled)::after{transform:translateX(120%)}
.al-btn:active:not(:disabled){transform:translateY(0);box-shadow:0 6px 14px -6px rgba(10,61,39,.6)}
.al-btn:focus-visible{outline:3px solid var(--brass);outline-offset:3px}
.al-btn:disabled{opacity:.75;cursor:progress}
.al-btn svg{position:relative;z-index:1}
.al-btn span{position:relative;z-index:1}
.al-spin{animation:alSpin .8s linear infinite}
@keyframes alSpin{to{transform:rotate(360deg)}}

.al-divider{display:flex;align-items:center;gap:14px;margin:auto 0 0;padding-top:16px;font-size:13px;color:var(--muted)}
.al-divider::before,.al-divider::after{content:'';flex:1;height:1px;background:var(--line)}

.al-back{display:inline-flex;width:100%;height:46px;margin-top:12px;align-items:center;justify-content:center;gap:10px;
  border:1.5px solid var(--line);border-radius:12px;font-size:14.5px;font-weight:600;color:var(--green);text-decoration:none;background:#fff;
  transition:background .18s,border-color .18s,color .18s,transform .18s,box-shadow .18s}
.al-back svg{transition:transform .2s}
.al-back:hover{background:var(--green-soft);border-color:var(--green);transform:translateY(-1px);box-shadow:0 8px 16px -10px rgba(10,61,39,.5)}
.al-back:hover svg{transform:translateX(-4px)}
.al-back:active{transform:translateY(0)}
.al-back:focus-visible{outline:3px solid var(--brass);outline-offset:3px}

/* ---------- small screens ---------- */
@media(max-width:900px){
  .al{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .al-brand{padding:14px 24px}
  .al-seal,.al-copy,.al-foot{display:none}
  .al-badge{width:46px;height:46px}
  .al-side{padding:12px 18px 18px}
  .al-card{padding:24px 22px 20px}
  .al-card::before{left:24px;right:24px}
  .al-head{display:none}
}
@media(prefers-reduced-motion:reduce){
  .al-seal{animation:none;opacity:1}
  .al-spin{animation-duration:2s}
  .al *{transition:none!important}
  .al-btn::after{display:none}
}
`

/* Logo with a text fallback if the image is missing. */
function Logo({ className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className={`${className} fallback`} aria-hidden="true">ACEL</span>
  return (
    <span className={className}>
      <img src={LOGO_SRC} alt="" onError={() => setFailed(true)} />
    </span>
  )
}

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

function validateUsername(value) {
  const v = value.trim()
  if (!v) return 'Enter your username.'
  if (v.length < MIN_USERNAME) return `Username must be at least ${MIN_USERNAME} characters.`
  return ''
}

function validatePassword(value) {
  if (!value) return 'Enter your password.'
  if (!value.trim()) return 'Password cannot be only spaces.'
  if (value.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`
  return ''
}

export default function AdminLogin({ onAuthenticated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ username: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const userRef = useRef(null)
  const passRef = useRef(null)

  const errors = { username: validateUsername(username), password: validatePassword(password) }
  const show = (name) => touched[name] && errors[name]
  const isGood = (name) => touched[name] && !errors[name]

  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }))

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setTouched({ username: true, password: true })
    if (errors.username) { userRef.current?.focus(); return }
    if (errors.password) { passRef.current?.focus(); return }

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
        <div className="al-id">
          <Logo className="al-badge" />
          <p className="al-name">ACEL Secretariat<small>Staff workspace</small></p>
        </div>
        <Rosette />
        <div className="al-copy">
          <h1>Every member, application and certificate in one register.</h1>
          <p>Review applications, keep member records current, issue certificates and answer correspondence without leaving this workspace.</p>
        </div>
        <p className="al-foot">Restricted to authorised ACEL staff.</p>
      </section>

      <section className="al-side">
        <div className="al-card">
          <div className="al-head">
            <Logo className="al-logo" />
            <p><strong>ACEL Secretariat</strong>Authorised staff only</p>
          </div>

          <h2>Welcome back</h2>
          <p className="al-sub">Sign in with the staff account issued by the Secretariat office.</p>

          <form onSubmit={submit} noValidate className="al-form">
            {error && (
              <p role="alert" className="al-banner">
                <AlertCircle size={17} aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            <div className={`al-field${show('username') ? ' bad' : ''}${isGood('username') ? ' good' : ''}`}>
              <label className="al-label" htmlFor="admin-username">Username</label>
              <div className="al-box">
                <span className="al-lead"><User size={18} aria-hidden="true" /></span>
                <input
                  ref={userRef}
                  id="admin-username"
                  className="al-input"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  autoFocus
                  aria-invalid={show('username') ? 'true' : 'false'}
                  aria-describedby={show('username') ? 'admin-username-msg' : undefined}
                  value={username}
                  onChange={(event) => { setUsername(event.target.value); if (error) setError('') }}
                  onBlur={() => touch('username')}
                />
                <span className="al-trail">
                  {isGood('username') && <span className="al-ok"><CheckCircle2 size={18} aria-hidden="true" /></span>}
                </span>
              </div>
              {show('username') && (
                <p id="admin-username-msg" className="al-msg err"><AlertCircle size={14} aria-hidden="true" />{errors.username}</p>
              )}
            </div>

            <div className={`al-field${show('password') ? ' bad' : ''}${isGood('password') ? ' good' : ''}`}>
              <label className="al-label" htmlFor="admin-password">Password</label>
              <div className="al-box">
                <span className="al-lead"><Lock size={18} aria-hidden="true" /></span>
                <input
                  ref={passRef}
                  id="admin-password"
                  className="al-input"
                  style={{ paddingRight: 92 }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={show('password') ? 'true' : 'false'}
                  aria-describedby={show('password') ? 'admin-password-msg' : capsOn ? 'admin-caps' : undefined}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); if (error) setError('') }}
                  onKeyUp={trackCaps}
                  onKeyDown={trackCaps}
                  onBlur={() => { touch('password'); setCapsOn(false) }}
                />
                <span className="al-trail">
                  {isGood('password') && <span className="al-ok"><CheckCircle2 size={18} aria-hidden="true" /></span>}
                  <button
                    type="button"
                    className="al-eye"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </span>
              </div>
              {show('password') && (
                <p id="admin-password-msg" className="al-msg err"><AlertCircle size={14} aria-hidden="true" />{errors.password}</p>
              )}
              {!show('password') && capsOn && (
                <p id="admin-caps" className="al-msg warn"><AlertCircle size={14} aria-hidden="true" />Caps Lock is on.</p>
              )}
            </div>

            <button type="submit" disabled={busy} className="al-btn">
              {busy
                ? <><Loader2 size={18} className="al-spin" aria-hidden="true" /><span>Signing in…</span></>
                : <><LockKeyhole size={17} aria-hidden="true" /><span>Sign in</span></>}
            </button>

            <div className="al-divider">Not staff?</div>
            <a href="/" className="al-back">
              <ArrowLeft size={17} aria-hidden="true" />Back to public website
            </a>
          </form>
        </div>
      </section>
    </main>
  )
}