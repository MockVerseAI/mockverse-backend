import { body, query, param } from "express-validator";

const getInterviewTemplatesValidator = () => {
  return [
    query("search").optional().trim(),
    query("category").optional().trim(),
  ];
};

const createInterviewTemplateValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("description is required"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("category is required")
      .isIn(["technical", "behavioral", "system-design", "hr", "mixed"])
      .withMessage(
        "category must be one of: technical, behavioral, system-design, hr, mixed"
      ),

    // promptInsertions validation with nested structure
    body("promptInsertions")
      .notEmpty()
      .withMessage("promptInsertions is required")
      .isObject()
      .withMessage("promptInsertions must be an object"),

    // Introduction validation
    body("promptInsertions.introduction")
      .notEmpty()
      .withMessage("introduction is required")
      .isObject()
      .withMessage("introduction must be an object"),
    body("promptInsertions.introduction.beginner")
      .notEmpty()
      .withMessage("introduction.beginner is required")
      .isString()
      .withMessage("introduction.beginner must be a string"),
    body("promptInsertions.introduction.intermediate")
      .notEmpty()
      .withMessage("introduction.intermediate is required")
      .isString()
      .withMessage("introduction.intermediate must be a string"),
    body("promptInsertions.introduction.advanced")
      .notEmpty()
      .withMessage("introduction.advanced is required")
      .isString()
      .withMessage("introduction.advanced must be a string"),
    body("promptInsertions.introduction.expert")
      .notEmpty()
      .withMessage("introduction.expert is required")
      .isString()
      .withMessage("introduction.expert must be a string"),

    // Interview structure validation
    body("promptInsertions.interviewStructure")
      .notEmpty()
      .withMessage("interviewStructure is required")
      .isObject()
      .withMessage("interviewStructure must be an object"),
    body("promptInsertions.interviewStructure.15")
      .notEmpty()
      .withMessage("interviewStructure.15 is required")
      .isString()
      .withMessage("interviewStructure.15 must be a string"),
    body("promptInsertions.interviewStructure.30")
      .notEmpty()
      .withMessage("interviewStructure.30 is required")
      .isString()
      .withMessage("interviewStructure.30 must be a string"),
    body("promptInsertions.interviewStructure.45")
      .notEmpty()
      .withMessage("interviewStructure.45 is required")
      .isString()
      .withMessage("interviewStructure.45 must be a string"),
    body("promptInsertions.interviewStructure.60")
      .notEmpty()
      .withMessage("interviewStructure.60 is required")
      .isString()
      .withMessage("interviewStructure.60 must be a string"),

    // Question categories validation
    body("promptInsertions.questionCategories")
      .notEmpty()
      .withMessage("questionCategories is required")
      .isObject()
      .withMessage("questionCategories must be an object"),
    body("promptInsertions.questionCategories.beginner")
      .notEmpty()
      .withMessage("questionCategories.beginner is required")
      .isArray()
      .withMessage("questionCategories.beginner must be an array"),
    body("promptInsertions.questionCategories.intermediate")
      .notEmpty()
      .withMessage("questionCategories.intermediate is required")
      .isArray()
      .withMessage("questionCategories.intermediate must be an array"),
    body("promptInsertions.questionCategories.advanced")
      .notEmpty()
      .withMessage("questionCategories.advanced is required")
      .isArray()
      .withMessage("questionCategories.advanced must be an array"),
    body("promptInsertions.questionCategories.expert")
      .notEmpty()
      .withMessage("questionCategories.expert is required")
      .isArray()
      .withMessage("questionCategories.expert must be an array"),

    // Behavioral focus validation
    body("promptInsertions.behavioralFocus")
      .notEmpty()
      .withMessage("behavioralFocus is required")
      .isObject()
      .withMessage("behavioralFocus must be an object"),
    body("promptInsertions.behavioralFocus.beginner")
      .notEmpty()
      .withMessage("behavioralFocus.beginner is required")
      .isString()
      .withMessage("behavioralFocus.beginner must be a string"),
    body("promptInsertions.behavioralFocus.intermediate")
      .notEmpty()
      .withMessage("behavioralFocus.intermediate is required")
      .isString()
      .withMessage("behavioralFocus.intermediate must be a string"),
    body("promptInsertions.behavioralFocus.advanced")
      .notEmpty()
      .withMessage("behavioralFocus.advanced is required")
      .isString()
      .withMessage("behavioralFocus.advanced must be a string"),
    body("promptInsertions.behavioralFocus.expert")
      .notEmpty()
      .withMessage("behavioralFocus.expert is required")
      .isString()
      .withMessage("behavioralFocus.expert must be a string"),

    // Technical depth validation
    body("promptInsertions.technicalDepth")
      .notEmpty()
      .withMessage("technicalDepth is required")
      .isObject()
      .withMessage("technicalDepth must be an object"),
    body("promptInsertions.technicalDepth.beginner")
      .notEmpty()
      .withMessage("technicalDepth.beginner is required")
      .isString()
      .withMessage("technicalDepth.beginner must be a string"),
    body("promptInsertions.technicalDepth.intermediate")
      .notEmpty()
      .withMessage("technicalDepth.intermediate is required")
      .isString()
      .withMessage("technicalDepth.intermediate must be a string"),
    body("promptInsertions.technicalDepth.advanced")
      .notEmpty()
      .withMessage("technicalDepth.advanced is required")
      .isString()
      .withMessage("technicalDepth.advanced must be a string"),
    body("promptInsertions.technicalDepth.expert")
      .notEmpty()
      .withMessage("technicalDepth.expert is required")
      .isString()
      .withMessage("technicalDepth.expert must be a string"),

    // Follow-up strategy validation
    body("promptInsertions.followUpStrategy")
      .notEmpty()
      .withMessage("followUpStrategy is required")
      .isObject()
      .withMessage("followUpStrategy must be an object"),
    body("promptInsertions.followUpStrategy.15")
      .notEmpty()
      .withMessage("followUpStrategy.15 is required")
      .isString()
      .withMessage("followUpStrategy.15 must be a string"),
    body("promptInsertions.followUpStrategy.30")
      .notEmpty()
      .withMessage("followUpStrategy.30 is required")
      .isString()
      .withMessage("followUpStrategy.30 must be a string"),
    body("promptInsertions.followUpStrategy.45")
      .notEmpty()
      .withMessage("followUpStrategy.45 is required")
      .isString()
      .withMessage("followUpStrategy.45 must be a string"),
    body("promptInsertions.followUpStrategy.60")
      .notEmpty()
      .withMessage("followUpStrategy.60 is required")
      .isString()
      .withMessage("followUpStrategy.60 must be a string"),
  ];
};

