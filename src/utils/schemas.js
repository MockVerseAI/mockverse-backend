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
            "Thoughtful role fit score using full 0-100 range. Use 30-50 for career transitions with development potential, 50-70 for good matches with skill gaps, 70-100 for strong matches. Reserve very low scores (0-30) only for fundamental role misalignment."
          ),
        key_matches: z
          .array(z.string())
          .describe(
            "Areas where candidate demonstrates strong alignment with job requirements. Focus on actual demonstrated skills and relevant experiences that provide a solid foundation."
          ),
        critical_gaps: z
          .array(z.string())
          .describe(
            "Important requirements that need development. Categorize as HIGH PRIORITY (essential for competitiveness), MEDIUM (important improvements), or DEVELOPMENT OPPORTUNITY (areas for growth). Frame constructively with focus on learning paths."
          ),
      })
      .describe(
        "Balanced analysis of role fit including honest assessment while focusing on growth potential and development opportunities"
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
                  "Important technical term or skill from job description that could strengthen the application"
                ),
              importance_level: z
                .enum(["Critical", "High", "Medium"])
                .describe(
                  "Development priority assessment - Critical for core competencies, High for competitive advantages, Medium for enhancement opportunities"
                ),
              context_in_job: z
                .string()
                .min(1)
                .describe(
                  "Explain the importance of this skill and how developing it would strengthen candidacy"
                ),
              suggested_addition: z
                .string()
                .min(1)
                .describe(
                  "Constructive recommendation - if candidate has foundation, suggest presentation improvement; if new skill, recommend development approach."
                ),
              placement_location: z
                .string()
                .min(1)
                .describe(
                  "Where to add this term once developed, or current learning initiatives to highlight"
                ),
            })
          )
          .describe(
            "Skills and keywords that could strengthen the application. Balance between presentation improvements and genuine skill development recommendations"
          ),
        terms_to_strengthen: z
          .array(
            z.object({
              existing_term: z
                .string()
                .min(1)
                .describe(
                  "Skill or keyword that could be presented more effectively"
                ),
              current_usage: z
                .string()
                .min(1)
                .describe("Current presentation that could be enhanced"),
              improved_phrasing: z
                .string()
                .min(1)
                .describe(
                  "Enhanced presentation that better demonstrates competency and impact"
                ),
              rationale: z
                .string()
                .min(1)
                .describe(
                  "Strategic benefit of improvement and impact on competitive positioning"
                ),
            })
          )
          .describe(
            "Existing skills that could be positioned more effectively to demonstrate stronger competency"
          ),
      })
      .describe(
        "Constructive keyword analysis focusing on strategic improvements and development opportunities"
      ),

    experience_enhancement: z
      .object({
        achievements_optimization: z
          .array(
            z.object({
              current_bullet: z
                .string()
                .min(1)
                .describe("Current generic or weak achievement statement"),
              enhanced_version: z
                .string()
                .min(1)
                .describe(
                  "Improved version with quantifiable impact and clearer value demonstration"
                ),
              improvements_made: z
                .array(z.string())
                .describe(
                  "Specific enhancements: quantification, impact focus, relevance to target role, stronger action verbs"
                ),
              alignment_with_role: z
                .string()
                .min(1)
                .describe(
                  "Direct connection to job requirements - be specific about how this achievement demonstrates required capabilities"
                ),
            })
          )
          .describe(
            "Realistic achievement improvements focusing on demonstrable impact and role relevance"
          ),
        missing_experiences: z
          .array(
            z.object({
              required_experience: z
                .string()
                .min(1)
                .describe(
                  "Essential experience from job description that's not clearly demonstrated"
                ),
              relevant_existing_experience: z
                .string()
                .min(1)
                .describe(
                  "Closest related experience from candidate's background, if any exists"
                ),
              reframing_suggestion: z
                .string()
                .min(1)
                .describe(
                  "Honest assessment of how to position existing experience, or acknowledge if gap is too significant to bridge through reframing"
                ),
            })
          )
          .describe(
            "Required experiences missing from resume - be honest about whether gaps can be bridged through reframing or require actual experience building"
          ),
      })
      .describe(
        "Experience enhancement focusing on genuine improvements and honest gap assessment"
      ),

    skills_optimization: z
      .object({
        technical_skills: z
          .object({
            priority_additions: z
              .array(z.string())
              .describe(
                "Technical skills that would strengthen candidacy for this role. Focus on achievable development areas with clear learning paths."
              ),
            skills_to_emphasize: z
              .array(z.string())
              .describe(
                "Existing technical skills that are valuable but underrepresented in current resume presentation"
              ),
            skills_to_reframe: z
              .array(
                z.object({
                  current: z
                    .string()
                    .min(1)
                    .describe(
                      "Current presentation that doesn't fully showcase competency"
                    ),
                  suggested: z
                    .string()
                    .min(1)
                    .describe(
                      "Enhanced presentation that better demonstrates skill level and application"
                    ),
                  strategic_reason: z
                    .string()
                    .min(1)
                    .describe(
                      "Why this improvement addresses specific job requirements and strengthens positioning"
                    ),
                })
              )
              .describe(
                "Technical skills requiring better presentation to accurately reflect candidate's capabilities"
              ),
          })
          .describe(
            "Technical skills analysis focusing on leveraging existing capabilities and strategic development"
          ),
        soft_skills: z
          .object({
            missing_critical: z
              .array(z.string())
              .describe(
                "Important soft skills that could be better demonstrated through specific examples and achievements"
              ),
            enhancement_suggestions: z
              .array(
                z.object({
                  skill: z
                    .string()
                    .min(1)
                    .describe("Soft skill with demonstration potential"),
                  demonstration_suggestion: z
                    .string()
                    .min(1)
                    .describe(
                      "Constructive way to highlight this skill through existing experiences or suggest development activities"
                    ),
                })
              )
              .describe(
                "Actionable suggestions for demonstrating soft skills more effectively"
              ),
          })
          .describe(
            "Soft skills analysis with constructive improvement suggestions and development guidance"
          ),
      })
      .describe(
        "Skills optimization focusing on maximizing existing strengths and strategic development opportunities"
      ),

    impact_metrics: z
      .object({
        additions_needed: z
          .array(
            z.object({
              achievement: z
                .string()
                .min(1)
                .describe(
                  "Achievement that lacks quantifiable evidence of impact"
                ),
              suggested_metrics: z
                .array(z.string())
                .describe(
                  "Realistic metrics candidate could potentially provide if they have access to this data"
                ),
              data_points_to_gather: z
                .array(z.string())
                .describe(
                  "Specific data points candidate needs to research or recall to quantify impact"
                ),
            })
          )
          .describe(
            "Achievements needing quantification - only suggest metrics candidate could realistically obtain"
          ),
        metrics_to_enhance: z
          .array(
            z.object({
              current_metric: z
                .string()
                .min(1)
                .describe("Current weak or basic quantitative measure"),
              enhanced_version: z
                .string()
                .min(1)
                .describe(
                  "More compelling presentation of the same data with context and business impact"
                ),
              improvement_rationale: z
                .string()
                .min(1)
                .describe(
                  "Why enhanced version better demonstrates value and relevance to target role"
                ),
            })
          )
          .describe(
            "Existing metrics that can be presented more effectively to show business impact"
          ),
      })
      .describe(
        "Impact metrics analysis focusing on realistic quantification opportunities, not inflated or unavailable data"
      ),

    professional_narrative: z
      .object({
        summary_optimization: z
          .object({
            current: z
              .string()
              .default("Not provided")
              .describe(
                "Current professional summary or note that none exists"
              ),
            enhanced_version: z
              .string()
              .min(1)
              .describe(
                "Optimized professional summary that honestly reflects candidate's actual background while maximizing alignment with job requirements"
              ),
            key_improvements: z
              .array(z.string())
              .describe(
                "Specific improvements made: better role alignment, stronger value proposition, clearer career focus, honest positioning"
              ),
          })
          .describe(
            "Professional summary optimization based on candidate's actual background and achievements"
          ),
        story_strengthening: z
          .array(
            z.object({
              career_element: z
                .string()
                .min(1)
                .describe(
                  "Specific aspect of career progression or transition"
                ),
              current_presentation: z
                .string()
                .min(1)
                .describe("How career element currently appears in resume"),
              suggested_narrative: z
                .string()
                .min(1)
                .describe(
                  "Improved narrative that maintains authenticity while showing progression and relevance"
                ),
              strategic_value: z
                .string()
                .min(1)
                .describe(
                  "How improved narrative better positions candidate for target role without misrepresenting background"
                ),
            })
          )
          .describe(
            "Career narrative improvements that maintain authenticity while optimizing for target role"
          ),
      })
      .describe(
        "Professional narrative enhancement focusing on authentic story optimization"
      ),

    competitive_advantages: z
      .object({
        unique_selling_points: z
          .array(z.string())
          .describe(
            "Genuine standout qualities and unique value propositions based on actual experience and achievements"
          ),
        differentiation_opportunities: z
          .array(
            z.object({
              area: z
                .string()
                .min(1)
                .describe(
                  "Specific area where candidate has actual differentiation potential"
                ),
              current_state: z
                .string()
                .min(1)
                .describe(
                  "Current weak or hidden presentation of differentiator"
                ),
              enhancement_suggestion: z
                .string()
                .min(1)
                .describe(
                  "Realistic way to highlight genuine competitive advantage"
                ),
              expected_impact: z
                .string()
                .min(1)
                .describe(
                  "Realistic benefit this enhancement would provide in competitive candidate pool"
                ),
            })
          )
          .describe(
            "Genuine differentiation opportunities based on actual strengths, not inflated claims"
          ),
      })
      .describe(
        "Realistic competitive advantage analysis focusing on authentic differentiators candidate actually possesses"
      ),

    industry_alignment: z
      .object({
        domain_expertise: z
          .object({
            highlighted_areas: z
              .array(z.string())
              .describe(
                "Current genuine areas of industry knowledge demonstrated in experience"
              ),
            areas_to_emphasize: z
              .array(z.string())
              .describe(
                "Industry knowledge areas candidate actually possesses but doesn't highlight effectively"
              ),
            knowledge_gaps: z
              .array(z.string())
              .describe(
                "Industry-specific knowledge areas missing that are essential for role success"
              ),
          })
          .describe(
            "Honest assessment of industry expertise based on actual experience"
          ),
        company_culture_fit: z
          .object({
            alignment_points: z
              .array(z.string())
              .describe(
                "Actual aspects of experience that demonstrate genuine alignment with company culture and values"
              ),
            areas_to_highlight: z
              .array(z.string())
              .describe(
                "Cultural fit elements present in background but not effectively communicated"
              ),
          })
          .describe(
            "Cultural fit assessment based on demonstrated experience and actual company culture"
          ),
      })
      .describe(
        "Industry and company alignment analysis grounded in candidate's actual background"
      ),

    action_priorities: z
      .object({
        immediate_changes: z
          .array(z.string())
          .describe(
            "Quick wins for improving presentation and competitive positioning - formatting and presentation enhancements"
          ),
        high_impact_updates: z
          .array(z.string())
          .describe(
            "Important improvements that would strengthen candidacy - better demonstration of existing skills and strategic additions"
          ),
        strategic_enhancements: z
          .array(z.string())
          .describe(
            "Medium-term development opportunities for career advancement - skill building and experience expansion with realistic timelines"
          ),
      })
      .describe(
        "Prioritized action plan with achievable improvements and constructive development guidance"
      ),
  })
  .describe(
    "Comprehensive, constructive application feedback focusing on realistic improvements and strategic candidate development"
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
                  .describe(
                    "Thoughtful assessment of demonstrated skill proficiency level based on interview evidence"
                  ),
                evidence: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific evidence from interview conversation that supports this skill level assessment"
                  ),
              })
            ),
            required: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe("Required skill from job description"),
                priority: z
                  .enum(["must-have", "preferred"])
                  .describe(
                    "Priority level - must-have for core competencies, preferred for valuable additions"
                  ),
                level: z
                  .string()
                  .min(1)
                  .describe("Required proficiency level for this role"),
              })
            ),
            gaps: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe(
                    "Skill development opportunity identified - frame as growth area"
                  ),
                impact: z
                  .enum(["high", "medium", "low"])
                  .describe(
                    "Development priority - high for core competencies, medium for important skills, low for enhancement opportunities"
                  ),
                recommendation: z
                  .string()
                  .min(1)
                  .describe(
                    "Constructive improvement suggestion with encouraging, realistic development guidance"
                  ),
              })
            ),
            growthPath: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe("Skill with development potential"),
                timeline: z
                  .string()
                  .min(1)
                  .describe(
                    "Encouraging but realistic development timeframe - focus on achievable progress"
                  ),
                resources: z
                  .array(z.string())
                  .describe(
                    "Practical learning resources and development approaches"
                  ),
              })
            ),
          })
          .describe(
            "Constructive technical skills analysis including development opportunities and realistic growth planning"
          ),
        problemSolving: z
          .object({
            analytical: z
              .string()
              .min(1)
              .describe(
                "Balanced assessment of problem breakdown ability with specific interview examples and improvement suggestions"
              ),
            design: z
              .string()
              .min(1)
              .describe(
                "Constructive evaluation of solution approach quality with guidance for enhancement"
              ),
            scalability: z
              .string()
              .min(1)
              .describe(
                "Assessment of scaling considerations and systems thinking with development recommendations"
              ),
          })
          .describe(
            "Problem-solving assessment focusing on demonstrated capabilities and growth potential"
          ),
        technicalCommunication: z
          .object({
            clarity: z
              .string()
              .min(1)
              .describe(
                "Constructive assessment of technical explanation ability - acknowledge strengths while noting improvement opportunities"
              ),
            depth: z
              .string()
              .min(1)
              .describe(
                "Evaluation of technical discussion depth - recognize current level while suggesting areas for deeper development"
              ),
          })
          .describe(
            "Technical communication evaluation with constructive feedback and development guidance"
          ),
      })
      .describe(
        "Comprehensive technical assessment balancing current capabilities with growth potential and development opportunities"
      ),

    behavioralAnalysis: z
      .object({
        leadership: z
          .object({
            decisionMaking: z
              .string()
              .min(1)
              .describe(
                "Honest evaluation of decision-making process based on specific examples provided"
              ),
            teamInfluence: z
              .string()
              .min(1)
              .describe(
                "Assessment of actual leadership impact with concrete evidence from responses"
              ),
            initiative: z.array(
              z.object({
                example: z
                  .string()
                  .min(1)
                  .describe("Specific initiative example from interview"),
                impact: z
                  .string()
                  .min(1)
                  .describe(
                    "Measurable result achieved - be honest about scope and significance"
                  ),
                context: z
                  .string()
                  .min(1)
                  .describe(
                    "Situation context and candidate's actual role in outcome"
                  ),
              })
            ),
          })
          .describe(
            "Leadership assessment based on concrete examples and demonstrated impact"
          ),
        adaptability: z
          .object({
            changeResponse: z
              .string()
              .min(1)
              .describe(
                "Realistic assessment of change handling based on actual examples provided"
              ),
            learning: z
              .string()
              .min(1)
              .describe(
                "Learning approach evaluation - acknowledge rigid or limited learning examples"
              ),
            growth: z
              .string()
              .min(1)
              .describe(
                "Growth mindset assessment based on evidence, not assumptions"
              ),
          })
          .describe(
            "Adaptability evaluation grounded in specific behavioral examples"
          ),
        collaboration: z
          .object({
            teamwork: z
              .string()
              .min(1)
              .describe(
                "Team interaction assessment based on actual examples - note limited teamwork if evident"
              ),
            communication: z
              .string()
              .min(1)
              .describe(
                "Communication effectiveness evaluation - be direct about poor communication when demonstrated"
              ),
            crossTeam: z
              .array(z.string())
              .describe(
                "Cross-functional collaboration examples - acknowledge lack of experience if none provided"
              ),
          })
          .describe(
            "Collaboration assessment based on demonstrated experience, not potential"
          ),
      })
      .describe(
        "Behavioral analysis grounded in actual interview evidence and specific examples"
      ),

    responseQuality: z
      .object({
        structure: z
          .object({
            clarity: z
              .number()
              .min(0)
              .max(10)
              .describe(
                "Honest clarity score using full 0-10 range - use low scores for confusing or rambling responses"
              ),
            organization: z
              .string()
              .min(1)
              .describe(
                "Direct assessment of thought organization - note disorganized thinking when present"
              ),
            improvement: z
              .array(z.string())
              .describe(
                "Specific areas needing improvement based on actual response weaknesses"
              ),
          })
          .describe(
            "Response structure evaluation using honest scoring and direct feedback"
          ),
        starMethod: z
          .object({
            situation: z
              .string()
              .min(1)
              .describe(
                "Assessment of context setting ability - note vague or missing context"
              ),
            task: z
              .string()
              .min(1)
              .describe(
                "Role definition clarity evaluation - acknowledge unclear role descriptions"
              ),
            action: z
              .string()
              .min(1)
              .describe(
                "Action description assessment - note vague or passive language"
              ),
            result: z
              .string()
              .min(1)
              .describe(
                "Outcome measurement evaluation - acknowledge missing or weak results"
              ),
            tips: z
              .array(z.string())
              .describe(
                "Specific improvement recommendations based on actual STAR method gaps"
              ),
          })
          .describe(
            "STAR method assessment focusing on actual implementation quality, not theoretical knowledge"
          ),
      })
      .describe(
        "Response quality evaluation based on demonstrated communication effectiveness"
      ),

    roleAlignment: z
      .object({
        requirements: z
          .object({
            essential: z.array(
              z.object({
                requirement: z
                  .string()
                  .min(1)
                  .describe("Essential job requirement from job description"),
                met: z
                  .boolean()
                  .describe(
                    "Honest assessment of whether requirement is actually met based on interview evidence"
                  ),
                notes: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific context about why requirement is or isn't met"
                  ),
              })
            ),
            experience: z
              .string()
              .min(1)
              .describe(
                "Direct assessment of experience relevance - acknowledge mismatches when present"
              ),
            skills: z
              .record(
                z.object({
                  match: z.number().min(0).max(100),
                  notes: z.string(),
                })
              )
              .describe("Honest skills match assessment using full 0-100 range")
              .optional(),
          })
          .partial()
          .describe("Realistic job requirements alignment assessment"),
        potential: z
          .object({
            growth: z
              .string()
              .min(1)
              .describe(
                "Realistic growth potential assessment based on demonstrated learning ability"
              ),
            advancement: z
              .string()
              .min(1)
              .describe(
                "Honest promotion readiness evaluation - acknowledge when candidate isn't ready"
              ),
            development: z
              .array(z.string())
              .describe("Critical development areas required for role success"),
          })
          .describe(
            "Future potential assessment grounded in actual demonstrated capabilities"
          ),
        cultural: z
          .object({
            values: z
              .string()
              .min(1)
              .describe(
                "Values alignment assessment based on actual responses and examples"
              ),
            workStyle: z
              .string()
              .min(1)
              .describe(
                "Work style fit evaluation based on demonstrated preferences and approaches"
              ),
            fit: z
              .array(z.string())
              .describe("Cultural fit indicators based on interview evidence"),
          })
          .describe(
            "Cultural fit assessment based on demonstrated behaviors and stated preferences"
          ),
      })
      .describe(
        "Overall role fit assessment including honest evaluation of readiness and development needs"
      ),

    performanceMetrics: z
      .object({
        scores: z
          .object({
            overall: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Thoughtful overall performance score using full 0-100 range - balanced assessment that encourages growth"
              ),
            technical: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Technical skills score reflecting demonstrated competency with consideration for learning potential"
              ),
            behavioral: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Behavioral competencies score based on evidence provided with constructive interpretation"
              ),
            communication: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Communication effectiveness score reflecting interview performance with development context"
              ),
          })
          .describe(
            "Performance scores using thoughtful assessment that balances current demonstration with growth potential"
          ),
        benchmarks: z
          .object({
            industry: z
              .string()
              .min(1)
              .describe(
                "Industry comparison with constructive context - acknowledge development areas while recognizing potential"
              ),
            role: z
              .string()
              .min(1)
              .describe(
                "Role-specific comparison noting current readiness and development pathway"
              ),
            level: z
              .string()
              .min(1)
              .describe(
                "Level assessment with constructive guidance on meeting role expectations through targeted development"
              ),
          })
          .describe(
            "Performance benchmarking with balanced industry and role comparisons focused on development opportunities"
          ),
      })
      .describe(
        "Performance evaluation using thoughtful scoring and constructive benchmarking with development focus"
      ),

    developmentPlan: z
      .object({
        immediate: z
          .object({
            priorities: z.array(
              z.object({
                area: z
                  .string()
                  .min(1)
                  .describe(
                    "Important focus area with clear development potential"
                  ),
                importance: z
                  .enum(["high", "medium", "low"])
                  .describe(
                    "Development priority - high for core competencies, medium for competitive advantages, low for enhancement opportunities"
                  ),
                action: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific, achievable step with encouraging guidance and realistic expectations"
                  ),
              })
            ),
            exercises: z.array(
              z.object({
                type: z
                  .string()
                  .min(1)
                  .describe(
                    "Practical exercise type targeting development opportunities"
                  ),
                description: z
                  .string()
                  .min(1)
                  .describe(
                    "Detailed exercise focusing on skill building and improvement"
                  ),
                goal: z
                  .string()
                  .min(1)
                  .describe(
                    "Encouraging expected outcome with measurable but achievable criteria"
                  ),
              })
            ),
            resources: z.array(
              z.object({
                type: z
                  .string()
                  .min(1)
                  .describe(
                    "Resource type appropriate for current skill level and development goals"
                  ),
                description: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific resource targeting development needs with constructive guidance"
                  ),
                link: z
                  .string()
                  .optional()
                  .describe("Actual resource link when available"),
              })
            ),
          })
          .describe(
            "Immediate development actions targeting priority areas with encouraging, achievable improvements"
          ),
        shortTerm: z
          .object({
            goals: z.array(
              z.object({
                timeline: z
                  .string()
                  .min(1)
                  .describe(
                    "Encouraging development timeline based on realistic skill building expectations"
                  ),
                objective: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific, achievable goal addressing development opportunities"
                  ),
                success_criteria: z
                  .string()
                  .min(1)
                  .describe(
                    "Clear, encouraging measurement criteria for goal achievement"
                  ),
              })
            ),
            skills: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe("Specific skill with clear development potential"),
                current_level: z
                  .string()
                  .min(1)
                  .describe(
                    "Constructive assessment of current proficiency level"
                  ),
                target_level: z
                  .string()
                  .min(1)
                  .describe("Realistic target proficiency for role success"),
                timeline: z
                  .string()
                  .min(1)
                  .describe(
                    "Encouraging timeline for skill development with achievable milestones"
                  ),
              })
            ),
            actions: z
              .array(z.string())
              .describe(
                "Specific development steps with encouraging guidance and realistic expectations"
              ),
          })
          .describe(
            "Short-term development plan with encouraging timelines and achievable goals"
          ),
        preparation: z
          .object({
            questions: z.array(
              z.object({
                question: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific practice question targeting development opportunities"
                  ),
                category: z
                  .string()
                  .min(1)
                  .describe(
                    "Question category based on development areas identified"
                  ),
                preparation_tips: z
                  .array(z.string())
                  .describe(
                    "Constructive preparation guidance addressing improvement opportunities"
                  ),
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
              .describe(
                "Response templates targeting communication development"
              )
              .optional(),
            scenarios: z.array(
              z.object({
                situation: z
                  .string()
                  .min(1)
                  .describe(
                    "Practice scenario addressing skill development areas"
                  ),
                expected_response: z
                  .string()
                  .min(1)
                  .describe("Ideal response structure and content guidance"),
                evaluation_criteria: z
                  .array(z.string())
                  .describe(
                    "Assessment criteria focusing on improvement and development"
                  ),
              })
            ),
          })
          .partial()
          .describe(
            "Interview preparation targeting specific development opportunities with constructive guidance"
          ),
      })
      .describe(
        "Comprehensive development plan with encouraging timelines and constructive assessment of development opportunities"
      ),
  })
  .describe(
    "Complete interview assessment with constructive feedback and encouraging development recommendations"
  );

