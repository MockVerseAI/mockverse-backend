import { cosineSimilarity } from "ai";
import { InterviewTemplate } from "../models/interviewTemplate.model.js";
import { InterviewWorkspace } from "../models/interviewWorkspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getEmbedding } from "../utils/helpers.js";

const createInterviewTemplate = asyncHandler(async (req, res) => {
  const { name, description, category, promptInsertions } = req.body;

  const embedding = await getEmbedding(`${name} ${description} ${category}`);

  const interviewTemplate = await InterviewTemplate.create({
    name,
    description,
    category,
    promptInsertions,
    embedding,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        interviewTemplate,
        "Interview template created successfully"
      )
    );
});

const getInterviewTemplates = asyncHandler(async (req, res) => {
  const { search = "", category = "", page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {
    isDeleted: false,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(category && { category: { $regex: category, $options: "i" } }),
  };

  const totalCount = await InterviewTemplate.countDocuments(query);

  const interviewTemplates = await InterviewTemplate.find(query)
    .select("name description category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        templates: interviewTemplates,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(totalCount / limitNumber),
        },
      },
      "Interview templates fetched successfully"
    )
  );
});

const deleteInterviewTemplate = asyncHandler(async (req, res) => {
  const { interviewTemplateId } = req.params;

  const interviewTemplate =
    await InterviewTemplate.findById(interviewTemplateId);

  if (!interviewTemplate) {
    throw new ApiError(404, "Interview template not found");
  }

  await InterviewTemplate.findByIdAndUpdate(interviewTemplateId, {
    isDeleted: true,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Interview template deleted successfully")
    );
});

const updateInterviewTemplate = asyncHandler(async (req, res) => {
  const { interviewTemplateId } = req.params;
  const { body } = req;

  const interviewTemplate = await InterviewTemplate.findOne({
    _id: interviewTemplateId,
    isDeleted: false,
  });

  if (!interviewTemplate) {
    throw new ApiError(404, "Interview template not found");
  }

  const updatedInterviewTemplate = await InterviewTemplate.findByIdAndUpdate(
    interviewTemplateId,
    { $set: body },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedInterviewTemplate,
        "Interview template updated successfully"
      )
    );
});

const findRelevantTemplate = asyncHandler(async (req, res) => {
  const { interviewWorkspaceId } = req.params;
  const { limit = 3 } = req.query;

  const interviewWorkspace =
    await InterviewWorkspace.findById(interviewWorkspaceId);

  if (!interviewWorkspace || interviewWorkspace.isDeleted) {
    throw new ApiError(404, "Interview workspace not found");
  }

  const {
    embedding: jobEmbedding,
    jobDescription,
    jobRole,
  } = interviewWorkspace;

  const templates = await InterviewTemplate.find({
    isDeleted: { $ne: true },
    embedding: { $ne: null },
  }).lean();

  const templatesWithScores = templates.map((template) => {
    const similarityScore = cosineSimilarity(jobEmbedding, template.embedding);
    return { ...template, score: similarityScore };
  });

  templatesWithScores.sort((a, b) => b.score - a.score);

  const topRelevantTemplates = templatesWithScores.slice(
    0,
    parseInt(limit, 10)
  );

  const experienceLevel = getExperienceLevel(jobDescription);
  let recommendedDifficulty;

  switch (experienceLevel) {
    case "entry":
      recommendedDifficulty = "beginner";
      break;
    case "junior":
      recommendedDifficulty = "intermediate";
      break;
    case "mid":
      recommendedDifficulty = "advanced";
      break;
    case "senior":
      recommendedDifficulty = "expert";
      break;
    default:
      recommendedDifficulty = "intermediate";
  }

  // Format the response
  const relevantTemplates = topRelevantTemplates.map((template) => ({
    _id: template._id,
    name: template.name,
    description: template.description,
    category: template.category,
    relevanceScore: template.score,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        templates: relevantTemplates,
        recommendedDifficulty,
        experienceLevel,
        jobContext: {
          role: jobRole,
          description: jobDescription,
        },
      },
      "Relevant templates fetched successfully"
    )
  );
});

