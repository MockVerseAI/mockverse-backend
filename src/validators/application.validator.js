import { body } from "express-validator";

const createApplicationValidator = () => {
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

export { createApplicationValidator };
