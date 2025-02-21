import { z } from "zod";

export const applicationFeedbackSchema = z
  .object({
    core_alignment_analysis: z
      .object({
        role_fit_score: z
          .number()
          .min(0)
          .max(100)
          .describe(
            "Score out of 100 indicating overall match between candidate profile and job requirements"
          ),
        key_matches: z
          .array(z.string())
          .describe(
            "Areas where candidate strongly matches the job requirements, highlighting specific skills and experiences"
          ),
        critical_gaps: z
          .array(z.string())
          .describe(
            "Must-have requirements from job description that are not met by candidate's current profile"
          ),
      })
      .describe(
        "Overall analysis of how well the candidate matches the role requirements"
      ),

    keyword_optimization: z
      .object({
        missing_critical_terms: z
          .array(
            z.object({
              keyword: z
                .string()
                .min(1)
                .describe(
                  "Key term from job description that's missing in resume"
                ),
              importance_level: z
                .enum(["Critical", "High", "Medium"])
                .describe(
                  "Priority level of the keyword - Critical/High/Medium based on job requirements"
                ),
              context_in_job: z
                .string()
                .min(1)
                .describe(
                  "How this keyword is used and valued in the job description"
                ),
              suggested_addition: z
                .string()
                .min(1)
                .describe("Exact text suggestion to add to the resume"),
              placement_location: z
                .string()
                .min(1)
                .describe(
                  "Specific section or location in resume where this term should be added"
                ),
            })
          )
          .describe(
            "List of important keywords missing from resume that appear in job description"
          ),
        terms_to_strengthen: z
          .array(
            z.object({
              existing_term: z
                .string()
                .min(1)
                .describe("Keyword that exists but needs better presentation"),
              current_usage: z
                .string()
                .min(1)
                .describe("How the term is currently used in the resume"),
              improved_phrasing: z
                .string()
                .min(1)
                .describe("Suggested improved way to present the term"),
              rationale: z
                .string()
                .min(1)
                .describe(
                  "Explanation of why this improvement would be more effective"
                ),
            })
          )
          .describe("Existing terms that could be presented more effectively"),
      })
      .describe(
        "Analysis and suggestions for keyword optimization to improve ATS matching"
      ),

    experience_enhancement: z
      .object({
        achievements_optimization: z
          .array(
            z.object({
              current_bullet: z
                .string()
                .min(1)
                .describe("Current achievement description in resume"),
              enhanced_version: z
                .string()
                .min(1)
                .describe("Improved version of the achievement description"),
              improvements_made: z
                .array(z.string())
                .describe(
                  "List of specific enhancements made to strengthen the achievement"
                ),
              alignment_with_role: z
                .string()
                .min(1)
                .describe(
                  "How this enhanced achievement better aligns with job requirements"
                ),
            })
          )
          .describe("Suggestions to improve presentation of achievements"),
        missing_experiences: z
          .array(
            z.object({
              required_experience: z
                .string()
                .min(1)
                .describe(
                  "Experience mentioned in job description that's not clearly shown"
                ),
              relevant_existing_experience: z
                .string()
                .min(1)
                .describe("Related experience from candidate's background"),
              reframing_suggestion: z
                .string()
                .min(1)
                .describe(
                  "How to position existing experience to show relevance to requirement"
                ),
            })
          )
          .describe("Required experiences not clearly demonstrated in resume"),
      })
      .describe("Recommendations for enhancing experience descriptions"),

    skills_optimization: z
      .object({
        technical_skills: z
          .object({
            priority_additions: z
              .array(z.string())
              .describe(
                "Technical skills from job description that should be added to resume"
              ),
            skills_to_emphasize: z
              .array(z.string())
              .describe(
                "Existing technical skills that should be given more prominence"
              ),
            skills_to_reframe: z
              .array(
                z.object({
                  current: z
                    .string()
                    .min(1)
                    .describe("Current presentation of the technical skill"),
                  suggested: z
                    .string()
                    .min(1)
                    .describe("Improved way to present the skill"),
                  strategic_reason: z
                    .string()
                    .min(1)
                    .describe("Why this reframing would be more effective"),
                })
              )
              .describe("Technical skills needing better presentation"),
          })
          .describe(
            "Analysis and suggestions for technical skills presentation"
          ),
        soft_skills: z
          .object({
            missing_critical: z
              .array(z.string())
              .describe(
                "Important soft skills from job description not demonstrated"
              ),
            enhancement_suggestions: z
              .array(
                z.object({
                  skill: z
                    .string()
                    .min(1)
                    .describe("Soft skill that needs better demonstration"),
                  demonstration_suggestion: z
                    .string()
                    .min(1)
                    .describe(
                      "Specific way to demonstrate this soft skill through experiences"
                    ),
                })
              )
              .describe("Suggestions for better demonstrating soft skills"),
          })
          .describe("Analysis and suggestions for soft skills presentation"),
      })
      .describe("Comprehensive skills analysis and optimization suggestions"),

    impact_metrics: z
      .object({
        additions_needed: z
          .array(
            z.object({
              achievement: z
                .string()
                .min(1)
                .describe("Achievement that needs quantification"),
              suggested_metrics: z
                .array(z.string())
                .describe(
                  "Specific metrics that could be added to quantify impact"
                ),
              data_points_to_gather: z
                .array(z.string())
                .describe(
                  "Specific data points or measurements needed to quantify the achievement"
                ),
            })
          )
          .describe("Achievements that need quantifiable metrics"),
        metrics_to_enhance: z
          .array(
            z.object({
              current_metric: z
                .string()
                .min(1)
                .describe("Current quantitative measure in resume"),
              enhanced_version: z
                .string()
                .min(1)
                .describe("Improved way to present the metric"),
              improvement_rationale: z
                .string()
                .min(1)
                .describe("Why this enhancement would be more impactful"),
            })
          )
          .describe(
            "Existing metrics that could be presented more effectively"
          ),
      })
      .describe(
        "Analysis and suggestions for improving quantifiable impact measures"
      ),

    professional_narrative: z
      .object({
        summary_optimization: z
          .object({
            current: z
              .string()
              .default("Not provided")
              .describe("Current professional summary if available"),
            enhanced_version: z
              .string()
              .min(1)
              .describe(
                "Optimized professional summary aligned with job requirements"
              ),
            key_improvements: z
              .array(z.string())
              .describe(
                "List of specific improvements made in the enhanced version"
              ),
          })
          .describe("Professional summary optimization suggestions"),
        story_strengthening: z
          .array(
            z.object({
              career_element: z
                .string()
                .min(1)
                .describe("Specific aspect of career progression"),
              current_presentation: z
                .string()
                .min(1)
                .describe("How this career element is currently presented"),
              suggested_narrative: z
                .string()
                .min(1)
                .describe("Improved way to present this career element"),
              strategic_value: z
                .string()
                .min(1)
                .describe(
                  "How this improved narrative aligns with target role"
                ),
            })
          )
          .describe("Suggestions for strengthening career narrative"),
      })
      .describe("Recommendations for improving overall professional story"),

    competitive_advantages: z
      .object({
        unique_selling_points: z
          .array(z.string())
          .describe(
            "Candidate's standout qualities and unique value propositions"
          ),
        differentiation_opportunities: z
          .array(
            z.object({
              area: z
                .string()
                .min(1)
                .describe("Specific area where differentiation is possible"),
              current_state: z
                .string()
                .min(1)
                .describe("Current presentation in resume"),
              enhancement_suggestion: z
                .string()
                .min(1)
                .describe("Suggested improvement to stand out"),
              expected_impact: z
                .string()
                .min(1)
                .describe("Anticipated benefit of this enhancement"),
            })
          )
          .describe("Opportunities to differentiate from other candidates"),
      })
      .describe(
        "Analysis of competitive advantages and differentiation opportunities"
      ),

    industry_alignment: z
      .object({
        domain_expertise: z
          .object({
            highlighted_areas: z
              .array(z.string())
              .describe("Current strong areas of industry knowledge"),
            areas_to_emphasize: z
              .array(z.string())
              .describe("Industry knowledge areas to give more prominence"),
            knowledge_gaps: z
              .array(z.string())
              .describe("Industry-specific knowledge areas to develop"),
          })
          .describe("Analysis of industry-specific expertise"),
        company_culture_fit: z
          .object({
            alignment_points: z
              .array(z.string())
              .describe(
                "Aspects of experience that align with company culture"
              ),
            areas_to_highlight: z
              .array(z.string())
              .describe("Cultural fit elements to emphasize"),
          })
          .describe("Analysis of cultural fit with target company"),
      })
      .describe("Assessment of industry alignment and cultural fit"),

    action_priorities: z
      .object({
        immediate_changes: z
          .array(z.string())
          .describe("Must-do modifications for immediate impact"),
        high_impact_updates: z
          .array(z.string())
          .describe(
            "Important changes that will significantly improve application"
          ),
        strategic_enhancements: z
          .array(z.string())
          .describe("Long-term improvements for career development"),
      })
      .describe("Prioritized list of recommended changes and improvements"),
  })
  .describe(
    "Comprehensive application feedback and optimization recommendations"
  );

