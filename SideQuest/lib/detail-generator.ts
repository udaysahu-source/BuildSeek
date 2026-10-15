import { Hackathon } from "./types";

export interface HackathonRound {
  phase: number;
  name: string;
  date?: string | null;
  description: string;
}

export interface HackathonTrack {
  name: string;
  description: string;
  suggested_tech: string[];
}

export interface PrizeBreakdown {
  place: string;
  reward: string;
  description?: string;
}

export interface RichHackathonDetails {
  summary: string;
  description: string;
  rounds: HackathonRound[];
  tracks: HackathonTrack[];
  prizes_breakdown: PrizeBreakdown[];
  submission_guidelines: string[];
  rules: string[];
  judging_criteria: { criterion: string; weight: string; description: string }[];
}

/**
 * Derives rich, domain-specific tracks based on tags and title.
 */
function deriveTracks(title: string, tags: string[] = []): HackathonTrack[] {
  const lower = `${title} ${tags.join(" ")}`.toLowerCase();
  const tracks: HackathonTrack[] = [];

  if (lower.includes("ai") || lower.includes("vision") || lower.includes("intelligence") || lower.includes("machine learning")) {
    tracks.push({
      name: "AI & Intelligent Systems",
      description: "Build autonomous agents, computer vision pipelines, or LLM-powered applications that solve tangible domain challenges.",
      suggested_tech: ["Python", "PyTorch", "OpenCV", "LangChain", "Gemini API", "Hugging Face"],
    });
  }

  if (lower.includes("vr") || lower.includes("quest") || lower.includes("reality") || lower.includes("game") || lower.includes("3d")) {
    tracks.push({
      name: "Spatial Computing & Mixed Reality",
      description: "Craft immersive, hands-first 3D experiences, spatial interaction models, or interactive VR worlds.",
      suggested_tech: ["Unity", "Unreal Engine 5", "WebXR", "Three.js", "OpenXR", "Meta SDK"],
    });
  }

  if (lower.includes("fintech") || lower.includes("bank") || lower.includes("credit") || lower.includes("money") || lower.includes("rupee")) {
    tracks.push({
      name: "Next-Gen FinTech & Financial Inclusion",
      description: "Architect fraud-resistant payment flows, decentralized micro-credit underwriting, and accessible digital asset rails.",
      suggested_tech: ["Next.js", "Solidity", "Node.js", "PostgreSQL", "UPI / Open APIs", "FastAPI"],
    });
  }

  if (lower.includes("health") || lower.includes("care") || lower.includes("biotech") || lower.includes("medical")) {
    tracks.push({
      name: "HealthTech & Preventive Wellness",
      description: "Empower patients and healthcare workers with diagnostic assistance, secure health records, and telemedicine tooling.",
      suggested_tech: ["TensorFlow", "React Native", "FHIR Standards", "Python", "Cloud Healthcare API"],
    });
  }

  if (lower.includes("agri") || lower.includes("farm") || lower.includes("sustain") || lower.includes("climate") || lower.includes("green")) {
    tracks.push({
      name: "Climate Resilience & Agritech",
      description: "Develop drone crop analytics, precision irrigation planners, or supply chain carbon accounting solutions.",
      suggested_tech: ["IoT / MicroPython", "GIS Mapping", "Satellite Imagery", "FastAPI", "Pandas"],
    });
  }

  if (lower.includes("web") || lower.includes("fullstack") || lower.includes("app") || lower.includes("cloud") || lower.includes("dev")) {
    tracks.push({
      name: "Developer Tools & Cloud Architecture",
      description: "Streamline engineering workflows, build developer-first platforms, or create resilient cloud infrastructure.",
      suggested_tech: ["TypeScript", "Docker", "Go", "Serverless", "GraphQL", "Tailwind CSS"],
    });
  }

  // Always ensure at least 2 relevant tracks
  if (tracks.length < 2) {
    tracks.push({
      name: "Open Innovation & Impact",
      description: "Freedom to build any software or hardware prototype that creates high-impact outcomes for communities and businesses.",
      suggested_tech: ["Any modern tech stack", "APIs", "Open Source tools"],
    });
  }

  if (tracks.length < 3) {
    tracks.push({
      name: "Social Good & Public Infrastructure",
      description: "Solutions improving civic engagement, accessibility, educational equity, and government public services.",
      suggested_tech: ["Web / Mobile", "Accessibility (a11y)", "PostgreSQL", "Open Data"],
    });
  }

  return tracks.slice(0, 4);
}

