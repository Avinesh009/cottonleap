import { ScanLine, Eye, FileText, Camera, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

const features = [
  { icon: Eye, label: "Real-time Defect Classification" },
  { icon: FileText, label: "Automatic Fault Recording" },
  { icon: Camera, label: "High-Resolution Vision Sensors" },
];

const FabricInspectionSection = () => {
  return (
    <section className="py-32 bg-forest grid-bg-dark relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsla(152,60%,45%,0.06)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse,hsla(190,90%,50%,0.04)_0%,transparent_70%)]" />

      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// vision_ai.fabric_inspection"}
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-forest-foreground leading-tight">
            AI-Powered Precision:
            <br />
            <span className="neon-text-cyan">Vision-Based</span> Fabric Inspection
          </h2>
          <p className="text-base font-sans text-forest-foreground/60 mt-4 max-w-2xl mx-auto">
            Our Grey Fabric Inspection System integrates directly onto rewinding machines and inspection tables — catching defects human eyes miss.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          {/* AI Scanner Mockup */}
          <div className="glass-dark p-1 rounded-xl relative scan-line">
            <div className="bg-forest rounded-lg p-6 relative overflow-hidden" style={{ minHeight: 340 }}>
              {/* Simulated fabric roll with scan lines */}
              <div className="absolute inset-0 opacity-10">
  {[...Array(20)].map((_, i) => (
    <div
      key={i}
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 10%, hsla(152,40%,50%,0.3) 50%, transparent 90%)",
        marginTop: `${16 + i * 15}px`,
      }}
    />
  ))}
</div>

              {/* Header bar */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
                  </span>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Live Feed — Camera 01</span>
                </div>
                <span className="text-[10px] font-mono text-forest-foreground/40">1920×1080 @ 60fps</span>
              </div>

              {/* Fabric surface simulation */}
              <div className="relative z-10 space-y-4">
                {/* Defect box 1 */}
                <div className="relative border-2 border-neon-green rounded-md p-3 neon-glow-green animate-fade-in" style={{ maxWidth: 220 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-neon-green" />
                    <span className="text-[10px] font-mono font-bold text-neon-green uppercase tracking-wider">Defect Detected: Slub</span>
                  </div>
                  <p className="text-[9px] font-mono text-forest-foreground/50">Confidence: 97.3% · Zone: B4 · Frame #12,847</p>
                </div>

                {/* Defect box 2 */}
                <div className="relative border-2 border-primary rounded-md p-3 neon-glow-cyan animate-fade-in ml-auto" style={{ maxWidth: 200, animationDelay: "0.3s" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">Knot Detected</span>
                  </div>
                  <p className="text-[9px] font-mono text-forest-foreground/50">Confidence: 94.1% · Zone: C2 · Frame #12,851</p>
                </div>

                {/* Clean pass */}
                <div className="flex items-center gap-2 mt-4 opacity-60">
                  <CheckCircle className="w-3 h-3 text-accent" />
                  <span className="text-[9px] font-mono text-accent tracking-wider">Sections A1–A8: PASS — No anomalies</span>
                </div>
              </div>

              {/* Bottom status */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center z-10">
                <span className="text-[9px] font-mono text-forest-foreground/30">Roll #TRP-2026-0847 · Grey Fabric · 48m scanned</span>
                <span className="text-[9px] font-mono text-primary">▮▮▮▮▮▮▮▮▮▯ 92%</span>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="glass-dark p-5 rounded-xl flex items-start gap-4 group hover:border-primary/20 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:neon-glow-cyan transition-all duration-500">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-sans font-medium text-forest-foreground">{feature.label}</p>
                    <p className="text-xs font-sans text-forest-foreground/50 mt-1">
                      {index === 0 && "AI classifies slubs, knots, holes, and weave defects in real time as fabric moves through the system."}
                      {index === 1 && "Every defect is logged with frame number, zone, confidence score, and classification — ready for export."}
                      {index === 2 && "Industrial-grade cameras with 4K resolution capture every fiber at high speed with zero motion blur."}
                    </p>
                  </div>
                </div>
              );
            })}

            <p className="text-[10px] font-mono text-forest-foreground/30 mt-6 leading-relaxed">
              Compatible with all industrial rewinding models. Precision-engineered for single-color woven fabrics.
            </p>

            <Button variant="hero-outline" size="lg" className="mt-2 border-forest-foreground/20 text-forest-foreground/70 hover:bg-forest-foreground/10 hover:text-forest-foreground">
              <ScanLine className="w-4 h-4 mr-2" />
              View Technical Specifications
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FabricInspectionSection;
