export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  short: string;
  subtitle: string;
  domain: string;
  email: string;
  heroTitle: string;
  heroHighlight: string;
  heroBody: string;
  signals: string[];
  stats: StatItem[];
  features: FeatureItem[];
  market: FeatureItem[];
  problems: FeatureItem[];
  prototype: FeatureItem[];
  investors: FeatureItem[];
  faq: FaqItem[];
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/patent", label: "Patent" },
  { href: "/technology", label: "Technology" },
  { href: "/market", label: "Market" },
  { href: "/problems", label: "Problems" },
  { href: "/prototype", label: "Prototype" },
  { href: "/investors", label: "Investors" },
  { href: "/faq", label: "FAQ" }
] as const;

export const ctaLinks = [
  { href: "/waitlist", label: "Join Waitlist", primary: true },
  { href: "/donate", label: "Donate", primary: false }
] as const;

export const site: SiteConfig = {
  id: "08-enzyclean",
  name: "EnzyClean",
  short: "EC",
  subtitle: "Sequential Waste Bioprocessing",
  domain: "https://enzyclean.artificial-biometrics.com",
  email: "hello@enzyclean.ai",
  heroTitle: "Household waste processing",
  heroHighlight: "with sequential biochemical control",
  heroBody:
    "EnzyClean converts mixed household waste streams through a staged biochemical process chain designed for cleaner handling, lower odor, and measurable reduction.",
  signals: ["Waste Process AI", "Biochemical Sequencing", "Home Circularity", "Portfolio Node 08"],
  stats: [
    { value: "2.5B t", label: "Municipal waste yearly" },
    { value: "Food + mixed", label: "Broader intake class" },
    { value: "Low odor", label: "Household usability target" },
    { value: "24/7", label: "Automated process loop" }
  ],
  features: [
    {
      title: "Sequential Biochemical Chain",
      body: "A process-ordered treatment flow that improves reduction outcomes for mixed household inputs."
    },
    {
      title: "Mixed-Waste Handling Logic",
      body: "Designed for real-world domestic streams beyond narrow food-scrap-only appliances."
    },
    {
      title: "Smart Process Control",
      body: "Sensors and software coordinate cycle transitions to keep quality and safety stable."
    },
    {
      title: "Home-Ready Experience",
      body: "Built for simple daily use with clear state feedback and predictable maintenance."
    }
  ],
  market: [
    {
      title: "Structural Waste Pressure",
      body: "Households and municipalities face persistent cost and sustainability pressure."
    },
    {
      title: "Consumer Readiness",
      body: "Users increasingly adopt practical at-home systems with visible environmental impact."
    },
    {
      title: "Circular Economy Tailwind",
      body: "Policy and retail ecosystems are moving toward measurable waste-reduction workflows."
    }
  ],
  problems: [
    {
      title: "Mixed Waste Friction",
      body: "Most home devices focus on narrow waste classes and leave broader streams unresolved."
    },
    {
      title: "Odor and Hygiene Burden",
      body: "Conventional household handling creates unpleasant and inconsistent routines."
    },
    {
      title: "Low Process Transparency",
      body: "Users often cannot verify reduction quality or process reliability."
    }
  ],
  prototype: [
    {
      title: "Phase 1: Process Core",
      body: "Validate sequential biochemical cycle stability across mixed household input sets."
    },
    {
      title: "Phase 2: Sensor + Control",
      body: "Optimize process-state sensing and transition logic for safety and consistency."
    },
    {
      title: "Phase 3: Home Pilots",
      body: "Run controlled domestic pilots and tune maintenance, UX, and lifecycle economics."
    }
  ],
  investors: [
    {
      title: "Large Problem Surface",
      body: "Household waste remains a global, recurring pain point with clear spending relevance."
    },
    {
      title: "Process Defensibility",
      body: "Sequential mixed-waste biochemical logic can form a meaningful technical moat."
    },
    {
      title: "Portfolio Fit",
      body: "AIOMETRICS shared stack accelerates rollout speed and lowers operating complexity."
    }
  ],
  faq: [
    {
      q: "Is this only a food recycler?",
      a: "No. EnzyClean is designed for broader mixed household streams with sequential biochemical treatment."
    },
    {
      q: "Why is sequential processing important?",
      a: "Process order is central to stability, odor control, and overall reduction effectiveness."
    },
    {
      q: "What makes this defensible?",
      a: "The claim focus is on mixed-waste process logic and system coordination, not a single appliance feature."
    }
  ]
};