const updateInterviewTemplateValidator = () => {
  return [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("name cannot be empty"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("description cannot be empty"),
    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("category cannot be empty")
      .isIn(["technical", "behavioral", "system-design", "hr", "mixed"])
      .withMessage(
        "category must be one of: technical, behavioral, system-design, hr, mixed"
      ),

    // Optional promptInsertions with deep validation if provided
    body("promptInsertions")
      .optional()
      .isObject()
      .withMessage("promptInsertions must be an object"),

    // Introduction validation
    body("promptInsertions.introduction")
      .optional()
      .isObject()
      .withMessage("introduction must be an object"),
    body("promptInsertions.introduction.beginner")
      .optional()
      .isString()
      .withMessage("introduction.beginner must be a string"),
    body("promptInsertions.introduction.intermediate")
      .optional()
      .isString()
      .withMessage("introduction.intermediate must be a string"),
    body("promptInsertions.introduction.advanced")
      .optional()
      .isString()
      .withMessage("introduction.advanced must be a string"),
    body("promptInsertions.introduction.expert")
      .optional()
      .isString()
      .withMessage("introduction.expert must be a string"),

    // Interview structure validation
    body("promptInsertions.interviewStructure")
      .optional()
      .isObject()
      .withMessage("interviewStructure must be an object"),
    body("promptInsertions.interviewStructure.15")
      .optional()
      .isString()
      .withMessage("interviewStructure.15 must be a string"),
    body("promptInsertions.interviewStructure.30")
      .optional()
      .isString()
      .withMessage("interviewStructure.30 must be a string"),
    body("promptInsertions.interviewStructure.45")
      .optional()
      .isString()
      .withMessage("interviewStructure.45 must be a string"),
    body("promptInsertions.interviewStructure.60")
      .optional()
      .isString()
      .withMessage("interviewStructure.60 must be a string"),

    // Question categories validation
    body("promptInsertions.questionCategories")
      .optional()
      .isObject()
      .withMessage("questionCategories must be an object"),
    body("promptInsertions.questionCategories.beginner")
      .optional()
      .isArray()
      .withMessage("questionCategories.beginner must be an array"),
    body("promptInsertions.questionCategories.intermediate")
      .optional()
      .isArray()
      .withMessage("questionCategories.intermediate must be an array"),
    body("promptInsertions.questionCategories.advanced")
      .optional()
      .isArray()
      .withMessage("questionCategories.advanced must be an array"),
    body("promptInsertions.questionCategories.expert")
      .optional()
      .isArray()
      .withMessage("questionCategories.expert must be an array"),

    // Behavioral focus validation
    body("promptInsertions.behavioralFocus")
      .optional()
      .isObject()
      .withMessage("behavioralFocus must be an object"),
    body("promptInsertions.behavioralFocus.beginner")
      .optional()
      .isString()
      .withMessage("behavioralFocus.beginner must be a string"),
    body("promptInsertions.behavioralFocus.intermediate")
      .optional()
      .isString()
      .withMessage("behavioralFocus.intermediate must be a string"),
    body("promptInsertions.behavioralFocus.advanced")
      .optional()
      .isString()
      .withMessage("behavioralFocus.advanced must be a string"),
    body("promptInsertions.behavioralFocus.expert")
      .optional()
      .isString()
      .withMessage("behavioralFocus.expert must be a string"),

    // Technical depth validation
    body("promptInsertions.technicalDepth")
      .optional()
      .isObject()
      .withMessage("technicalDepth must be an object"),
    body("promptInsertions.technicalDepth.beginner")
      .optional()
      .isString()
      .withMessage("technicalDepth.beginner must be a string"),
    body("promptInsertions.technicalDepth.intermediate")
      .optional()
      .isString()
      .withMessage("technicalDepth.intermediate must be a string"),
    body("promptInsertions.technicalDepth.advanced")
      .optional()
      .isString()
      .withMessage("technicalDepth.advanced must be a string"),
    body("promptInsertions.technicalDepth.expert")
      .optional()
      .isString()
      .withMessage("technicalDepth.expert must be a string"),

    // Follow-up strategy validation
    body("promptInsertions.followUpStrategy")
      .optional()
      .isObject()
      .withMessage("followUpStrategy must be an object"),
    body("promptInsertions.followUpStrategy.15")
      .optional()
      .isString()
      .withMessage("followUpStrategy.15 must be a string"),
    body("promptInsertions.followUpStrategy.30")
      .optional()
      .isString()
      .withMessage("followUpStrategy.30 must be a string"),
    body("promptInsertions.followUpStrategy.45")
      .optional()
      .isString()
      .withMessage("followUpStrategy.45 must be a string"),
    body("promptInsertions.followUpStrategy.60")
      .optional()
      .isString()
      .withMessage("followUpStrategy.60 must be a string"),
  ];
};

const findRelevantTemplateValidator = () => {
  return [
    param("interviewWorkspaceId")
      .isMongoId()
      .withMessage("Invalid interview workspace ID format"),
  ];
};

export {
  getInterviewTemplatesValidator,
  createInterviewTemplateValidator,
  updateInterviewTemplateValidator,
  findRelevantTemplateValidator,
};
