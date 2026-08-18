import { Cpu, Leaf, Shield, Users, Globe } from "lucide-react";

const AboutPage = () => {
  const milestones = [
    { year: "2018", title: "Founded", description: "Cottonleap was born in Tiruppur with a vision to revolutionize textile manufacturing through technology." },
    { year: "2020", title: "OS v1.0 Launched", description: "First version of Cottonleap OS deployed, connecting 50+ machines across the facility." },
    { year: "2022", title: "AI Integration", description: "Machine learning models integrated for predictive quality control and production optimization." },
    { year: "2024", title: "Global Expansion", description: "Opened offices in New Delhi and Ho Chi Minh City, serving clients across 12 countries." },
    { year: "2026", title: "OS v3.2", description: "Current version with full IoT transparency, AI-driven sampling, and real-time client dashboards." },
  ];

  const values = [
    {
      icon: Cpu,
      title: "Technology First",
      description: "We believe in the power of technology to transform traditional manufacturing into intelligent, data-driven operations.",
    },
    {
      icon: Leaf,
      title: "Sustainability Always",
      description: "Every decision we make considers environmental impact. From water recycling to solar power, we're committed to a greener future.",
    },
    {
      icon: Users,
      title: "Client Centric",
      description: "Your success is our success. We build transparent systems that give you complete visibility and control over your production.",
    },
    {
      icon: Shield,
      title: "Quality Obsessed",
      description: "From AI-powered inspections to rigorous quality checks, we never compromise on the quality of our work.",
    },
  ];

  const teamStats = [
    { label: "Team Members", value: "85+" },
    { label: "Countries Served", value: "12" },
    { label: "Years of Experience", value: "8" },
    { label: "Client Satisfaction", value: "98%" },
  ];

  return (
    <section className="min-h-screen py-32 bg-sage grid-bg-sage relative">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// about.cottonleap"}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">
            The Brain Behind
            <br />
            <span className="text-accent">Smart Manufacturing</span>
          </h2>
          <p className="text-base font-sans text-muted-foreground max-w-2xl mx-auto">
            Cottonleap OS is the culmination of years of innovation, combining AI, IoT, and textile expertise to create the smartest factory on earth.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="card-elevated p-8 md:p-12 text-center mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsla(152,60%,45%,0.05)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <Globe className="w-8 h-8 text-accent mx-auto mb-4" strokeWidth={1.5} />
            <blockquote className="text-xl md:text-2xl font-serif font-medium text-foreground leading-relaxed max-w-2xl mx-auto">
              "We're not just building a factory. We're building the future of textile manufacturing — one that's intelligent, transparent, and sustainable."
            </blockquote>
            <p className="text-sm font-sans text-muted-foreground mt-4">
              — Cottonleap OS Team
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-serif font-medium text-foreground text-center mb-10">
            Our Core Values
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="glass p-8 rounded-xl hover:border-accent/20 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-medium text-foreground mb-2">
                        {value.title}
                      </h4>
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {teamStats.map((stat) => (
            <div key={stat.label} className="glass p-6 text-center rounded-xl">
              <p className="text-2xl md:text-3xl font-mono font-bold text-accent">{stat.value}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-2xl font-serif font-medium text-foreground text-center mb-10">
            Our Journey
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className="w-1/2 pr-8 text-right">
                    <span className="text-2xl font-mono font-bold text-accent">{milestone.year}</span>
                    <h4 className="text-lg font-serif font-medium text-foreground mt-1">
                      {milestone.title}
                    </h4>
                    <p className="text-sm font-sans text-muted-foreground mt-2">
                      {milestone.description}
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-accent border-4 border-background relative z-10" />
                  <div className="w-1/2 pl-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;