import { Routes, Route, Navigate } from 'react-router-dom'
import Landing        from './pages/public/Landing'
import Register       from './pages/public/Register'
import Login          from './pages/public/Login'
import Demo           from './pages/public/Demo'
import PortalLayout   from './components/layout/PortalLayout'
import Dashboard      from './pages/portal/Dashboard'
import ApiKeys        from './pages/portal/ApiKeys'
import Docs           from './pages/portal/Docs'
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminLogs      from './pages/admin/AdminLogs'

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />}  />
      <Route path="/register" element={<Register />} />
      <Route path="/login"    element={<Login />}    />
      <Route path="/demo"     element={<Demo />}     />

      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="/portal/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="keys"      element={<ApiKeys />}   />
        <Route path="docs"      element={<Docs />}      />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"     element={<AdminUsers />}     />
        <Route path="logs"      element={<AdminLogs />}      />
      </Route>
    </Routes>
  )
}