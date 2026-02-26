import { site } from "@/lib/site";

interface EvidenceLink {
  label: string;
  href: string;
}

interface CompetitorItem {
  name: string;
  focus: string;
  whyNotBlocking: string;
  href: string;
}

interface ClaimFrame {
  title: string;
  body: string;
}

export interface PatentIntelligence {
  code: string;
  filedOn: string;
  title: string;
  claimAnchor: string;
  summary: string;
  claimFrames: ClaimFrame[];
  defensibilitySignals: string[];
  competitors: CompetitorItem[];
  successDrivers: string[];
  riskChecks: string[];
  legalRealityChecks: string[];
  evidence: EvidenceLink[];
}

const legalRealityChecks = [
  "German utility models are fast, but they are not automatically examined for novelty and inventive step before registration.",
  "Strength comes from precise technical claim language and a clear prior-art gap, not from branding text.",
  "Real defensibility is tested in cancellation or infringement disputes, so evidence discipline is mandatory."
];

const legalEvidence: EvidenceLink[] = [
  { label: "DPMA Utility Models", href: "https://www.dpma.de/english/utility_models/index.html" },
  {
    label: "DPMA Registration Procedure",
    href: "https://www.dpma.de/english/utility_models/registration_procedure/index.html"
  },
  {
    label: "DPMA Cancellation Proceedings",
    href: "https://www.dpma.de/english/utility_models/cancellation_proceedings/index.html"
  },
  { label: "EPO Problem-Solution Approach", href: "https://www.epo.org/en/legal/guidelines-epc/2025/g_vii_5.html" }
];

