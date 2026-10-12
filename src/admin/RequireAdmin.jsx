import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAdmin({ authenticated, checking }) {
  if (checking) return <div className="grid min-h-screen place-items-center bg-paper text-sm text-ink/60">Checking admin access…</div>
  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}