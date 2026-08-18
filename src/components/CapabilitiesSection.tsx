import { Cpu, FlaskConical, Factory, Leaf } from "lucide-react";

const pillars = [
  {
    icon: Cpu,
    title: "Most Tech Savvy Manufacturer",
    description:
      "Cottonleap OS integrates cutting-edge AI at every stage — from automated pattern grading to IoT-enabled production lines that learn and optimize in real time.",
    tag: "CORE_SYSTEM",
  },
  {
    icon: FlaskConical,
    title: "AI-Driven Sampling",
    description:
      "Reduce sampling cycles from weeks to days. Our neural networks generate accurate digital prototypes, predict fit issues, and slash material waste before a single thread is cut.",
    tag: "AI_MODULE",
  },
  {
    icon: Factory,
    title: "Smart Factory Transparency",
    description:
      "Track every stitch via Cottonleap OS. Our Client Control Center gives you real-time visibility into production status, quality checkpoints, and shipping timelines.",
    tag: "IOT_LAYER",
  },
  {
    icon: Leaf,
    title: "Sustainability at Our Core",
    description:
      "From organic cotton sourcing to zero-waste pattern cutting and solar-powered facilities — sustainability isn't an add-on, it's embedded in our OS.",
    tag: "ECO_ENGINE",
  },
];

const CapabilitiesSection = () => {
  return (
    <section id="capabilities" className="py-32 bg-sage grid-bg-sage relative">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// system.capabilities"}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            Built Different
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="card-elevated p-8 md:p-10 group hover:border-accent/30 transition-all duration-500 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(152,60%,45%,0.05)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <pillar.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/50 tracking-widest">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-4">
                  {pillar.title}
                </h3>
                <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
