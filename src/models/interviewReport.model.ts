import mongoose, { Schema, Document, Model } from "mongoose";

// Define types for nested schemas
interface SkillAnalysis {
  skill: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  evidence?: string;
  priority?: "must-have" | "preferred";
  impact?: "high" | "medium" | "low";
  recommendation?: string;
  timeline?: string;
  resources?: string[];
}

interface Initiative {
  example: string;
  impact: string;
  context: string;
}

interface Requirement {
  requirement: string;
  met: boolean;
  notes: string;
}

interface DevelopmentPriority {
  area: string;
  importance: "high" | "medium" | "low";
  action: string;
}

interface Goal {
  timeline: string;
  objective: string;
  success_criteria: string;
}

interface SkillDevelopment {
  skill: string;
  current_level: string;
  target_level: string;
  timeline: string;
}

interface InterviewQuestion {
  question: string;
  category: string;
  preparation_tips: string[];
}

interface InterviewScenario {
  situation: string;
  expected_response: string;
  evaluation_criteria: string[];
}

// Main document interface
export interface InterviewReportDocument extends Document {
  technicalAssessment: {
    skillsAnalysis: {
      demonstrated: SkillAnalysis[];
      required: SkillAnalysis[];
      gaps: SkillAnalysis[];
      growthPath: SkillAnalysis[];
    };
    problemSolving: {
      analytical: string;
      design: string;
      scalability: string;
    };
    technicalCommunication: {
      clarity: string;
      depth: string;
    };
  };
  behavioralAnalysis: {
    leadership: {
      decisionMaking: string;
      teamInfluence: string;
      initiative: Initiative[];
    };
    adaptability: {
      changeResponse: string;
      learning: string;
      growth: string;
    };
    collaboration: {
      teamwork: string;
      communication: string;
      crossTeam: string[];
    };
  };
  responseQuality: {
    structure: {
      clarity: number;
      organization: string;
      improvement: string[];
    };
    starMethod: {
      situation: string;
      task: string;
      action: string;
      result: string;
      tips: string[];
    };
  };
  roleAlignment: {
    requirements: {
      essential: Requirement[];
      experience: string;
      skills: any;
    };
    potential: {
      growth: string;
      advancement: string;
      development: string[];
    };
    cultural: {
      values: string;
      workStyle: string;
      fit: string[];
    };
  };
  performanceMetrics: {
    scores: {
      overall: number;
      technical: number;
      behavioral: number;
      communication: number;
    };
    benchmarks: {
      industry: string;
      role: string;
      level: string;
    };
  };
  developmentPlan: {
    immediate: {
      priorities: DevelopmentPriority[];
      exercises: any;
      resources: any;
    };
    shortTerm: {
      goals: Goal[];
      skills: SkillDevelopment[];
      actions: string[];
    };
    preparation: {
      questions: InterviewQuestion[];
      responses: Map<
        string,
        {
          template: string;
          key_points: string[];
          pitfalls: string[];
        }
      >;
      scenarios: InterviewScenario[];
    };
  };
  interviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interviewReportSchema = new Schema(
  {
    technicalAssessment: {
      skillsAnalysis: {
        demonstrated: [
          {
            skill: String,
            level: {
              type: String,
              enum: ["beginner", "intermediate", "advanced", "expert"],
            },
            evidence: String,
            _id: false,
          },
        ],
        required: [
          {
            skill: String,
            priority: {
              type: String,
              enum: ["must-have", "preferred"],
            },
            level: String,
            _id: false,
          },
        ],
        gaps: [
          {
            skill: String,
            impact: {
              type: String,
              enum: ["high", "medium", "low"],
            },
            recommendation: String,
            _id: false,
          },
        ],
        growthPath: [
          {
            skill: String,
            timeline: String,
            resources: [String],
            _id: false,
          },
        ],
      },
      problemSolving: {
        analytical: String,
        design: String,
        scalability: String,
      },
      technicalCommunication: {
        clarity: String,
        depth: String,
      },
    },
    behavioralAnalysis: {
      leadership: {
        decisionMaking: String,
        teamInfluence: String,
        initiative: [
          {
            example: String,
            impact: String,
            context: String,
            _id: false,
          },
        ],
      },
      adaptability: {
        changeResponse: String,
        learning: String,
        growth: String,
      },
      collaboration: {
        teamwork: String,
        communication: String,
        crossTeam: [String],
      },
    },
    responseQuality: {
      structure: {
        clarity: {
          type: Number,
          min: 0,
          max: 10,
        },
        organization: String,
        improvement: [String],
      },
      starMethod: {
        situation: String,
        task: String,
        action: String,
        result: String,
        tips: [String],
      },
    },
    roleAlignment: {
      requirements: {
        essential: [
          {
            requirement: String,
            met: Boolean,
            notes: String,
            _id: false,
          },
        ],
        experience: String,
        skills: mongoose.Schema.Types.Mixed,
      },
      potential: {
        growth: String,
        advancement: String,
        development: [String],
      },
      cultural: {
        values: String,
        workStyle: String,
        fit: [String],
      },
    },
    performanceMetrics: {
      scores: {
        overall: {
          type: Number,
          min: 0,
          max: 100,
        },
        technical: {
          type: Number,
          min: 0,
          max: 100,
        },
        behavioral: {
          type: Number,
          min: 0,
          max: 100,
        },
        communication: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
      benchmarks: {
        industry: String,
        role: String,
        level: String,
      },
    },
    developmentPlan: {
      immediate: {
        priorities: [
          {
            area: String,
            importance: {
              type: String,
              enum: ["high", "medium", "low"],
            },
            action: String,
            _id: false,
          },
        ],
        exercises: mongoose.Schema.Types.Mixed,
        resources: mongoose.Schema.Types.Mixed,
      },
      shortTerm: {
        goals: [
          {
            timeline: String,
            objective: String,
            success_criteria: String,
            _id: false,
          },
        ],
        skills: [
          {
            skill: String,
            current_level: String,
            target_level: String,
            timeline: String,
            _id: false,
          },
        ],
        actions: [String],
      },
      preparation: {
        questions: [
          {
            question: String,
            category: String,
            preparation_tips: [String],
            _id: false,
          },
        ],
        responses: {
          type: Map,
          of: {
            template: String,
            key_points: [String],
            pitfalls: [String],
          },
        },
        scenarios: [
          {
            situation: String,
            expected_response: String,
            evaluation_criteria: [String],
            _id: false,
          },
        ],
      },
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewReportSchema.index({ interviewId: 1 });

export const InterviewReport: Model<InterviewReportDocument> =
  mongoose.model<InterviewReportDocument>(
    "InterviewReport",
    interviewReportSchema
  );
