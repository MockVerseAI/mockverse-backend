import crypto from "crypto";

const getFormattedDateTime = () => {
  const now = new Date();

  // Extract date parts
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year

  // Extract time parts
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Format date and time
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return `${formattedDate} ${formattedTime}`;
};

const getHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

/**
 * @description Escape special regex characters in a string to prevent regex injection
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string safe for use in regex patterns
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export { getFormattedDateTime, getHash, escapeRegex };
