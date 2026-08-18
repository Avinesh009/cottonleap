// src/components/AdminLogin.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, RefreshCw } from "lucide-react";
import ExcelDataService from "../services/ExcelDataService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dataService = ExcelDataService.getInstance();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await dataService.login(email, password);
      
      if (user) {
        // Check if user has admin access (super_admin or production_manager or quality_control)
        if (user.role === 'super_admin' || user.role === 'production_manager' || user.role === 'quality_control') {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_email', email);
          localStorage.setItem('admin_user_id', user.id);
          navigate('/admin/dashboard');
        } else {
          setError("You don't have admin access. Please contact your administrator.");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// cottonleap.admin"}
          </p>
          <h2 className="text-3xl font-serif font-medium text-foreground mb-2">
            Admin Login
          </h2>
          <p className="text-sm font-sans text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                  placeholder="admin@cottonleap.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center">
              <p className="text-[10px] font-mono text-muted-foreground/60">
                Super Admin: admin@cottonleap.com / admin123
              </p>
              <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                Production Manager: sarah@cottonleap.com / password123
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;