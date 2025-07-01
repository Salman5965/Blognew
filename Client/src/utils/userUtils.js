/**
 * Utility functions for user display data
 */

/**
 * Get user initials for avatar fallback
 * @param {Object} user - User object with firstName, lastName, username
 * @returns {string} User initials or fallback
 */
export const getUserInitials = (user) => {
  if (!user) return "U";

  // Check if both firstName and lastName exist and are not empty
  if (
    user.firstName &&
    user.lastName &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    user.firstName.length > 0 &&
    user.lastName.length > 0
  ) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // Fallback to username if available
  if (
    user.username &&
    typeof user.username === "string" &&
    user.username.length > 0
  ) {
    return user.username.charAt(0).toUpperCase();
  }

  // Final fallback
  return "U";
};

/**
 * Get user initials from separate name parameters
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} User initials or fallback
 */
export const getInitialsFromNames = (firstName, lastName) => {
  const firstInitial =
    firstName && typeof firstName === "string" && firstName.length > 0
      ? firstName.charAt(0)
      : "";
  const lastInitial =
    lastName && typeof lastName === "string" && lastName.length > 0
      ? lastName.charAt(0)
      : "";

  const initials = `${firstInitial}${lastInitial}`.toUpperCase();
  return initials || "U";
};

/**
 * Get user initials from a full name string
 * @param {string} name - Full name string
 * @returns {string} User initials or fallback
 */
export const getInitialsFromName = (name) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "?";
  }

  return (
    name
      .trim()
      .split(" ")
      .filter((n) => n.length > 0) // Filter out empty strings
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"
  );
};

/**
 * Get user display name
 * @param {Object} user - User object with firstName, lastName, username
 * @returns {string} User display name or fallback
 */
export const getUserDisplayName = (user) => {
  if (!user) return "Anonymous User";

  // Check if both firstName and lastName exist and are not empty
  if (
    user.firstName &&
    user.lastName &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    user.firstName.trim().length > 0 &&
    user.lastName.trim().length > 0
  ) {
    return `${user.firstName.trim()} ${user.lastName.trim()}`;
  }

  // Fallback to username if available
  if (
    user.username &&
    typeof user.username === "string" &&
    user.username.trim().length > 0
  ) {
    return user.username.trim();
  }

  // Final fallback
  return "Anonymous User";
};

/**
 * Get user short display name (username or first name)
 * @param {Object} user - User object with firstName, lastName, username
 * @returns {string} User short name or fallback
 */
export const getUserShortName = (user) => {
  if (!user) return "Anonymous";

  // Prefer first name if available
  if (
    user.firstName &&
    typeof user.firstName === "string" &&
    user.firstName.trim().length > 0
  ) {
    return user.firstName.trim();
  }

  // Fallback to username if available
  if (
    user.username &&
    typeof user.username === "string" &&
    user.username.trim().length > 0
  ) {
    return user.username.trim();
  }

  // Final fallback
  return "Anonymous";
};

// Aliases for backward compatibility
export const getDisplayName = getUserDisplayName;
export const getInitials = getUserInitials;
