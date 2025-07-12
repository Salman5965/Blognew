import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  "😀": [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
  ],
  "❤️": [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
  ],
  "👍": [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
  ],
  "🎉": [
    "🎉",
    "🎊",
    "🎈",
    "🎂",
    "🎁",
    "🎀",
    "🎗️",
    "🎟️",
    "🎫",
    "🎖️",
    "🏆",
    "🏅",
    "🥇",
    "🥈",
    "🥉",
    "⚽",
  ],
  "🐶": [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
  ],
  "🍎": [
    "🍎",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
  ],
};

const EmojiPicker = ({ onEmojiSelect, children }) => {
  const [activeCategory, setActiveCategory] = useState("😀");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <div
            role="button"
            tabIndex={0}
            className="h-6 w-6 rounded-full cursor-pointer hover:bg-muted flex items-center justify-center"
          >
            <Smile className="h-4 w-4" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" side="top" align="end">
        <div className="bg-card border rounded-lg shadow-lg">
          {/* Category tabs */}
          <div className="flex border-b p-2 gap-1">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted text-lg"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmojiPicker;
