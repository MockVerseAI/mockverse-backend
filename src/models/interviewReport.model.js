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
    mediaAnalysis: {
      type: {
        type: String,
        enum: ["video", "audio"],
        default: null,
      },
      analysis: {
        communicationSkills: {
          clarity: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            examples: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          articulation: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            examples: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          pace: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            examples: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          confidence: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            indicators: [
              {
                type: String,
                _id: false,
              },
            ],
          },
        },
        bodyLanguage: {
          posture: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            observations: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          eyeContact: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            observations: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          gestures: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            observations: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          presence: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            observations: [
              {
                type: String,
                _id: false,
              },
            ],
          },
        },
        audioQuality: {
          clarity: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            issues: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          volume: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            notes: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          background: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            distractions: [
              {
                type: String,
                _id: false,
              },
            ],
          },
        },
        overallPerformance: {
          professionalism: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            examples: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          engagement: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            indicators: [
              {
                type: String,
                _id: false,
              },
            ],
          },
          readiness: {
            score: {
              type: Number,
              min: 0,
              max: 10,
              default: null,
            },
            feedback: {
              type: String,
              default: null,
            },
            assessment: {
              type: String,
              default: null,
            },
          },
        },
        recommendations: {
          immediate: [
            {
              area: String,
              suggestion: String,
              priority: {
                type: String,
                enum: ["high", "medium", "low"],
              },
              _id: false,
            },
          ],
          practice: [
            {
              skill: String,
              exercise: String,
              frequency: String,
              _id: false,
            },
          ],
          resources: [
            {
              type: String,
              description: String,
              link: String,
              _id: false,
            },
          ],
        },
        summary: {
          strengths: [
            {
              type: String,
              _id: false,
            },
          ],
          weaknesses: [
            {
              type: String,
              _id: false,
            },
          ],
          keyInsights: [
            {
              type: String,
              _id: false,
            },
          ],
          overallScore: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
          },
        },
      },
      analyzedAt: {
        type: Date,
        default: null,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      processingDuration: {
        type: Number,
        default: null,
      },
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
