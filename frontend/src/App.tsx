import { useEffect, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import People from "./pages/People";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SessionManagement from "./pages/SessionManagement";
import SecurityDashboard from "./pages/SecurityDashboard";
import UserManagement from "./pages/UserManagement";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.is_staff) return <Navigate to="/dashboard" />;
  return children;
};

const App = () => {
  useEffect(() => {
    // Fetch CSRF token cookie once when app mounts
    fetch("/api/csrf/", {
      credentials: "include",
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/people"
                element={
                  <PrivateRoute>
                    <People />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <AdminRoute>
                    <SessionManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <AdminRoute>
                    <SecurityDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


