// Sample template document
export const frontendTemplate = {
  templateId: "tech-frontend-react",
  name: "Frontend React Developer Interview",
  description:
    "Technical interview focusing on React, JavaScript, and frontend architecture",
  category: "technical",
  promptInsertions: {
    introduction: {
      beginner:
        "a junior-level frontend React interview focusing on fundamentals",
      intermediate:
        "a mid-level frontend React interview covering practical implementation knowledge",
      advanced:
        "a senior frontend React interview assessing advanced patterns and architecture",
      expert:
        "a principal/staff-level frontend architecture interview evaluating expert React knowledge",
    },
    interviewStructure: {
      15: "This will be a brief 15-minute technical screening focusing on core frontend skills.",
      30: "This will be a 30-minute technical interview covering key React and JavaScript concepts.",
      45: "This will be a comprehensive 45-minute technical interview exploring your React expertise in depth.",
      60: "This will be an extensive 60-minute technical interview covering all aspects of frontend development.",
    },
    questionCategories: {
      beginner: [
        "React fundamentals (components, props, state) - {{duration_adjusted:1-2|2-3|3-4|4-5}} questions",
        "JavaScript basics (ES6 features, async) - {{duration_adjusted:1|2|2-3|3-4}} questions",
        "HTML/CSS knowledge - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Problem-solving approach - {{duration_adjusted:0-1|1|1-2|2}} questions",
      ],
      intermediate: [
        "React hooks and lifecycle - {{duration_adjusted:1-2|2-3|3-4|4}} questions",
        "State management (Context API, Redux) - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Performance optimization - {{duration_adjusted:0-1|1|1-2|2}} questions",
        "Frontend testing - {{duration_adjusted:0|1|1-2|2}} questions",
        "Architecture decisions - {{duration_adjusted:0-1|1|1-2|2}} questions",
      ],
      advanced: [
        "Advanced React patterns - {{duration_adjusted:1|2|2-3|3}} questions",
        "State management architecture - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Performance optimization - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Testing strategies - {{duration_adjusted:0-1|1|1-2|2}} questions",
        "System design - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Technical leadership - {{duration_adjusted:0-1|1|1-2|2}} questions",
      ],
      expert: [
        "React internals - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Advanced state patterns - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Architecture at scale - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Build systems and tooling - {{duration_adjusted:0-1|1|1-2|2}} questions",
        "Performance optimization - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "Technical leadership - {{duration_adjusted:1|1-2|2|2-3}} questions",
        "System design - {{duration_adjusted:1|1-2|2|2-3}} questions",
      ],
    },
    behavioralFocus: {
      beginner:
        "Focus on learning approach, teamwork examples, and communication skills.",
      intermediate:
        "Assess problem-solving approaches, collaboration examples, and technical communication skills.",
      advanced:
        "Evaluate technical leadership, mentoring abilities, and cross-team collaboration experiences.",
      expert:
        "Assess architectural decision-making, technical leadership philosophy, and strategic thinking.",
    },
    technicalDepth: {
      beginner:
        "Focus on basic understanding of React concepts, component creation, and simple state management.",
      intermediate:
        "Explore practical implementation details, hooks usage patterns, and awareness of performance considerations.",
      advanced:
        "Probe for deep technical knowledge of React internals, architectural patterns, and optimization techniques.",
      expert:
        "Discuss framework internals, cutting-edge patterns, scaling strategies, and technical tradeoffs at enterprise scale.",
    },
    followUpStrategy: {
      15: "Use minimal follow-ups due to time constraints; focus on core understanding only.",
      30: "Use focused follow-ups on key topics to assess depth of knowledge.",
      45: "Use detailed follow-ups to explore reasoning and edge cases on important topics.",
      60: "Use extensive follow-ups to thoroughly assess understanding, edge cases, and alternative approaches.",
    },
  },
  isActive: true,
  createdBy: "507f1f77bcf86cd799439011", // Some ObjectId
};
