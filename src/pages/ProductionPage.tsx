// src/pages/ProductionPage.tsx

import { useState, useEffect } from "react";
import LoginPage from "../components/LoginPage";
import ProductionCalendarDashboard from "../components/ProductionCalendarDashboard";
import type { User } from "../services/ExcelDataService";

const ProductionPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cottonleap_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('cottonleap_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('cottonleap_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('cottonleap_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-sage flex items-center justify-center p-6">
          <LoginPage onLogin={handleLogin} />
        </div>
      ) : (
        currentUser && (
          <ProductionCalendarDashboard 
            currentUser={currentUser} 
            onLogout={handleLogout} 
          />
        )
      )}
    </div>
  );
};

export default ProductionPage;