const map: Record<string, PatentIntelligence> = {
  "01-petvat": {
    code: "AB-01",
    filedOn: "2026-02-14",
    title: "AI-assisted multisensor health monitoring and diagnostics for pets",
    claimAnchor:
      "Edge gateway anomaly filtering + cloud escalation + optional biochemical follow-up in one operational chain.",
    summary:
      "Defensibility comes from workflow coupling. Most competitors sell collars, trackers, or feeders, while this claim family protects a full diagnostic escalation logic.",
    claimFrames: [
      {
        title: "Edge-First Triage",
        body: "Local anomaly pre-filtering before cloud activation reduces cost and creates a distinct technical architecture."
      },
      {
        title: "Multisensor Correlation",
        body: "Optical, chemical, thermal, and acoustic channels are fused before alerting, not treated as isolated signals."
      },
      {
        title: "Actionable Escalation",
        body: "The system can trigger validated follow-up sampling workflows, not only passive dashboards."
      }
    ],
    defensibilitySignals: [
      "Combination claim structure protects a process chain instead of one widget.",
      "Threshold-triggered cloud activation is architecturally explicit.",
      "Modular deployment variants create product and claim breadth."
    ],
    competitors: [
      {
        name: "Tractive",
        focus: "GPS + wearable pet tracking",
        whyNotBlocking: "Wearable tracking focus is different from stationary multisensor diagnostic escalation.",
        href: "https://tractive.com/"
      },
      {
        name: "Fi",
        focus: "Smart dog collar telemetry",
        whyNotBlocking: "Collar-first products do not cover the same local station + triggered cloud diagnostic chain.",
        href: "https://tryfi.com/"
      },
      {
        name: "Petlibro",
        focus: "Feeding automation hardware",
        whyNotBlocking: "Feeder automation does not claim the same multimodal health inference architecture.",
        href: "https://petlibro.com/collections/automatic-pet-feeder"
      }
    ],
    successDrivers: [
      "Pet health spending remains resilient with preventive-care demand.",
      "Owners understand a simple value proposition quickly: detect earlier, escalate smarter."
    ],
    riskChecks: [
      "Veterinary validation quality must stay high to control false positives.",
      "Household health data handling must remain privacy-safe and audit-ready."
    ],
    legalRealityChecks,
    evidence: [
      ...legalEvidence,
      { label: "Tractive Product Stack", href: "https://tractive.com/" },
      { label: "Fi Smart Collar", href: "https://tryfi.com/" }
    ]
  },
  "02-human-fitness-pulse": {
    code: "AB-02",
    filedOn: "2026-02-14",
    title: "Contactless multisensor mirror for multi-user vitals and coaching",
    claimAnchor:
      "Mirror substrate + rPPG + multi-user triangulation + real-time avatar coaching in one integrated system.",
    summary:
      "Defensibility sits in full-system integration. Existing categories are usually fragmented across wearables, camera fitness, and gym hardware.",
    claimFrames: [
      {
        title: "Multi-User Spatial Logic",
        body: "Triangulated localization differentiates simultaneous household or studio use."
      },
      {
        title: "Contactless Vitals",
        body: "rPPG-based sensing removes wearable friction and supports repeat usage behavior."
      },
      {
        title: "Coachable Interface",
        body: "Avatar feedback connects biometrics to understandable action."
      }
    ],
    defensibilitySignals: [
      "Hardware geometry, signal processing, and interface are claimed together.",
      "Real-time multi-user coupling is hard to replicate with wearable-only systems."
    ],
    competitors: [
      {
        name: "Tonal",
        focus: "Strength hardware and classes",
        whyNotBlocking: "Different product center; not the same contactless vital-sign mirror architecture.",
        href: "https://tonal.com/products/tonal-2"
      },
      {
        name: "Tempo",
        focus: "Camera-guided home fitness",
        whyNotBlocking: "Category overlap exists, but not the same claim chain around rPPG multi-user mirror logic.",
        href: "https://tempo.fit/contact"
      },
      {
        name: "Oura / WHOOP class",
        focus: "Wearable physiological tracking",
        whyNotBlocking: "Wearable products do not cover the same integrated mirror substrate claim space.",
        href: "https://ouraring.com/store/rings/oura-ring-4/silver"
      }
    ],
    successDrivers: [
      "Consumer fitness retention improves when feedback is immediate and understandable.",
      "One shared device can serve families and group coaching contexts."
    ],
    riskChecks: [
      "Signal quality needs robust handling across skin tone, motion, and lighting.",
      "No medical-treatment claims without regulatory evidence."
    ],
    legalRealityChecks,
    evidence: [...legalEvidence]
  },
  "03-aqua-wild-station": {
    code: "AB-03",
    filedOn: "2026-02-14",
    title: "Autonomous multisensor habitat monitoring and biological detection",
    claimAnchor:
      "Field autonomy + ecological anomaly detection + response pipeline instead of pure telemetry hardware.",
    summary:
      "Defensibility is the operating chain in unstructured environments, not only one measurement sensor.",
    claimFrames: [
      {
        title: "Autonomous Field Operation",
        body: "Designed for continuous deployment where manual sampling cadence is insufficient."
      },
      {
        title: "Biological Event Detection",
        body: "Moves beyond simple parameter logging into actionable ecosystem risk alerts."
      },
      {
        title: "Operator Workflow Fit",
        body: "Output is structured for intervention decisions, not just raw charting."
      }
    ],
    defensibilitySignals: [
      "Combines sensor, inference, and operation in one protected flow.",
      "Focus on unstructured habitats creates a narrower and stronger technical boundary."
    ],
    competitors: [
      {
        name: "YSI EXO",
        focus: "Water quality sondes and monitoring",
        whyNotBlocking: "Strong instrumentation, but different autonomy and biological response logic scope.",
        href: "https://www.ysi.com/exo"
      },
      {
        name: "In-Situ",
        focus: "Water quality solutions",
        whyNotBlocking: "Monitoring overlap exists, yet claim target is broader ecological event automation.",
        href: "https://in-situ.com/us/products/water-quality"
      }
    ],
    successDrivers: [
      "Aquaculture and conservation operations need earlier anomaly signals.",
      "Operators need practical intervention guidance, not just delayed reports."
    ],
    riskChecks: [
      "Field calibration and maintenance cycles must be industrially reliable.",
      "Deployment permissions vary by region and must be prepared early."
    ],
    legalRealityChecks,
    evidence: [
      ...legalEvidence,
      {
        label: "FAO Fisheries and Aquaculture Record",
        href: "https://www.fao.org/newsroom/detail/fao-report-global-fisheries-and-aquaculture-production-reaches-a-new-record-high/en"
      }
    ]
  },
  "04-auto-nutrition-care": {
    code: "AB-04",
    filedOn: "2026-02-14",
    title: "Biometrically verified dispensing of pharmaceuticals and supplements",
    claimAnchor:
      "Identity verification + vital-state check + controlled release loop for feeding and medication routines.",
    summary:
      "Defensibility lies in safety-critical release logic, not only schedule automation.",
    claimFrames: [
      {
        title: "Identity-Locked Access",
        body: "Targets multi-pet households where wrong intake assignment is a real risk."
      },
      {
        title: "State-Aware Dispensing",
        body: "Release decisions can include health-state checks, not only static timers."
      },
      {
        title: "Traceable Compliance Loop",
        body: "Workflow supports caregiver and vet review with clear evidence logs."
      }
    ],
    defensibilitySignals: [
      "Safety and dispensing claims are coupled to biometric verification.",
      "Problem-to-solution chain is commercially concrete and hard to dismiss."
    ],
    competitors: [
      {
        name: "SureFeed",
        focus: "Microchip feeding access",
        whyNotBlocking: "Identity features overlap, but vital-state-linked dosing logic is distinct.",
        href: "https://www.surepetcare.com/en-us/pet-feeder/microchip-pet-feeder-connect"
      },
      {
        name: "Petlibro",
        focus: "Timed feeding automation",
        whyNotBlocking: "Timer-based feeders do not claim the same health-verified dispensing chain.",
        href: "https://petlibro.com/collections/automatic-pet-feeder"
      }
    ],
    successDrivers: [
      "Caregiver pain is obvious: dosing mistakes and schedule drift.",
      "Vet-compatible compliance history increases trust and retention."
    ],
    riskChecks: [
      "Fail-safe logic must be robust for hardware and profile mismatch edge cases.",
      "Lifecycle hygiene and reliability are critical in home environments."
    ],
    legalRealityChecks,
    evidence: [...legalEvidence]
  },
  "05-mind-safe-guardian": {
    code: "AB-05",
    filedOn: "2026-02-14",
    title: "Anonymized multimodal danger detection for public spaces",
    claimAnchor:
      "Multimodal sensor fusion with anonymization built into detection workflows and escalation logic.",
    summary:
      "Defensibility depends on technical anonymization plus practical alert quality under strict legal constraints.",
    claimFrames: [
      {
        title: "Anonymization as Core Mechanism",
        body: "Privacy protection is part of system function, not a post-processing add-on."
      },
      {
        title: "Multimodal Risk Correlation",
        body: "Combining channels reduces false alarms compared with single-sensor strategies."
      },
      {
        title: "Governance-Ready Escalation",
        body: "Alerts are structured for accountable response and review."
      }
    ],
    defensibilitySignals: [
      "Strong social need with strict legal framing creates demand for compliant technical designs.",
      "Sensor fusion plus governance logic creates a deeper moat than point products."
    ],
    competitors: [
      {
        name: "SoundThinking",
        focus: "Gunshot detection systems",
        whyNotBlocking: "Audio-centric scope differs from anonymized multimodal danger modeling.",
        href: "https://www.soundthinking.com/law-enforcement/leading-gunshot-detection-system/"
      },
      {
        name: "Flock Safety",
        focus: "Video and audio public safety stack",
        whyNotBlocking: "Competes in adjacent outcomes, but not the same claimed anonymized fusion chain.",
        href: "https://www.flocksafety.com/lp/video-solutions"
      }
    ],
    successDrivers: [
      "Public and institutional buyers need early warning with legal defensibility.",
      "EU AI regulation increases value of compliance-by-design systems."
    ],
    riskChecks: [
      "Bias control, transparency, and complaint process design are mandatory.",
      "Regulatory interpretation can shift and requires active monitoring."
    ],
    legalRealityChecks,
    evidence: [
      ...legalEvidence,
      {
        label: "EU AI Act Parliament Adoption",
        href: "https://www.europarl.europa.eu/news/en/press-room/20240308IPR19015/artificial-intelligence-act-meps-adopt-landmark-law"
      },
      { label: "EU Commission AI Act Entry Into Force", href: "https://commission.europa.eu/news/ai-act-enters-force-2024-08-01_en" }
    ]
  },
  "06-biorotic-sync": {
    code: "AB-06",
    filedOn: "2026-02-14",
    title: "Biometric telepresence with haptic feedback and predictive latency control",
    claimAnchor:
      "Closed-loop coupling between biosignals, robotic actuation, haptic return channels, and predictive control.",
    summary:
      "Defensibility comes from loop closure and adaptation logic, not remote control alone.",
    claimFrames: [
      {
        title: "Biosignal-to-Actuation Loop",
        body: "Robot behavior adapts to measured physiological and biochemical signals."
      },
      {
        title: "Bidirectional Haptics",
        body: "Feedback channels produce a two-way interaction model rather than one-way output."
      },
      {
        title: "Predictive Latency Logic",
        body: "Model-based compensation targets lower perceived lag and stronger continuity."
      }
    ],
    defensibilitySignals: [
      "Multiple dependent claims add fallback positions around sensing, feedback, and control.",
      "Integration complexity creates practical barriers for direct copycats."
    ],
    competitors: [
      {
        name: "Lovense",
        focus: "App-based remote interaction products",
        whyNotBlocking: "Remote app control focus differs from biometric closed-loop control claims.",
        href: "https://www.lovense.com/how-to-use-lovense-remote-app"
      },
      {
        name: "Kiiroo",
        focus: "Teledildonics ecosystem",
        whyNotBlocking: "Category overlap exists, but not the same claimed biometric adaptation architecture.",
        href: "https://www.kiiroo.com/pages/teledildonics"
      }
    ],
    successDrivers: [
      "Long-distance interaction demand is persistent and global.",
      "Core architecture can extend into adjacent assistive and therapeutic contexts."
    ],
    riskChecks: [
      "Consent, safety, and abuse prevention controls are product-critical.",
      "Sensitive data flows must be secured and transparently governed."
    ],
    legalRealityChecks,
    evidence: [...legalEvidence]
  },
  "07-spaice-logistic": {
    code: "AB-07/08/09",
    filedOn: "2026-02-14",
    title: "Distributed drone delivery station, charging node, and multi-drone orchestration",
    claimAnchor:
      "Property-level infrastructure + energy node + network management stack, not aircraft operations only.",
    summary:
      "Defensibility is in infrastructure orchestration and station economics, beyond flight algorithms.",
    claimFrames: [
      {
        title: "DE-07 Station Exchange",
        body: "Automated package handover at household or building nodes."
      },
      {
        title: "DE-08 Charging Layer",
        body: "Drone charging with integrated storage to support operational continuity."
      },
      {
        title: "DE-09 Multi-Drone Control",
        body: "Network-level planning and conflict handling with UTM-compatible logic."
      }
    ],
    defensibilitySignals: [
      "Protection is distributed across hardware, energy, and orchestration layers.",
      "Node-network strategy creates compounding network effects."
    ],
    competitors: [
      {
        name: "Wing",
        focus: "Drone delivery operations",
        whyNotBlocking: "Operational network leader, but with different property-node ownership thesis.",
        href: "https://wing.com/"
      },
      {
        name: "Amazon Prime Air",
        focus: "Retail drone delivery",
        whyNotBlocking: "Strong delivery stack, but not the same multi-station owner-participation model.",
        href: "https://www.aboutamazon.com/news/transportation/amazon-drone-delivery-arizona"
      },
      {
        name: "Zipline",
        focus: "Medical and logistics drone operations",
        whyNotBlocking: "Flight execution is strong, while protected claim focus is station infrastructure orchestration.",
        href: "https://www.faa.gov/newsroom/faa-authorizes-zipline-deliver-commercial-packages-beyond-line-sight"
      }
    ],
    successDrivers: [
      "BVLOS pathway maturity increases deployment feasibility.",
      "Time-critical logistics remains a high-value use case."
    ],
    riskChecks: [
      "Airspace and local permit compliance are primary execution risks.",
      "Hardware service reliability must be industrialized early."
    ],
    legalRealityChecks,
    evidence: [...legalEvidence, { label: "FAA BVLOS Overview", href: "https://www.faa.gov/newsroom/beyond-visual-line-sight-bvlos" }]
  },
  "08-enzyclean": {
    code: "AB-08",
    filedOn: "2026-02-26",
    title: "Sequential biochemical decomposition of mixed household waste",
    claimAnchor:
      "Sequential process chain for mixed household waste classes instead of single food-scrap drying or grinding.",
    summary:
      "Defensibility is process-depth and mixed-material handling logic, not commodity appliance features.",
    claimFrames: [
      {
        title: "Sequential Bio-Processing",
        body: "Process order and control logic are central to outcome quality."
      },
      {
        title: "Mixed-Waste Scope",
        body: "Targets broader household waste handling beyond narrow food-only flows."
      },
      {
        title: "Home-Compatible Operation",
        body: "Bridges waste process engineering with practical domestic deployment."
      }
    ],
    defensibilitySignals: [
      "Method sequence can be claimed as a distinct technical pathway.",
      "Mixed-class handling creates stronger differentiation from food recycler products."
    ],
    competitors: [
      {
        name: "Lomi",
        focus: "Food waste countertop reduction",
        whyNotBlocking: "Food-focused appliance scope differs from mixed-waste sequential biochemical chain.",
        href: "https://lomi.com/products/lomi-2"
      },
      {
        name: "Mill",
        focus: "Kitchen food waste drying service",
        whyNotBlocking: "Strong consumer model, but claim scope differs on mixed-waste biochemical sequencing.",
        href: "https://www.mill.com/how-it-works"
      },
      {
        name: "Vitamix FoodCycler",
        focus: "Food scrap reduction appliance",
        whyNotBlocking: "Category overlap exists, though not the same mixed-household process thesis.",
        href: "https://www.vitamix.com/us/en_us/products/foodcycler-fc-50"
      }
    ],
    successDrivers: [
      "Household waste and disposal-cost pressure remain structural issues.",
      "Users value simple low-odor systems with measurable waste reduction."
    ],
    riskChecks: [
      "Hygiene, safety, and long-term material robustness are core engineering risks.",
      "Waste-treatment and product-safety rules vary by market and need early planning."
    ],
    legalRealityChecks,
    evidence: [
      ...legalEvidence,
      { label: "EPA Wasted Food Basics", href: "https://www.epa.gov/sustainable-management-food/sustainable-management-food-basics" }
    ]
  }
};

export const patentIntel: PatentIntelligence = map[site.id] ?? map["01-petvat"];
export const patentResearchUpdatedAt = "2026-02-26";
