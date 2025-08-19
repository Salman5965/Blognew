// Consistent icon color classes throughout the application
export const iconColors = {
  // Primary actions and navigation
  primary: "text-primary",
  secondary: "text-muted-foreground",

  // Semantic colors
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",

  // Social and engagement
  like: "text-red-500 dark:text-red-400",
  bookmark: "text-yellow-600 dark:text-yellow-400",
  share: "text-blue-600 dark:text-blue-400",
  comment: "text-green-600 dark:text-green-400",

  // Content types
  blog: "text-blue-600 dark:text-blue-400",
  story: "text-green-600 dark:text-green-400",
  post: "text-purple-600 dark:text-purple-400",

  // User actions
  follow: "text-green-600 dark:text-green-400",
  message: "text-blue-600 dark:text-blue-400",
  notification: "text-yellow-600 dark:text-yellow-400",

  // Navigation
  menu: "text-muted-foreground hover:text-foreground",
  back: "text-muted-foreground hover:text-foreground",
  close: "text-muted-foreground hover:text-foreground",

  // Special states
  online: "text-green-500",
  offline: "text-gray-400",
  verified: "text-blue-500",
};

// Helper function to get icon color class
export const getIconColor = (type, variant = "default") => {
  if (variant === "muted") {
    return "text-muted-foreground";
  }

  return iconColors[type] || iconColors.primary;
};

export default iconColors;
