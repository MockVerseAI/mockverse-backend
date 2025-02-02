import mongoose, { Schema } from "mongoose";

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

export const InterviewReport = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);
