import { Cloud, Cpu, Wifi, Server, Radio, BarChart3, Shield, Zap } from "lucide-react";

const nodes = [
  { icon: Cpu, label: "Cutting Machines", count: 12, status: "online" },
  { icon: Zap, label: "Sewing Lines", count: 18, status: "online" },
  { icon: Radio, label: "QC Sensors", count: 8, status: "online" },
  { icon: BarChart3, label: "Finishing Units", count: 9, status: "online" },
];

const IoTSection = () => {
  return (
    <section id="iot" className="py-32 bg-muted/30 grid-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsla(190,90%,50%,0.04)_0%,transparent_70%)]" />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// industry_4.0.iot_grid"}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            150+ Machines. One Brain.
          </h2>
          <p className="text-base font-sans text-muted-foreground mt-4 max-w-xl mx-auto">
            Every machine in our Tiruppur facility is connected to Cottonleap OS via industrial IoT sensors, feeding real-time data to your dashboard.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-4xl mx-auto">
          {/* Cloud layer */}
          <div className="glass-strong p-6 rounded-xl text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="text-sm font-mono font-bold text-primary tracking-wider uppercase">Cottonleap OS — Cloud</span>
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <p className="text-[10px] font-mono text-white/50">
              Real-time data aggregation · AI analytics · Client dashboards · Anomaly detection
            </p>
          </div>

          {/* Connection lines */}
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse-dot" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>

          {/* Edge layer */}
          <div className="glass p-5 rounded-xl">
            <div className="flex items-center justify-center gap-3">
              <Server className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Edge Gateway — Tiruppur Facility</span>
              <Wifi className="w-4 h-4 text-accent animate-pulse-dot" />
            </div>
          </div>

          {/* Connection lines */}
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          {/* Machine layer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.label}
                  className="glass p-5 rounded-xl text-center group hover:border-accent/30 transition-all duration-500 relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-green" />
                    </span>
                  </div>
                  <Icon className="w-6 h-6 text-primary mx-auto mb-3 group-hover:animate-float" strokeWidth={1.5} />
                  <p className="text-xs font-sans font-medium text-foreground mb-1">{node.label}</p>
                  <p className="text-lg font-mono font-bold text-primary">{node.count}</p>
                  <p className="text-[9px] font-mono text-accent uppercase tracking-widest mt-1">{node.status}</p>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="mt-6 glass-strong rounded-xl p-4 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white">
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-primary">150+</p>
              <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Machines</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-accent">99.7%</p>
              <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Uptime</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-primary">12ms</p>
              <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Latency</p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-accent">2.4M</p>
              <p className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Data Points/Day</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IoTSection;