/**
 * Derives realistic, structured rounds and timeline.
 */
function deriveRounds(h: Partial<Hackathon>): HackathonRound[] {
  const regDeadline = h.reg_deadline ? new Date(h.reg_deadline) : null;
  const startDate = h.start_date ? new Date(h.start_date) : null;
  const endDate = h.end_date ? new Date(h.end_date) : null;

  const formatDateShort = (d: Date | null) => {
    if (!d || isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return [
    {
      phase: 1,
      name: "Registration & Ideation",
      date: regDeadline ? `Deadline: ${formatDateShort(regDeadline)}` : "Open Now",
      description: "Assemble your team, review problem statements, submit your initial project synopsis, and configure your development setup.",
    },
    {
      phase: 2,
      name: "Hackathon Sprint & Prototype Development",
      date: startDate && endDate ? `${formatDateShort(startDate)} – ${formatDateShort(endDate)}` : "Sprint Phase",
      description: "Build your working MVP, participate in mentor checkpoint sessions, and refine core feature functionality.",
    },
    {
      phase: 3,
      name: "Grand Finale & Project Showcase",
      date: endDate ? formatDateShort(endDate) : "Final Review",
      description: "Submit public GitHub repository, record a 3-minute video demo, and present live to the judging panel during final pitches.",
    },
  ];
}

/**
 * Derives prize breakdown based on stated amounts.
 */
function derivePrizeBreakdown(h: Partial<Hackathon>): PrizeBreakdown[] {
  const total = h.prize_amount_inr || (h.prize_amount ? h.prize_amount * 85 : 0);
  const currency = h.prize_currency || "INR";
  const symbol = currency === "USD" ? "$" : "₹";
  const originalTotal = h.prize_amount || total;

  if (total > 0) {
    const first = Math.round(originalTotal * 0.5);
    const second = Math.round(originalTotal * 0.3);
    const third = Math.round(originalTotal * 0.2);

    return [
      {
        place: "Grand Champion (1st Place)",
        reward: `${symbol}${first.toLocaleString()} cash prize`,
        description: "Winner trophy, exclusive swag bundle, and fast-track mentorship opportunities.",
      },
      {
        place: "First Runner-Up (2nd Place)",
        reward: `${symbol}${second.toLocaleString()} cash prize`,
        description: "Silver plaque, hardware/cloud perks, and sponsor partner interview referrals.",
      },
      {
        place: "Second Runner-Up (3rd Place)",
        reward: `${symbol}${third.toLocaleString()} cash prize`,
        description: "Bronze plaque, certificate of excellence, and technology credits.",
      },
      {
        place: "All Verified Participants",
        reward: "Verifiable Certificate & Goodies",
        description: "Digital verified certificate of participation, access to workshop recordings, and community perks.",
      },
    ];
  }

  if (h.prize_text) {
    return [
      {
        place: "Winner Rewards",
        reward: h.prize_text,
        description: "Official prize allocation designated by event organizers and sponsors.",
      },
      {
        place: "All Participants",
        reward: "Digital Certificate of Participation",
        description: "Verified certificate and recognition in official event leaderboards.",
      },
    ];
  }

  return [
    {
      place: "Top Performers",
      reward: "Trophy, Swag & Cloud Credits",
      description: "Recognition awards and partner perks announced by the organizing committee.",
    },
    {
      place: "All Participants",
      reward: "Certificate of Participation",
      description: "Official verifiable participation certificate for all teams submitting an MVP.",
    },
  ];
}

/**
 * Generates comprehensive rich details for any hackathon.
 */
export function generateRichDetails(h: Partial<Hackathon>): RichHackathonDetails {
  const title = h.title || "Hackathon";
  const organizer = h.organizer || "Organizing Committee";
  const mode = h.mode || "online";
  const location =
    mode === "online"
      ? "conducted entirely online with global participation"
      : h.city
      ? `hosted on-site in ${h.city}${h.state ? `, ${h.state}` : ""}${h.country ? ` (${h.country})` : ""}`
      : "hosted on-site";

  const teamMin = h.team_min || 1;
  const teamMax = h.team_max || 4;
  const teamStr =
    teamMin === teamMax
      ? `${teamMin} member`
      : `${teamMin}–${teamMax} members`;

  const tags = h.tags || [];
  const tracks = deriveTracks(title, tags);
  const rounds = deriveRounds(h);
  const prizes = derivePrizeBreakdown(h);

  const summary =
    h.summary ||
    `${title} is a premier ${mode} hackathon organized by ${organizer}. Teams of ${teamStr} build breakthrough prototypes across ${tracks
      .map((t) => t.name)
      .slice(0, 2)
      .join(" and ")}.`;

  let description = h.description;

  if (!description || description.length < 40 || description === "No description provided.") {
    const trackNames = tracks.map((t) => `• **${t.name}**: ${t.description}`).join("\n");

    description = `### Overview
**${title}** is an innovation challenge hosted by **${organizer}**, ${location}. Designed for ambitious developers, designers, and problem solvers, this hackathon invites creators to form cross-functional teams and build working software prototypes that address critical real-world friction points.

### Focus Tracks & Challenge Areas
Participants are encouraged to build high-impact applications within any of the following official domains:
${trackNames}

### Competition Format & Stages
The event is structured into three continuous phases:
1. **Registration & Project Ideation**: Complete registration, formulate team rosters (${teamStr}), and submit problem statement choices.
2. **Prototype Sprint**: Rapid engineering sprint with scheduled mentor office hours to review architecture, codebase quality, and user experience.
3. **Showcase & Evaluation**: Final pitch demonstrations where finalists showcase live demos before an esteemed panel of industry judges.

### Eligibility & Team Rules
• **Team Composition**: Open to individual builders or teams of ${teamStr}. Multidisciplinary skillsets (fullstack, UI/UX, data science) are highly recommended.
• **Eligibility**: ${h.eligibility_text || "Open to undergraduate students, postgraduate scholars, and independent builders."}
• **Original Work**: All code and designs submitted must be authored during the hackathon period. Open-source libraries and public frameworks are permitted with clear attribution.

### Submission Checklist
All final submissions must provide:
1. Public Git repository containing clean source code and documentation.
2. 3-minute recorded video walkthrough explaining the problem, solution, and architecture.
3. Presentation slide deck (PDF or link) outlining market viability and future roadmap.
4. Live deployed URL, hosted web application, or installable APK.`;
  }

  const submission_guidelines = [
    "Clean, documented GitHub or GitLab repository with an informative README.",
    "3-minute video demo (YouTube or Loom) demonstrating core functional workflow.",
    "Concise slide presentation (PDF or Google Slides) explaining problem & solution.",
    "Live hosted preview link or installable release binary (APK/IPA/web app).",
  ];

  const rules = [
    `Team size must adhere strictly to ${teamStr}.`,
    "All projects must be started from scratch during the hackathon period.",
    "Open-source packages and AI developer tooling (Copilot, Gemini) are welcomed with proper attribution.",
    "Plagiarism or submission of previously built commercial products will lead to instant disqualification.",
    "All participants must uphold an inclusive and respectful code of conduct.",
  ];

  const judging_criteria = [
    {
      criterion: "Innovation & Creativity",
      weight: "30%",
      description: "How original and novel is the solution to the addressed problem?",
    },
    {
      criterion: "Technical Depth & Execution",
      weight: "30%",
      description: "Quality of software architecture, code modularity, and working implementation.",
    },
    {
      criterion: "User Experience & Design",
      weight: "20%",
      description: "Ease of navigation, intuitive UI/UX design, and clean product polish.",
    },
    {
      criterion: "Practical Impact & Viability",
      weight: "20%",
      description: "Potential real-world adoption, scalability, and clarity of the pitch demonstration.",
    },
  ];

  return {
    summary,
    description,
    rounds,
    tracks,
    prizes_breakdown: prizes,
    submission_guidelines,
    rules,
    judging_criteria,
  };
}
