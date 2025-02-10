import { body } from "express-validator";

const setupInterviewValidator = () => {
  return [
    body("companyName")
      .trim()
      .notEmpty()
      .withMessage("companyName is required"),
    body("jobRole").trim().notEmpty().withMessage("jobRole is required"),
    body("jobDescription")
      .trim()
      .notEmpty()
      .withMessage("jobDescription is required"),
    body("resumeId").trim().notEmpty().withMessage("resumeId is required"),
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
