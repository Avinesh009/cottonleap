import { useEffect, useRef, useState } from "react";
import { Droplets, Wind, Leaf, Recycle } from "lucide-react";

const stats = [
  {
    icon: Droplets,
    value: 12.4,
    suffix: "M",
    unit: "Litres",
    label: "Water Recycled",
    description: "Closed-loop water systems across all facilities",
  },
  {
    icon: Wind,
    value: 8.2,
    suffix: "K",
    unit: "Tons",
    label: "CO₂ Controlled",
    description: "Carbon emissions offset through verified programs",
  },
  {
    icon: Recycle,
    value: 96,
    suffix: "%",
    unit: "",
    label: "Zero-Waste Production",
    description: "Fabric waste diverted from landfills annually",
  },
  {
    icon: Leaf,
    value: 100,
    suffix: "%",
    unit: "",
    label: "Renewable Energy",
    description: "Solar-powered manufacturing facilities",
  },
];

function useCountUp(target: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);

  return count;
}

const StatCard = ({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) => {
  const count = useCountUp(stat.value, 2000, inView);
  const Icon = stat.icon;

  return (
    <div className="glass-dark p-8 md:p-10 text-center group hover:border-accent/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,hsla(152,80%,50%,0.05)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <Icon className="w-5 h-5 text-accent mx-auto mb-4" strokeWidth={1.5} />
        <div className="flex items-baseline justify-center gap-0.5 mb-1">
          <span className="text-4xl md:text-5xl font-mono font-bold text-forest-foreground tabular-nums">
            {stat.value % 1 === 0 ? Math.round(count) : count.toFixed(1)}
          </span>
          <span className="text-xl md:text-2xl font-mono text-accent font-bold">
            {stat.suffix}
          </span>
        </div>
        {stat.unit && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
            {stat.unit}
          </p>
        )}
        <h3 className="text-sm font-sans font-medium text-forest-foreground mt-3 mb-1">
          {stat.label}
        </h3>
        <p className="text-xs font-sans text-white/60 leading-relaxed">
          {stat.description}
        </p>
      </div>
    </div>
  );
};

const ImpactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="sustainability" className="py-32 bg-forest grid-bg-dark relative">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-4">
            {"// eco_engine.green_leap"}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-forest-foreground">
            The Green Leap
          </h2>
          <p className="text-base font-sans text-white/60 mt-4 max-w-xl mx-auto">
            Every stitch counts. Tracked and verified by Cottonleap OS.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
