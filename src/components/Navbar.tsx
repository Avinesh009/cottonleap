import { Link, useLocation } from "react-router-dom";
import { Terminal, Menu, X, Calendar, type LucideIcon } from "lucide-react";
import { useState } from "react";

type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
  isButton?: boolean;
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/production", label: "Production", icon: Calendar },
    { href: "/about", label: "About" },
    { href: "/capabilities", label: "Systems" },
    { href: "/sustainability", label: "Green Leap" },
    { href: "/blog", label: "Blogs" },
    { href: "/contact", label: "Contact", isButton: true },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <nav className="container flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
            <Terminal className="w-4 h-4 text-forest-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-sm font-bold tracking-wider text-foreground uppercase">
              Cottonleap
            </span>
            <span className="text-[9px] font-mono text-accent tracking-widest uppercase">OS v3.2</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => 
            link.isButton ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs font-mono uppercase tracking-widest bg-forest text-forest-foreground px-5 py-2 rounded-lg hover:bg-forest/90 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                  isActive(link.href) 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => 
              link.isButton ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-center text-xs font-mono uppercase tracking-widest px-5 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "bg-forest text-forest-foreground hover:bg-forest/90"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-xs font-mono uppercase tracking-widest py-2 text-center transition-colors flex items-center justify-center gap-2 ${
                    isActive(link.href) 
                      ? "text-accent" 
                      : "text-muted-foreground hover:text-accent"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;