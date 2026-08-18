import { Terminal } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-forest py-20">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm font-bold tracking-wider text-forest-foreground uppercase">Cottonleap</span>
                <span className="text-[9px] font-mono text-accent tracking-widest uppercase">OS v3.2</span>
              </div>
            </div>
            <p className="text-sm font-sans text-white/60 leading-relaxed max-w-xs">
              The smartest factory on earth. Technology-first, sustainability-always. Powered by Cottonleap OS.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">
              // Navigation
            </h4>
            <ul className="space-y-2 text-sm font-sans text-white/60">
              <li><a href="#capabilities" className="hover:text-accent transition-colors">Systems</a></li>
              <li><a href="#command-center" className="hover:text-accent transition-colors">Control Center</a></li>
              <li><a href="#iot" className="hover:text-accent transition-colors">IoT Grid</a></li>
              <li><a href="#sustainability" className="hover:text-accent transition-colors">Green Leap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">
              // Initialize Project
            </h4>
            <p className="text-sm font-sans text-white/60 mb-4">
              Ready to manufacture with Cottonleap OS?
            </p>
            <a
              href="mailto:hello@cottonleap.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-accent/90 transition-all rounded-lg neon-glow-green"
            >
              hello@cottonleap.com
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-white/30">
            © 2026 Cottonleap OS. All rights reserved.
          </p>
          <p className="text-xs font-mono text-white/30">
            Smart Manufacturing · Tiruppur · New Delhi · Ho Chi Minh City
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
