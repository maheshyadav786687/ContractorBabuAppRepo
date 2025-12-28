import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ClientsPage from './pages/clients/ClientsPage';
import SitesPage from './pages/sites/SitesPage';
import QuotationsPage from './pages/quotations/QuotationsPage';
const QuotationView = lazy(() => import('@/pages/quotations/QuotationView'));
import ProjectsPage from './pages/projects/ProjectsPage';
import UsersPage from './pages/users/UsersPage';
import TenantsPage from './pages/tenants/TenantsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Placeholder routes - will be implemented in phases */}
          <Route path="users" element={<UsersPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="vendors" element={<div className="text-2xl font-bold">Vendors Module - Coming Soon</div>} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<div className="text-2xl font-bold">Tasks Module - Coming Soon</div>} />
          <Route path="labor" element={<div className="text-2xl font-bold">Labor Module - Coming Soon</div>} />
          <Route path="items" element={<div className="text-2xl font-bold">Items Module - Coming Soon</div>} />
          <Route path="inventory" element={<div className="text-2xl font-bold">Inventory Module - Coming Soon</div>} />
          <Route path="purchase-orders" element={<div className="text-2xl font-bold">Purchase Orders - Coming Soon</div>} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="quotations/:id" element={
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <QuotationView />
            </Suspense>
          } />
          <Route path="invoices" element={<div className="text-2xl font-bold">Invoices Module - Coming Soon</div>} />
          <Route path="expenses" element={<div className="text-2xl font-bold">Expenses Module - Coming Soon</div>} />
          <Route path="reports" element={<div className="text-2xl font-bold">Reports Module - Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
