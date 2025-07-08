import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "./constant";

/**
 * Parses text content to detect @username mentions and convert them to profile links
 * @param {string} content - The text content to parse
 * @returns {Array} - Array of React elements containing text and mention links
 */
export const parseMentions = (content) => {
  if (!content) return [content];

  // Regex to match @username patterns
  const mentionRegex = /@(\w+)/g;
  const parts = content.split(mentionRegex);

  return parts.map((part, index) => {
    // If index is odd, it's a username (captured group)
    if (index % 2 === 1) {
      return (
        <Link
          key={`mention-${index}`}
          to={`${ROUTES.USER_PROFILE}/${part}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          @{part}
        </Link>
      );
    }
    return part;
  });
};

/**
 * Extracts all usernames mentioned in text content
 * @param {string} content - The text content to parse
 * @returns {Array} - Array of usernames mentioned
 */
export const extractMentions = (content) => {
  if (!content) return [];

  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return [...new Set(mentions)]; // Remove duplicates
};

/**
 * Adds a mention to text content at cursor position
 * @param {string} content - Current text content
 * @param {string} username - Username to mention
 * @param {number} cursorPosition - Current cursor position
 * @returns {object} - Object with newContent and newCursorPosition
 */
export const addMention = (
  content,
  username,
  cursorPosition = content.length,
) => {
  const mention = `@${username} `;
  const newContent =
    content.slice(0, cursorPosition) + mention + content.slice(cursorPosition);

  return {
    newContent,
    newCursorPosition: cursorPosition + mention.length,
  };
};

/**
 * Checks if a position in text is within a mention
 * @param {string} content - The text content
 * @param {number} position - Position to check
 * @returns {object|null} - Mention info if position is within mention, null otherwise
 */
export const getMentionAtPosition = (content, position) => {
  const mentionRegex = /@(\w+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const startPos = match.index;
    const endPos = match.index + match[0].length;

    if (position >= startPos && position <= endPos) {
      return {
        username: match[1],
        startPos,
        endPos,
        fullMatch: match[0],
      };
    }
  }

  return null;
};
