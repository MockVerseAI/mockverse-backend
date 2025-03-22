import { body } from "express-validator";

const setupInterviewValidator = () => {
  return [
    body("resumeId").trim().notEmpty().withMessage("resumeId is required"),
    body("interviewTemplateId")
      .trim()
      .notEmpty()
      .withMessage("interviewTemplateId is required"),
    body("duration")
      .trim()
      .notEmpty()
      .withMessage("duration is required")
      .isIn([15, 30, 45, 60])
      .withMessage("duration must be one of: 15, 30, 45, 60"),
    body("difficulty")
      .trim()
      .notEmpty()
      .withMessage("difficulty is required")
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage(
        "difficulty must be one of: beginner, intermediate, advanced, expert"
      ),
  ];
};

const chatValidator = () => {
  return [
    body("isFirst")
      .trim()
      .notEmpty()
      .withMessage("isFirst is required")
      .isBoolean()
      .withMessage("isFirst must be a boolean")
      .toBoolean(),
    body("message")
      .if(body("isFirst").equals("false")) // Only validate `message` if `isFirst` is false
      .trim()
      .notEmpty()
      .withMessage("message is required"),
  ];
};

export { setupInterviewValidator, chatValidator };
