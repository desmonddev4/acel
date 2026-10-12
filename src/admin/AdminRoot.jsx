import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminApplications from './pages/AdminApplications.jsx'
import AdminCertificates from './pages/AdminCertificates.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLayout from './AdminLayout.jsx'
import AdminLogin from './AdminLogin.jsx'
import AdminMembers from './pages/AdminMembers.jsx'
import AdminMessages from './pages/AdminMessages.jsx'
import AdminRegistrations from './pages/AdminRegistrations.jsx'
import { adminRequest, getAccessToken } from './api.js'
import RequireAdmin from './RequireAdmin.jsx'

export default function AdminRoot() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    const onUnauthorized = () => {
      setAuthenticated(false)
      setChecking(false)
    }
    window.addEventListener('admin:unauthorized', onUnauthorized)
    if (getAccessToken()) {
      adminRequest('/admin/summary/')
        .then(() => setAuthenticated(true))
        .catch(() => setAuthenticated(false))
        .finally(() => setChecking(false))
    }
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized)
  }, [])

  return (
    <Routes>
      <Route path="login" element={authenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onAuthenticated={() => setAuthenticated(true)} />} />
      <Route element={<RequireAdmin authenticated={authenticated} checking={checking} />}>
        <Route element={<AdminLayout onSignOut={() => setAuthenticated(false)} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}