export const interviewReportSchema = z
  .object({
    technicalAssessment: z
      .object({
        skillsAnalysis: z
          .object({
            demonstrated: z.array(
              z.object({
                skill: z.string().min(1).describe("Technical skill name"),
                level: z
                  .enum(["beginner", "intermediate", "advanced", "expert"])
                  .describe("Skill proficiency level"),
                evidence: z
                  .string()
                  .min(1)
                  .describe("Demonstration from interview"),
              })
            ),
            required: z.array(
              z.object({
                skill: z.string().min(1).describe("Required skill name"),
                priority: z
                  .enum(["must-have", "preferred"])
                  .describe("Priority level of the skill"),
                level: z.string().min(1).describe("Required proficiency level"),
              })
            ),
            gaps: z.array(
              z.object({
                skill: z.string().min(1).describe("Skill gap identified"),
                impact: z
                  .enum(["high", "medium", "low"])
                  .describe("Impact level of the skill gap"),
                recommendation: z
                  .string()
                  .min(1)
                  .describe("Improvement suggestion"),
              })
            ),
            growthPath: z.array(
              z.object({
                skill: z.string().min(1).describe("Skill to develop"),
                timeline: z.string().min(1).describe("Development timeframe"),
                resources: z.array(z.string()).describe("Learning resources"),
              })
            ),
          })
          .describe("Comprehensive analysis of technical skills"),
        problemSolving: z
          .object({
            analytical: z
              .string()
              .min(1)
              .describe("Problem breakdown assessment"),
            design: z.string().min(1).describe("Solution approach evaluation"),
            scalability: z.string().min(1).describe("Scaling considerations"),
          })
          .describe("Assessment of problem-solving capabilities"),
        technicalCommunication: z
          .object({
            clarity: z
              .string()
              .min(1)
              .describe("Technical explanation ability"),
            depth: z.string().min(1).describe("Technical discussion command"),
          })
          .describe("Evaluation of technical communication skills"),
      })
      .describe("Technical skills and capabilities assessment"),

    behavioralAnalysis: z
      .object({
        leadership: z
          .object({
            decisionMaking: z
              .string()
              .min(1)
              .describe("Decision process evaluation"),
            teamInfluence: z.string().min(1).describe("Leadership impact"),
            initiative: z.array(
              z.object({
                example: z.string().min(1).describe("Initiative example"),
                impact: z.string().min(1).describe("Result achieved"),
                context: z.string().min(1).describe("Situation context"),
              })
            ),
          })
          .describe("Leadership capabilities assessment"),
        adaptability: z
          .object({
            changeResponse: z
              .string()
              .min(1)
              .describe("Change handling assessment"),
            learning: z.string().min(1).describe("Learning approach"),
            growth: z.string().min(1).describe("Growth mindset evaluation"),
          })
          .describe("Adaptability and learning assessment"),
        collaboration: z
          .object({
            teamwork: z.string().min(1).describe("Team interaction style"),
            communication: z
              .string()
              .min(1)
              .describe("Communication effectiveness"),
            crossTeam: z
              .array(z.string())
              .describe("Cross-team collaboration examples"),
          })
          .describe("Collaboration and teamwork assessment"),
      })
      .describe("Behavioral competencies analysis"),

    responseQuality: z
      .object({
        structure: z
          .object({
            clarity: z
              .number()
              .min(0)
              .max(10)
              .describe("Clarity score out of 10"),
            organization: z
              .string()
              .min(1)
              .describe("Thought organization assessment"),
            improvement: z.array(z.string()).describe("Areas to improve"),
          })
          .describe("Response structure evaluation"),
        starMethod: z
          .object({
            situation: z.string().min(1).describe("Context setting"),
            task: z.string().min(1).describe("Role definition"),
            action: z.string().min(1).describe("Action description"),
            result: z.string().min(1).describe("Outcome measurement"),
            tips: z.array(z.string()).describe("Improvement tips"),
          })
          .describe("STAR method implementation assessment"),
      })
      .describe("Quality of interview responses"),

    roleAlignment: z
      .object({
        requirements: z
          .object({
            essential: z.array(
              z.object({
                requirement: z
                  .string()
                  .min(1)
                  .describe("Required qualification"),
                met: z.boolean().describe("Whether requirement is met"),
                notes: z.string().min(1).describe("Additional context"),
              })
            ),
            experience: z.string().min(1).describe("Experience relevance"),
            skills: z
              .record(
                z.object({
                  match: z.number().min(0).max(100),
                  notes: z.string(),
                })
              )
              .describe("Skills match assessment")
              .optional(),
          })
          .partial()
          .describe("Job requirements alignment"),
        potential: z
          .object({
            growth: z.string().min(1).describe("Growth potential"),
            advancement: z.string().min(1).describe("Promotion readiness"),
            development: z.array(z.string()).describe("Development areas"),
          })
          .describe("Future potential assessment"),
        cultural: z
          .object({
            values: z.string().min(1).describe("Values alignment"),
            workStyle: z.string().min(1).describe("Work style fit"),
            fit: z.array(z.string()).describe("Cultural indicators"),
          })
          .describe("Cultural fit assessment"),
      })
      .describe("Overall role and organization fit"),

    performanceMetrics: z
      .object({
        scores: z
          .object({
            overall: z
              .number()
              .min(0)
              .max(100)
              .describe("Overall performance score"),
            technical: z
              .number()
              .min(0)
              .max(100)
              .describe("Technical skills score"),
            behavioral: z
              .number()
              .min(0)
              .max(100)
              .describe("Behavioral competencies score"),
            communication: z
              .number()
              .min(0)
              .max(100)
              .describe("Communication skills score"),
          })
          .describe("Quantitative performance metrics"),
        benchmarks: z
          .object({
            industry: z.string().min(1).describe("Industry comparison"),
            role: z.string().min(1).describe("Role comparison"),
            level: z.string().min(1).describe("Level assessment"),
          })
          .describe("Performance benchmarking"),
      })
      .describe("Performance evaluation metrics"),

    developmentPlan: z
      .object({
        immediate: z
          .object({
            priorities: z.array(
              z.object({
                area: z.string().min(1).describe("Focus area"),
                importance: z
                  .enum(["high", "medium", "low"])
                  .describe("Priority level"),
                action: z.string().min(1).describe("Specific action"),
              })
            ),
            exercises: z.array(
              z.object({
                type: z.string().min(1).describe("Exercise type"),
                description: z.string().min(1).describe("Exercise details"),
                goal: z.string().min(1).describe("Expected outcome"),
              })
            ),
            resources: z.array(
              z.object({
                type: z.string().min(1).describe("Resource type"),
                description: z.string().min(1).describe("Resource details"),
                link: z.string().optional().describe("Optional resource link"),
              })
            ),
          })
          .describe("Immediate development actions"),
        shortTerm: z
          .object({
            goals: z.array(
              z.object({
                timeline: z.string().min(1).describe("Development timeline"),
                objective: z.string().min(1).describe("Specific goal"),
                success_criteria: z
                  .string()
                  .min(1)
                  .describe("Measurement criteria"),
              })
            ),
            skills: z.array(
              z.object({
                skill: z.string().min(1).describe("Skill to develop"),
                current_level: z
                  .string()
                  .min(1)
                  .describe("Current proficiency"),
                target_level: z.string().min(1).describe("Target proficiency"),
                timeline: z.string().min(1).describe("Development timeline"),
              })
            ),
            actions: z.array(z.string()).describe("Specific development steps"),
          })
          .describe("Short-term development plan"),
        preparation: z
          .object({
            questions: z.array(
              z.object({
                question: z.string().min(1).describe("Practice question"),
                category: z.string().min(1).describe("Question type"),
                preparation_tips: z
                  .array(z.string())
                  .describe("Preparation guidance"),
              })
            ),
            responses: z
              .record(
                z.object({
                  template: z.string().min(1),
                  key_points: z.array(z.string()),
                  pitfalls: z.array(z.string()),
                })
              )
              .describe("Response templates and guidance")
              .optional(),
            scenarios: z.array(
              z.object({
                situation: z.string().min(1).describe("Practice scenario"),
                expected_response: z.string().min(1).describe("Ideal response"),
                evaluation_criteria: z
                  .array(z.string())
                  .describe("Assessment criteria"),
              })
            ),
          })
          .partial()
          .describe("Interview preparation guidance"),
      })
      .describe("Comprehensive development and preparation plan"),
  })
  .describe("Complete interview assessment and development report");