// Helper function to determine experience level from job description
function getExperienceLevel(jobDescription) {
  if (!jobDescription) return "mid"; // Default if no description provided

  const jobDescLower = jobDescription.toLowerCase();

  // Define scoring patterns with weights
  const patternScores = [
    // Senior level patterns (weight: 10)
    {
      pattern: /\b(senior|lead|staff|principal|architect)\b/,
      level: "senior",
      weight: 10,
    },
    {
      pattern: /\b(5\+|6\+|7\+|8\+|9\+|10\+)\s*years?\b/,
      level: "senior",
      weight: 10,
    },
    { pattern: /\bextensive experience\b/, level: "senior", weight: 8 },
    {
      pattern: /\b(manage|managing|oversee|leadership)\b/,
      level: "senior",
      weight: 7,
    },

    // Mid level patterns (weight: 5)
    {
      pattern: /\b(mid[\s-]level|middle|intermediate)\b/,
      level: "mid",
      weight: 5,
    },
    {
      pattern: /\b(3[\s-]*5|3[\s-]*4|3\+|4\+)\s*years?\b/,
      level: "mid",
      weight: 5,
    },
    { pattern: /\bstrong experience\b/, level: "mid", weight: 4 },

    // Junior level patterns (weight: 3)
    { pattern: /\b(junior|jr\.?|associate)\b/, level: "junior", weight: 3 },
    {
      pattern: /\b(1[\s-]*2|1[\s-]*3|1\+|2\+)\s*years?\b/,
      level: "junior",
      weight: 3,
    },
    { pattern: /\bsome experience\b/, level: "junior", weight: 2 },

    // Entry level patterns (weight: 1)
    {
      pattern: /\b(entry[\s-]level|graduate|fresh|trainee|intern)\b/,
      level: "entry",
      weight: 1,
    },
    {
      pattern: /\b(0[\s-]*1|no experience|new graduate)\b/,
      level: "entry",
      weight: 1,
    },
    { pattern: /\bbootcamp\b/, level: "entry", weight: 1 },
  ];

  // Check for negation patterns
  const negationPatterns = [
    /not\s+(?:required|necessary|needed)/i,
    /no\s+(?:prior|previous)\s+experience/i,
  ];

  // Calculate scores for each experience level
  const scores = {
    senior: 0,
    mid: 0,
    junior: 0,
    entry: 0,
  };

  // Apply pattern matching with weights
  for (const { pattern, level, weight } of patternScores) {
    if (pattern.test(jobDescLower)) {
      scores[level] += weight;
    }
  }

  // Check for negation contexts that might invalidate certain matches
  for (const pattern of negationPatterns) {
    if (pattern.test(jobDescLower)) {
      // Reduce the weight of experience requirements if negated
      scores.senior *= 0.5;
      scores.mid *= 0.7;
    }
  }

  // Check for education requirements that might suggest entry-level
  if (/recent\s+graduate|new\s+graduate/.test(jobDescLower)) {
    scores.entry += 3;
  }

  // Look for highest scoring level
  const levels = Object.keys(scores);
  let maxScore = 0;
  let determinedLevel = "mid"; // Default

  for (const level of levels) {
    if (scores[level] > maxScore) {
      maxScore = scores[level];
      determinedLevel = level;
    }
  }

  // If no strong signals (low confidence), default based on other heuristics
  if (maxScore < 2) {
    // Look for complexity indicators
    if (/\b(complex|architecture|design|strategy)\b/.test(jobDescLower)) {
      return "mid"; // Default to mid for complex tasks with no experience specified
    }

    // Look for education level as a fallback
    if (/\b(phd|master|ms|msc)\b/.test(jobDescLower)) {
      return "mid";
    } else if (/\b(bachelor|bs|bsc|b\.s)\b/.test(jobDescLower)) {
      return "junior";
    }
  }

  return determinedLevel;
}

export {
  createInterviewTemplate,
  deleteInterviewTemplate,
  findRelevantTemplate,
  getInterviewTemplates,
  updateInterviewTemplate,
};