export const interviewTemplateSelectionSchema = z.object({
  templates_id: z.string().describe("The _id of the selected template"),
  difficulty_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .describe("The recommended difficulty level"),
});

export const getMediaAnalysisSchema = (mediaType) => {
  const baseSchema = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [mediaType],
        description: `Type of media being analyzed: ${mediaType}`,
      },
      communicationSkills: {
        type: "object",
        properties: {
          clarity: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Speech clarity score using thoughtful 0-10 range - focus on constructive assessment with development guidance",
              },
              feedback: {
                type: "string",
                description:
                  "Constructive feedback on speech clarity with specific examples - balance acknowledgment of strengths with improvement opportunities",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples demonstrating both strengths and development areas - include timestamps when relevant",
              },
            },
            required: ["score", "feedback", "examples"],
          },
          articulation: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Articulation score with constructive assessment - acknowledge current level while providing development guidance",
              },
              feedback: {
                type: "string",
                description:
                  "Balanced feedback on articulation quality - note improvement opportunities with encouraging development suggestions",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples of articulation strengths and development opportunities",
              },
            },
            required: ["score", "feedback", "examples"],
          },
          pace: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Speaking pace score with development focus - assess current effectiveness while providing improvement guidance",
              },
              feedback: {
                type: "string",
                description:
                  "Constructive assessment of speaking pace - acknowledge what's working while suggesting refinements",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Examples of pace strengths and development opportunities",
              },
            },
            required: ["score", "feedback", "examples"],
          },
          confidence: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Confidence score with encouraging assessment - recognize current level while providing building strategies",
              },
              feedback: {
                type: "string",
                description:
                  "Balanced assessment of confidence level - acknowledge progress potential and provide development guidance",
              },
              indicators: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific behavioral indicators with focus on development opportunities and confidence building",
              },
            },
            required: ["score", "feedback", "indicators"],
          },
        },
        required: ["clarity", "articulation", "pace", "confidence"],
      },
      audioQuality: {
        type: "object",
        properties: {
          clarity: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Audio clarity score based on professional standards - provide constructive feedback for improvement",
              },
              feedback: {
                type: "string",
                description:
                  "Balanced assessment of audio quality - acknowledge technical considerations while providing actionable improvement suggestions",
              },
              issues: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific technical considerations and improvement opportunities for better audio quality",
              },
            },
            required: ["score", "feedback", "issues"],
          },
          volume: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Volume appropriateness score with development guidance - focus on optimization opportunities",
              },
              feedback: {
                type: "string",
                description:
                  "Assessment of volume levels with constructive suggestions for professional optimization",
              },
              notes: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific notes about volume optimization and professional audio setup recommendations",
              },
            },
            required: ["score", "feedback", "notes"],
          },
          background: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Background environment score - provide constructive guidance for professional setup optimization",
              },
              feedback: {
                type: "string",
                description:
                  "Assessment of background environment with practical suggestions for professional interview setup",
              },
              distractions: {
                type: "array",
                items: { type: "string" },
                description:
                  "Environmental considerations and practical recommendations for professional interview environment",
              },
            },
            required: ["score", "feedback", "distractions"],
          },
        },
        required: ["clarity", "volume", "background"],
      },
      overallPerformance: {
        type: "object",
        properties: {
          professionalism: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Professional presentation score with constructive development focus - acknowledge strengths while providing enhancement guidance",
              },
              feedback: {
                type: "string",
                description:
                  "Balanced assessment of professional demeanor with constructive improvement suggestions",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples highlighting both professional strengths and development opportunities",
              },
            },
            required: ["score", "feedback", "examples"],
          },
          engagement: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Engagement level score with development potential focus - recognize current energy while suggesting enhancement strategies",
              },
              feedback: {
                type: "string",
                description:
                  "Constructive assessment of engagement and enthusiasm with development recommendations",
              },
              indicators: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific indicators of engagement with focus on building stronger interview presence",
              },
            },
            required: ["score", "feedback", "indicators"],
          },
          readiness: {
            type: "object",
            properties: {
              score: {
                type: "number",
                minimum: 0,
                maximum: 10,
                description:
                  "Interview readiness score with development pathway focus - assess current level while providing clear improvement guidance",
              },
              feedback: {
                type: "string",
                description:
                  "Constructive assessment of interview preparation and performance readiness with actionable next steps",
              },
              assessment: {
                type: "string",
                description:
                  "Overall readiness evaluation with encouraging development timeline and specific preparation recommendations",
              },
            },
            required: ["score", "feedback", "assessment"],
          },
        },
        required: ["professionalism", "engagement", "readiness"],
      },
      recommendations: {
        type: "object",
        properties: {
          immediate: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: {
                  type: "string",
                  description:
                    "Development area with clear improvement potential for enhanced interview performance",
                },
                suggestion: {
                  type: "string",
                  description:
                    "Specific, actionable suggestion with encouraging guidance for addressing the development area",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description:
                    "Development priority level - high for core improvements, medium for competitive advantages, low for enhancement opportunities",
                },
              },
              required: ["area", "suggestion", "priority"],
            },
            description:
              "Priority improvements with clear development benefits for interview success",
          },
          practice: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: {
                  type: "string",
                  description:
                    "Specific skill with clear development potential",
                },
                exercise: {
                  type: "string",
                  description:
                    "Detailed practice exercise targeting the development opportunity with encouraging guidance",
                },
                frequency: {
                  type: "string",
                  description:
                    "Realistic practice frequency and encouraging timeline for improvement",
                },
              },
              required: ["skill", "exercise", "frequency"],
            },
            description:
              "Specific practice exercises targeting development opportunities with achievable improvement goals",
          },
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description:
                    "Type of resource appropriate for the current skill level and development goals",
                },
                description: {
                  type: "string",
                  description:
                    "Specific resource recommendation targeting development needs with constructive guidance",
                },
                link: {
                  type: "string",
                  description:
                    "Actual resource link when available (not placeholder text)",
                },
              },
              required: ["type", "description", "link"],
            },
            description:
              "Practical resources for addressing development areas and improving interview performance",
          },
        },
        required: ["immediate", "practice", "resources"],
      },
      summary: {
        type: "object",
        properties: {
          strengths: {
            type: "array",
            items: { type: "string" },
            description:
              "Genuine strengths and positive aspects demonstrated during the interview",
          },
          weaknesses: {
            type: "array",
            items: { type: "string" },
            description:
              "Development areas and improvement opportunities that would enhance interview effectiveness",
          },
          keyInsights: {
            type: "array",
            items: { type: "string" },
            description:
              "Key observations and constructive insights about interview performance and development potential",
          },
          overallScore: {
            type: "number",
            minimum: 0,
            maximum: 10,
            description:
              "Thoughtful overall interview performance score using balanced assessment that encourages growth and development",
          },
        },
        required: ["strengths", "weaknesses", "keyInsights", "overallScore"],
      },
    },
    required: [
      "type",
      "communicationSkills",
      "audioQuality",
      "overallPerformance",
      "recommendations",
      "summary",
    ],
  };

  // Add bodyLanguage for video analysis
  if (mediaType === "video") {
    baseSchema.properties.bodyLanguage = {
      type: "object",
      properties: {
        posture: {
          type: "object",
          properties: {
            score: {
              type: "number",
              minimum: 0,
              maximum: 10,
              description:
                "Posture score with constructive development focus - assess current presentation while providing enhancement guidance",
            },
            feedback: {
              type: "string",
              description:
                "Balanced assessment of posture and body positioning with practical improvement suggestions",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about posture and positioning with focus on professional enhancement opportunities",
            },
          },
          required: ["score", "feedback", "observations"],
        },
        eyeContact: {
          type: "object",
          properties: {
            score: {
              type: "number",
              minimum: 0,
              maximum: 10,
              description:
                "Eye contact score with development guidance - recognize current level while providing engagement enhancement strategies",
            },
            feedback: {
              type: "string",
              description:
                "Constructive assessment of eye contact with camera, including practical tips for improvement",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about eye contact patterns and visual connection with development recommendations",
            },
          },
          required: ["score", "feedback", "observations"],
        },
        gestures: {
          type: "object",
          properties: {
            score: {
              type: "number",
              minimum: 0,
              maximum: 10,
              description:
                "Gesture effectiveness score with enhancement focus - evaluate current use while suggesting refinements",
            },
            feedback: {
              type: "string",
              description:
                "Assessment of hand gestures and movements with constructive guidance for professional optimization",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about gesture use with focus on communication enhancement opportunities",
            },
          },
          required: ["score", "feedback", "observations"],
        },
        presence: {
          type: "object",
          properties: {
            score: {
              type: "number",
              minimum: 0,
              maximum: 10,
              description:
                "Overall visual presence score with development potential focus - assess current professional appearance while providing enhancement guidance",
            },
            feedback: {
              type: "string",
              description:
                "Comprehensive assessment of visual presence with constructive recommendations for professional development",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Overall observations about visual presence and professional demeanor with development opportunities",
            },
          },
          required: ["score", "feedback", "observations"],
        },
      },
      required: ["posture", "eyeContact", "gestures", "presence"],
    };

    // Add bodyLanguage to required fields for video
    baseSchema.required.push("bodyLanguage");
  }

  return baseSchema;
};
