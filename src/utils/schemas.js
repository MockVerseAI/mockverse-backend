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
            "Honest role fit score using full 0-100 range. Use 0-30 for major mismatches (different industries/skills), 20-40 for career pivots without relevant experience, 40-70 for adequate matches with gaps, 70-100 for strong matches. Be realistic about fundamental role misalignment."
          ),
        key_matches: z
          .array(z.string())
          .describe(
            "Genuine areas where candidate strongly matches job requirements. Be specific about actual demonstrated skills and experiences, not potential or transferable skills from different domains."
          ),
        critical_gaps: z
          .array(z.string())
          .describe(
            "Essential requirements that are completely missing and would be deal-breakers. Categorize as CRITICAL (immediate disqualifiers), HIGH (major concerns), or MEDIUM (addressable gaps). Be direct about fundamental missing qualifications."
          ),
      })
      .describe(
        "Realistic analysis of role fit including honest assessment of major mismatches and fundamental gaps"
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
                  "Critical technical term or skill from job description that's completely absent from resume"
                ),
              importance_level: z
                .enum(["Critical", "High", "Medium"])
                .describe(
                  "Honest priority assessment - Critical for must-have skills that indicate fundamental gaps, High for important competitive advantages, Medium for nice-to-have additions"
                ),
              context_in_job: z
                .string()
                .min(1)
                .describe(
                  "Explain why this missing keyword indicates a significant skill gap versus just presentation issue"
                ),
              suggested_addition: z
                .string()
                .min(1)
                .describe(
                  "Realistic text suggestion - only if candidate actually has this skill. If not, recommend skill development first."
                ),
              placement_location: z
                .string()
                .min(1)
                .describe(
                  "Where to add this term, or note if candidate needs to acquire the skill before adding it"
                ),
            })
          )
          .describe(
            "Missing keywords that indicate actual skill gaps versus presentation issues. Differentiate between 'add these keywords' vs 'learn these skills first'"
          ),
        terms_to_strengthen: z
          .array(
            z.object({
              existing_term: z
                .string()
                .min(1)
                .describe("Keyword present but inadequately demonstrated"),
              current_usage: z
                .string()
                .min(1)
                .describe("Current weak or unclear presentation of the term"),
              improved_phrasing: z
                .string()
                .min(1)
                .describe(
                  "Enhanced presentation that better demonstrates actual competency"
                ),
              rationale: z
                .string()
                .min(1)
                .describe(
                  "Strategic reason for improvement and impact on candidate competitiveness"
                ),
            })
          )
          .describe(
            "Terms that exist but need stronger evidence or better positioning to demonstrate actual competency"
          ),
      })
      .describe(
        "Honest keyword analysis distinguishing between presentation fixes versus fundamental skill acquisition needs"
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
                "Technical skills from job requirements that candidate should acquire (not just add to resume). Prioritize based on actual job necessity."
              ),
            skills_to_emphasize: z
              .array(z.string())
              .describe(
                "Existing technical skills that are undersold or buried in resume but genuinely possessed by candidate"
              ),
            skills_to_reframe: z
              .array(
                z.object({
                  current: z
                    .string()
                    .min(1)
                    .describe(
                      "Current weak or unclear presentation of actual skill"
                    ),
                  suggested: z
                    .string()
                    .min(1)
                    .describe(
                      "Improved presentation that better demonstrates competency level"
                    ),
                  strategic_reason: z
                    .string()
                    .min(1)
                    .describe(
                      "Why this reframing addresses specific job requirements or industry standards"
                    ),
                })
              )
              .describe(
                "Technical skills needing better presentation to accurately reflect candidate's actual competency"
              ),
          })
          .describe(
            "Technical skills analysis focusing on genuine capabilities versus skills that need to be developed"
          ),
        soft_skills: z
          .object({
            missing_critical: z
              .array(z.string())
              .describe(
                "Essential soft skills from job requirements not demonstrated through concrete examples in experience"
              ),
            enhancement_suggestions: z
              .array(
                z.object({
                  skill: z
                    .string()
                    .min(1)
                    .describe("Soft skill requiring better demonstration"),
                  demonstration_suggestion: z
                    .string()
                    .min(1)
                    .describe(
                      "Specific way to demonstrate this skill through existing experiences, or note if candidate lacks relevant examples"
                    ),
                })
              )
              .describe(
                "Realistic suggestions for demonstrating soft skills through actual experiences"
              ),
          })
          .describe(
            "Soft skills analysis based on evidence from actual experiences, not assumptions"
          ),
      })
      .describe(
        "Skills optimization distinguishing between genuine capabilities and skills requiring development"
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
            "Critical modifications needed for basic competitiveness - presentation and formatting fixes"
          ),
        high_impact_updates: z
          .array(z.string())
          .describe(
            "Important changes addressing significant gaps or weak presentations that impact candidacy"
          ),
        strategic_enhancements: z
          .array(z.string())
          .describe(
            "Long-term skill development and experience building for career advancement - realistic timelines"
          ),
      })
      .describe(
        "Prioritized action plan with realistic timelines and honest assessment of effort required"
      ),
  })
  .describe(
    "Comprehensive, honest application feedback focusing on realistic improvements and authentic candidate positioning"
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
                    "Honest assessment of actual skill proficiency level demonstrated in interview"
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
                    "Priority level - must-have for essential skills, preferred for nice-to-have"
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
                    "Critical skill gap identified - be specific about what's missing"
                  ),
                impact: z
                  .enum(["high", "medium", "low"])
                  .describe(
                    "Honest impact assessment - high for deal-breakers, medium for concerning gaps, low for minor issues"
                  ),
                recommendation: z
                  .string()
                  .min(1)
                  .describe(
                    "Realistic improvement suggestion with honest timeline expectations"
                  ),
              })
            ),
            growthPath: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe("Skill requiring development"),
                timeline: z
                  .string()
                  .min(1)
                  .describe(
                    "Realistic development timeframe - be honest about months/years needed"
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
            "Honest technical skills analysis including significant gaps and realistic development timelines"
          ),
        problemSolving: z
          .object({
            analytical: z
              .string()
              .min(1)
              .describe(
                "Direct assessment of problem breakdown ability with specific interview examples"
              ),
            design: z
              .string()
              .min(1)
              .describe(
                "Honest evaluation of solution approach quality and feasibility"
              ),
            scalability: z
              .string()
              .min(1)
              .describe(
                "Assessment of scaling considerations and systems thinking demonstrated"
              ),
          })
          .describe(
            "Realistic assessment of problem-solving capabilities based on actual interview performance"
          ),
        technicalCommunication: z
          .object({
            clarity: z
              .string()
              .min(1)
              .describe(
                "Honest assessment of technical explanation ability - note unclear or confusing explanations"
              ),
            depth: z
              .string()
              .min(1)
              .describe(
                "Evaluation of technical discussion depth - acknowledge superficial understanding when evident"
              ),
          })
          .describe(
            "Direct evaluation of technical communication effectiveness with specific examples"
          ),
      })
      .describe(
        "Comprehensive technical assessment focusing on demonstrated capabilities versus role requirements"
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
                "Honest overall performance score using full 0-100 range - don't inflate for politeness"
              ),
            technical: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Technical skills score reflecting actual demonstrated competency"
              ),
            behavioral: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Behavioral competencies score based on evidence provided"
              ),
            communication: z
              .number()
              .min(0)
              .max(100)
              .describe(
                "Communication effectiveness score reflecting actual interview performance"
              ),
          })
          .describe(
            "Performance scores using full range and reflecting actual interview quality"
          ),
        benchmarks: z
          .object({
            industry: z
              .string()
              .min(1)
              .describe(
                "Honest industry comparison - acknowledge below-average performance when evident"
              ),
            role: z
              .string()
              .min(1)
              .describe("Role-specific comparison noting readiness level"),
            level: z
              .string()
              .min(1)
              .describe(
                "Level assessment - be direct about whether candidate meets role level expectations"
              ),
          })
          .describe(
            "Performance benchmarking with honest industry and role comparisons"
          ),
      })
      .describe(
        "Performance evaluation using realistic scoring and honest benchmarking"
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
                    "Critical focus area requiring immediate attention"
                  ),
                importance: z
                  .enum(["high", "medium", "low"])
                  .describe(
                    "Realistic importance level - high for fundamental gaps, medium for improvements, low for nice-to-haves"
                  ),
                action: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific, actionable step with realistic expectations"
                  ),
              })
            ),
            exercises: z.array(
              z.object({
                type: z
                  .string()
                  .min(1)
                  .describe("Specific exercise type targeting identified gaps"),
                description: z
                  .string()
                  .min(1)
                  .describe("Detailed exercise focusing on actual weaknesses"),
                goal: z
                  .string()
                  .min(1)
                  .describe(
                    "Realistic expected outcome with measurable criteria"
                  ),
              })
            ),
            resources: z.array(
              z.object({
                type: z
                  .string()
                  .min(1)
                  .describe(
                    "Resource type appropriate for identified skill level"
                  ),
                description: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific resource targeting actual development needs"
                  ),
                link: z
                  .string()
                  .optional()
                  .describe("Actual resource link when available"),
              })
            ),
          })
          .describe(
            "Immediate development actions targeting critical gaps and realistic improvements"
          ),
        shortTerm: z
          .object({
            goals: z.array(
              z.object({
                timeline: z
                  .string()
                  .min(1)
                  .describe(
                    "Realistic development timeline based on skill gap severity"
                  ),
                objective: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific, measurable goal addressing identified weaknesses"
                  ),
                success_criteria: z
                  .string()
                  .min(1)
                  .describe("Clear measurement criteria for goal achievement"),
              })
            ),
            skills: z.array(
              z.object({
                skill: z
                  .string()
                  .min(1)
                  .describe("Specific skill requiring development"),
                current_level: z
                  .string()
                  .min(1)
                  .describe("Honest assessment of current proficiency level"),
                target_level: z
                  .string()
                  .min(1)
                  .describe("Realistic target proficiency for role"),
                timeline: z
                  .string()
                  .min(1)
                  .describe("Honest timeline for skill development"),
              })
            ),
            actions: z
              .array(z.string())
              .describe(
                "Specific development steps with realistic expectations"
              ),
          })
          .describe(
            "Short-term development plan with honest timelines and achievable goals"
          ),
        preparation: z
          .object({
            questions: z.array(
              z.object({
                question: z
                  .string()
                  .min(1)
                  .describe(
                    "Specific practice question targeting identified weaknesses"
                  ),
                category: z
                  .string()
                  .min(1)
                  .describe("Question category based on gaps identified"),
                preparation_tips: z
                  .array(z.string())
                  .describe(
                    "Specific preparation guidance addressing actual response weaknesses"
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
                "Response templates targeting actual communication issues"
              )
              .optional(),
            scenarios: z.array(
              z.object({
                situation: z
                  .string()
                  .min(1)
                  .describe(
                    "Practice scenario addressing identified skill gaps"
                  ),
                expected_response: z
                  .string()
                  .min(1)
                  .describe("Ideal response structure and content"),
                evaluation_criteria: z
                  .array(z.string())
                  .describe(
                    "Assessment criteria focusing on improvement areas"
                  ),
              })
            ),
          })
          .partial()
          .describe(
            "Interview preparation targeting specific weaknesses and gaps identified"
          ),
      })
      .describe(
        "Comprehensive development plan with realistic timelines and honest assessment of effort required"
      ),
  })
  .describe(
    "Complete interview assessment with honest feedback and realistic development recommendations"
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
                  "Honest speech clarity score using full 0-10 range - use low scores for unclear speech, mumbling, or poor articulation",
              },
              feedback: {
                type: "string",
                description:
                  "Direct feedback on speech clarity with specific examples - be honest about communication issues that would concern interviewers",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples demonstrating clarity issues or strengths - include timestamps when relevant",
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
                  "Honest articulation score - use low scores for pronunciation problems or unclear speech",
              },
              feedback: {
                type: "string",
                description:
                  "Direct feedback on articulation quality - note specific pronunciation issues or unclear speech patterns",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples of articulation strengths or problems",
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
                  "Speaking pace score - use low scores for significantly too fast/slow speech that impairs understanding",
              },
              feedback: {
                type: "string",
                description:
                  "Honest assessment of speaking pace - note when speed significantly impacts comprehension or professionalism",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description: "Examples of pace issues or appropriate rhythm",
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
                  "Confidence score - use low scores for excessive nervousness, hesitation, or uncertainty that impacts delivery",
              },
              feedback: {
                type: "string",
                description:
                  "Realistic assessment of confidence level - acknowledge nervous energy or uncertainty when evident",
              },
              indicators: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific behavioral indicators of confidence or nervousness - filler words, hesitation, voice trembling, etc.",
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
                  "Audio clarity score based on professional interview standards - use low scores for technical issues that impair understanding",
              },
              feedback: {
                type: "string",
                description:
                  "Honest assessment of audio quality - be direct about technical issues that would concern interviewers",
              },
              issues: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific technical audio problems - echo, static, distortion, cutting out, etc.",
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
                  "Volume appropriateness score - use low scores for consistently too quiet/loud audio that impacts professionalism",
              },
              feedback: {
                type: "string",
                description:
                  "Assessment of volume levels and consistency - note when volume issues would distract interviewers",
              },
              notes: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific notes about volume consistency, appropriateness, and impact on interview quality",
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
                  "Background environment score - use low scores for distracting noise that would concern professional interviewers",
              },
              feedback: {
                type: "string",
                description:
                  "Honest assessment of background environment - note unprofessional or distracting audio environment",
              },
              distractions: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific background noise, interruptions, or environmental distractions that impact professionalism",
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
                  "Professional presentation score using realistic standards - use low scores for behavior below interview expectations",
              },
              feedback: {
                type: "string",
                description:
                  "Honest assessment of professional demeanor - address unprofessional behaviors directly",
              },
              examples: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific examples of professional or unprofessional behavior during the interview",
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
                  "Engagement level score - use low scores for flat, disinterested, or overly nervous delivery that suggests poor fit",
              },
              feedback: {
                type: "string",
                description:
                  "Realistic assessment of engagement and enthusiasm - acknowledge when energy level raises concerns",
              },
              indicators: {
                type: "array",
                items: { type: "string" },
                description:
                  "Specific indicators of engagement or disengagement - energy level, responsiveness, interest",
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
                  "Interview readiness score - be honest about preparation level and performance quality relative to role expectations",
              },
              feedback: {
                type: "string",
                description:
                  "Direct assessment of interview preparation and performance readiness",
              },
              assessment: {
                type: "string",
                description:
                  "Overall readiness evaluation - be honest about whether candidate is ready for target roles or needs significant preparation",
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
                    "Critical area needing immediate attention before further interviews",
                },
                suggestion: {
                  type: "string",
                  description:
                    "Specific, actionable suggestion addressing the identified issue",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description:
                    "Realistic priority level - high for issues that would significantly impact hiring decisions",
                },
              },
              required: ["area", "suggestion", "priority"],
            },
            description:
              "Critical improvements needed before pursuing target roles",
          },
          practice: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: {
                  type: "string",
                  description: "Specific skill requiring focused practice",
                },
                exercise: {
                  type: "string",
                  description:
                    "Detailed practice exercise targeting the identified weakness",
                },
                frequency: {
                  type: "string",
                  description:
                    "Realistic practice frequency and timeline for improvement",
                },
              },
              required: ["skill", "exercise", "frequency"],
            },
            description:
              "Specific practice exercises targeting identified weaknesses",
          },
          resources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description:
                    "Type of resource appropriate for the skill level and needs identified",
                },
                description: {
                  type: "string",
                  description:
                    "Specific resource recommendation targeting actual improvement needs",
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
              "Practical resources for addressing identified gaps and improving performance",
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
              "Genuine strengths demonstrated during the interview based on actual performance",
          },
          weaknesses: {
            type: "array",
            items: { type: "string" },
            description:
              "Critical areas needing improvement that impact interview effectiveness",
          },
          keyInsights: {
            type: "array",
            items: { type: "string" },
            description:
              "Key observations and insights about interview performance and readiness",
          },
          overallScore: {
            type: "number",
            minimum: 0,
            maximum: 10,
            description:
              "Honest overall interview performance score using full 0-10 range - reflect actual interview quality and professional standards",
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
                "Posture score based on professional standards - use low scores for slouching, fidgeting, or unprofessional positioning",
            },
            feedback: {
              type: "string",
              description:
                "Direct assessment of posture and body positioning - note unprofessional or distracting posture",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about posture, positioning, and physical presence",
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
                "Eye contact score - use low scores for avoiding camera, looking away frequently, or poor visual engagement",
            },
            feedback: {
              type: "string",
              description:
                "Honest assessment of eye contact with camera - note when poor eye contact would concern interviewers",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about eye contact patterns, camera engagement, and visual connection",
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
                "Gesture effectiveness score - use low scores for distracting, excessive, or inappropriate hand movements",
            },
            feedback: {
              type: "string",
              description:
                "Assessment of hand gestures and movements - note when gestures are distracting or unprofessional",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Specific observations about gesture use, appropriateness, and impact on communication",
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
                "Overall visual presence score - honest assessment of professional appearance and on-camera demeanor",
            },
            feedback: {
              type: "string",
              description:
                "Comprehensive assessment of visual presence and professional appearance on camera",
            },
            observations: {
              type: "array",
              items: { type: "string" },
              description:
                "Overall observations about visual presence, energy, and professional demeanor",
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
