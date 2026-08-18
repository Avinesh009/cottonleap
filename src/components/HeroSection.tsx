const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Cotton field background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530836176759-510f58baebf4?auto=format&fit=crop&w=2000&q=80')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsla(152,55%,6%,0.75)] via-[hsla(152,40%,8%,0.7)] to-[hsla(152,55%,6%,0.85)]" />
      
      {/* Scan line overlay */}
      <div className="absolute inset-0 scan-line pointer-events-none" />
      
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg-dark pointer-events-none" />

      {/* Corner accents */}
      <div className="absolute top-20 left-6 w-20 h-20 border-l border-t border-accent/30" />
      <div className="absolute bottom-20 right-6 w-20 h-20 border-r border-b border-accent/30" />

      <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center">
        {/* System status badge */}
        <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green neon-glow-green" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/70">
            Cottonleap OS — All Systems Online
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-[0.95] mb-8 animate-fade-up">
          The Smartest
          <br />
          <span className="neon-text-cyan">Factory</span>{" "}
          <em className="font-normal italic text-white">in Textiles</em>
        </h1>
        
        <p className="text-lg md:text-xl font-sans font-light text-white/70 max-w-2xl mx-auto mb-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          AI-driven manufacturing with real-time IoT transparency.
          <br className="hidden md:block" />
          Powered by <span className="text-accent font-medium">Cottonleap OS</span>.
        </p>

        <p className="text-xs font-mono text-white/30 mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          // 150+ machines connected · Tiruppur, India · Latency: 12ms
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="#command-center"
            className="inline-flex items-center justify-center px-8 py-4 bg-forest text-forest-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-forest/90 transition-all neon-glow-green glitch-hover rounded-lg"
          >
            ▸ Launch Control Center
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-xs font-mono uppercase tracking-widest font-semibold hover:border-accent hover:text-accent transition-all glitch-hover rounded-lg"
          >
            ▸ Start a Project
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
