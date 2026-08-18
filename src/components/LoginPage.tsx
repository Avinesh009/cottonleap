// src/components/LoginPage.tsx

import { useState, useEffect } from "react";
import { Mail, Lock, LogIn, AlertCircle, RefreshCw, Calendar } from "lucide-react";
import ExcelDataService from "../services/ExcelDataService";
import type { User } from "../services/ExcelDataService";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<Array<{name: string, email: string}>>([]);
  const dataService = ExcelDataService.getInstance();

  // Load demo users from the service
  useEffect(() => {
    const loadDemoUsers = async () => {
      try {
        const users = await dataService.getUsers();
        const demoList = users.map(user => ({
          name: `${user.name} (${user.role.replace('_', ' ').toUpperCase()})`,
          email: user.email
        }));
        setDemoUsers(demoList);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadDemoUsers();

    // Listen for user changes
    const handleDataChange = (data: { orders: any[], users: any[] }) => {
      const demoList = data.users.map(user => ({
        name: `${user.name} (${user.role.replace('_', ' ').toUpperCase()})`,
        email: user.email
      }));
      setDemoUsers(demoList);
    };

    dataService.addListener(handleDataChange);
    return () => dataService.removeListener(handleDataChange);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await dataService.login(email, password);
      if (user) {
        const fullUser = {
          ...user,
          password: ""
        } as User;
        onLogin(fullUser);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
          {"// production_calendar.login"}
        </p>
        <h2 className="text-3xl font-serif font-medium text-foreground mb-2">
          Production Dashboard
        </h2>
        <p className="text-sm font-sans text-muted-foreground">
          Sign in to access your production orders
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
                placeholder="your@email.com"
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

        <div className="mt-6">
          <p className="text-[10px] font-mono text-muted-foreground/60 text-center mb-3">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.email}
                onClick={() => {
                  setEmail(demoUser.email);
                  setPassword("password123");
                }}
                className="px-3 py-2 text-[10px] font-mono text-muted-foreground hover:text-foreground border border-border hover:border-accent rounded-lg transition-all truncate"
              >
                {demoUser.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;