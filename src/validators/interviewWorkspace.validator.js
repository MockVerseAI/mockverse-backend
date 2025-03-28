import { body } from "express-validator";

const createInterviewWorkspaceValidator = () => {
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
  ];
};

export { createInterviewWorkspaceValidator };
