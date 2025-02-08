import mongoose, { Schema } from "mongoose";

const applicationFeedbackSchema = new Schema(
  {
    core_alignment_analysis: {
      role_fit_score: { type: Number, required: true, default: 0 },
      key_matches: { type: [String], required: true, default: [] },
      critical_gaps: { type: [String], required: true, default: [] },
    },
    keyword_optimization: {
      missing_critical_terms: [
        {
          _id: false,
          keyword: { type: String, required: true },
          importance_level: {
            type: String,
            required: true,
            enum: ["Critical", "High", "Medium"],
          },
          context_in_job: { type: String, required: true },
          suggested_addition: { type: String, required: true },
          placement_location: { type: String, required: true },
        },
      ],
      terms_to_strengthen: [
        {
          _id: false,
          existing_term: { type: String, required: true },
          current_usage: { type: String, required: true },
          improved_phrasing: { type: String, required: true },
          rationale: { type: String, required: true },
        },
      ],
    },
    experience_enhancement: {
      achievements_optimization: [
        {
          _id: false,
          current_bullet: { type: String, required: true },
          enhanced_version: { type: String, required: true },
          improvements_made: { type: [String], required: true },
          alignment_with_role: { type: String, required: true },
        },
      ],
      missing_experiences: [
        {
          _id: false,
          required_experience: { type: String, required: true },
          relevant_existing_experience: { type: String, required: true },
          reframing_suggestion: { type: String, required: true },
        },
      ],
    },
    skills_optimization: {
      technical_skills: {
        priority_additions: { type: [String], required: true, default: [] },
        skills_to_emphasize: { type: [String], required: true, default: [] },
        skills_to_reframe: [
          {
            _id: false,
            current: { type: String, required: true },
            suggested: { type: String, required: true },
            strategic_reason: { type: String, required: true },
          },
        ],
      },
      soft_skills: {
        missing_critical: { type: [String], required: true, default: [] },
        enhancement_suggestions: [
          {
            _id: false,
            skill: { type: String, required: true },
            demonstration_suggestion: { type: String, required: true },
          },
        ],
      },
    },
    impact_metrics: {
      additions_needed: [
        {
          _id: false,
          achievement: { type: String, required: true },
          suggested_metrics: { type: [String], required: true },
          data_points_to_gather: { type: [String], required: true },
        },
      ],
      metrics_to_enhance: [
        {
          _id: false,
          current_metric: { type: String, required: true },
          enhanced_version: { type: String, required: true },
          improvement_rationale: { type: String, required: true },
        },
      ],
    },
    professional_narrative: {
      summary_optimization: {
        current: { type: String, default: "Not provided" },
        enhanced_version: { type: String, required: true },
        key_improvements: { type: [String], required: true },
      },
      story_strengthening: [
        {
          _id: false,
          career_element: { type: String, required: true },
          current_presentation: { type: String, required: true },
          suggested_narrative: { type: String, required: true },
          strategic_value: { type: String, required: true },
        },
      ],
    },
    competitive_advantages: {
      unique_selling_points: { type: [String], required: true, default: [] },
      differentiation_opportunities: [
        {
          _id: false,
          area: { type: String, required: true },
          current_state: { type: String, required: true },
          enhancement_suggestion: { type: String, required: true },
          expected_impact: { type: String, required: true },
        },
      ],
    },
    industry_alignment: {
      domain_expertise: {
        highlighted_areas: { type: [String], required: true, default: [] },
        areas_to_emphasize: { type: [String], required: true, default: [] },
        knowledge_gaps: { type: [String], required: true, default: [] },
      },
      company_culture_fit: {
        alignment_points: { type: [String], required: true, default: [] },
        areas_to_highlight: { type: [String], required: true, default: [] },
      },
    },
    action_priorities: {
      immediate_changes: { type: [String], required: true, default: [] },
      high_impact_updates: { type: [String], required: true, default: [] },
      strategic_enhancements: { type: [String], required: true, default: [] },
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
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

export const ApplicationFeedback = mongoose.model(
  "ApplicationFeedback",
  applicationFeedbackSchema
);
