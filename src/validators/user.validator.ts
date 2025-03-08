import { body, ValidationChain } from "express-validator";

/**
 * Validator for user registration
 * @returns Array of validation chains
 */
const userRegisterValidator = (): ValidationChain[] => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

/**
 * Validator for user login
 * @returns Array of validation chains
 */
const userLoginValidator = (): ValidationChain[] => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("username").optional(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

/**
 * Validator for changing current password
 * @returns Array of validation chains
 */
const userChangeCurrentPasswordValidator = (): ValidationChain[] => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

/**
 * Validator for forgot password request
 * @returns Array of validation chains
 */
const userForgotPasswordValidator = (): ValidationChain[] => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

/**
 * Validator for resetting forgotten password
 * @returns Array of validation chains
 */
const userResetForgottenPasswordValidator = (): ValidationChain[] => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

export {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator,
};
