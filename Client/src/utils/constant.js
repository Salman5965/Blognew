// import { API_BASE_URL as API_URL } from "./apiConfig";

// export const API_BASE_URL = API_URL;

// export const ROUTES = {
//   HOME: "/",
//   LOGIN: "/login",
//   REGISTER: "/register",
//   FORGOT_PASSWORD: "/forgot-password",
//   RESET_PASSWORD: "/reset-password",
//   CREATE_BLOG: "/create",
//   EDIT_BLOG: "/edit",
//   BLOG_DETAILS: "/blog",
//   DASHBOARD: "/dashboard",
//   MY_BLOGS: "/dashboard/blogs",
//   MY_POSTS: "/dashboard/posts",
//   PROFILE: "/dashboard/profile",
//   USER_PROFILE: "/users",
//   FOLLOWERS: "/users/:userId/followers",
//   FOLLOWING: "/users/:userId/following",
//   DISCOVER: "/explore",
//   EXPLORE: "/explore",

//   ABOUT: "/about",
//   CONTACT: "/contact",
//   PRIVACY: "/privacy",
//   TERMS: "/terms",
//   COOKIES: "/cookies",
//   GDPR: "/gdpr",
//   HELP: "/help",
//   FEED: "/feed",
// };

// export const BLOG_STATUS = {
//   DRAFT: "draft",
//   PUBLISHED: "published",
// };

// export const PAGINATION = {
//   DEFAULT_PAGE: 1,
//   DEFAULT_LIMIT: 10,
//   BLOG_LIMIT: 12,
//   COMMENT_LIMIT: 20,
// };

// export const VALIDATION_MESSAGES = {
//   REQUIRED: "This field is required",
//   INVALID_EMAIL: "Please enter a valid email address",
//   PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
//   TITLE_MIN_LENGTH: "Title must be at least 3 characters",
//   CONTENT_MIN_LENGTH: "Content must be at least 10 characters",
//   USERNAME_MIN_LENGTH: "Username must be at least 3 characters",
// };

// export const LOCAL_STORAGE_KEYS = {
//   AUTH_TOKEN: "authToken",
//   USER_DATA: "userData",
//   THEME: "theme",
//   DRAFT_BLOG: "draftBlog",
// };

// export const DEBOUNCE_DELAY = {
//   SEARCH: 300,
//   AUTO_SAVE: 1000,
// };

// export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// export const DEFAULT_AVATAR = "/placeholder.svg";
// export const DEFAULT_COVER_IMAGE = "/placeholder.svg";








import { API_BASE_URL as API_URL } from "./apiConfig";

export const API_BASE_URL = API_URL;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CREATE_BLOG: "/create",
  EDIT_BLOG: "/edit",
  BLOG_DETAILS: "/blog",
  DASHBOARD: "/dashboard",
  MY_BLOGS: "/dashboard/blogs",
  MY_POSTS: "/dashboard/posts",
  PROFILE: "/dashboard/profile",
  USER_PROFILE: "/users",
  FOLLOWERS: "/users/:userId/followers",
  FOLLOWING: "/users/:userId/following",
  DISCOVER: "/explore",
  EXPLORE: "/explore",

  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  COOKIES: "/cookies",
  GDPR: "/gdpr",
  HELP: "/help",
  FEED: "/feed",
};

export const BLOG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  BLOG_LIMIT: 12,
  COMMENT_LIMIT: 20,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
  TITLE_MIN_LENGTH: "Title must be at least 3 characters",
  CONTENT_MIN_LENGTH: "Content must be at least 10 characters",
  USERNAME_MIN_LENGTH: "Username must be at least 3 characters",
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  THEME: "theme",
  DRAFT_BLOG: "draftBlog",
};

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  AUTO_SAVE: 1000,
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const DEFAULT_AVATAR = "/placeholder.svg";
export const DEFAULT_COVER_IMAGE = "/placeholder.svg";
