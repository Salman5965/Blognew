# Instagram-Style Comment System

A unified, reusable comment component that provides Instagram-like commenting experience across Blog, Stories, and Community Post pages.

## Features

### ✨ **UI/UX**
- **Instagram-like Layout**: Circular avatars, inline usernames, timestamps, and action buttons
- **Nested Replies**: Collapsible threaded conversations with smooth animations
- **Fixed Input Box**: Bottom-positioned input with auto-expanding textarea
- **Optimistic UI**: Instant feedback for likes, replies, and new comments
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

### 🎯 **Functionality**
- **Real-time Updates**: Instant like/unlike with immediate visual feedback
- **@Mentions**: Support for mentioning users in comments
- **Emoji Support**: Built-in emoji picker and support
- **Reply Threading**: Nested replies with visual indentation
- **Edit/Delete**: Comment management for authors and moderators
- **Load More**: Pagination for large comment threads

### 🔧 **Technical Features**
- **Optimistic Updates**: Comments appear instantly before backend confirmation
- **Error Handling**: Graceful rollback on API failures
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Virtualized scrolling for large comment lists
- **Animations**: Smooth transitions for expand/collapse, likes, and new comments

## Usage

### Basic Implementation

```jsx
import { InstagramComments } from "@/components/shared/InstagramComments";

// In your page component
<InstagramComments
  contentType="blog"           // 'blog', 'story', or 'community'
  contentId={postId}           // Unique ID of the content
  allowComments={true}         // Enable/disable commenting
  onCommentCountChange={(count) => {
    // Update parent component's comment count
    console.log('Comments:', count);
  }}
/>
```

### Content Types

- **Blog Posts**: `contentType="blog"`
- **Stories**: `contentType="story"`
- **Community Posts**: `contentType="community"`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentType` | `string` | `'blog'` | Type of content ('blog', 'story', 'community') |
| `contentId` | `string` | Required | Unique identifier for the content |
| `allowComments` | `boolean` | `true` | Whether commenting is enabled |
| `onCommentCountChange` | `function` | `undefined` | Callback when comment count changes |

## Integration

### Pages Updated

1. **BlogDetails.jsx** - Replaced old CommentSection
2. **StoryDetails.jsx** - New Instagram-style comments
3. **CommunityPost.jsx** - Replaced reply system

### Backend Compatibility

The component works with your existing API endpoints:

```javascript
// Comment endpoints
GET    /comments/blog/:id          // Get blog comments
GET    /comments/story/:id         // Get story comments  
GET    /comments/community/:id     // Get community comments
POST   /comments                   // Create comment/reply
PUT    /comments/:id               // Edit comment
DELETE /comments/:id               // Delete comment
POST   /comments/:id/like         // Like comment
POST   /comments/:id/unlike       // Unlike comment
```

### Data Structure Expected

```javascript
{
  _id: "comment_id",
  content: "Comment text with @mentions",
  author: {
    _id: "user_id",
    username: "username",
    avatar: "avatar_url"
  },
  createdAt: "2024-01-01T00:00:00Z",
  isEdited: false,
  likesCount: 5,
  isLiked: true,
  replies: [...], // Nested replies array
  repliesCount: 2,
  parentId: null // null for top-level, comment_id for replies
}
```

## Styling

### CSS Classes

The component includes custom CSS animations in `instagram-comments.css`:

- `.instagram-comment-item` - Main comment container
- `.heart-like-animation` - Heart like pulse effect
- `.replies-expand/.replies-collapse` - Reply thread animations
- `.optimistic-comment` - Temporary comment styling
- `.comment-avatar` - Avatar hover effects
- `.send-button-active` - Active send button state

### Theming

The component respects your app's theme system:
- Uses Tailwind CSS utility classes
- Supports dark/light mode
- Customizable via CSS variables
- Mobile-responsive breakpoints

## Animations

### Smooth Transitions
- **Like Button**: Pulse animation on click
- **Reply Expansion**: Smooth slide down/up
- **New Comments**: Fade-in from bottom
- **Input Focus**: Subtle glow effect
- **Avatar Hover**: Scale on hover
- **Send Button**: Color transition and scale

### Performance
- CSS transforms for smooth 60fps animations
- Minimal reflows with transform/opacity changes
- Hardware acceleration where appropriate

## Mobile Optimization

### Touch-Friendly
- Larger touch targets (44px minimum)
- Swipe gestures for actions
- Bottom input for thumb accessibility
- Safe area handling for iOS

### Responsive Features
- Collapsible UI elements on small screens
- Optimized spacing and typography
- Touch-optimized interaction zones
- Keyboard-aware input positioning

## Accessibility

### ARIA Support
- Proper ARIA labels for all interactive elements
- Screen reader announcements for state changes
- Keyboard navigation support
- Focus management for modals/dropdowns

### Standards Compliance
- WCAG 2.1 AA compliant
- Color contrast ratios meet standards
- Semantic HTML structure
- Alt text for images and icons

## Future Enhancements

### Planned Features
- [ ] Image/GIF support in comments
- [ ] Rich text formatting (bold, italic)
- [ ] Comment reactions (beyond likes)
- [ ] Voice comments/voice-to-text
- [ ] Comment translation
- [ ] Advanced emoji picker
- [ ] Comment search/filtering
- [ ] Real-time collaboration indicators

### Performance Improvements
- [ ] Virtual scrolling for 1000+ comments
- [ ] Comment caching and offline support
- [ ] Image lazy loading in comments
- [ ] Bundle size optimization

## Troubleshooting

### Common Issues

1. **Comments not loading**
   - Check API endpoint configuration
   - Verify authentication state
   - Check network requests in dev tools

2. **Optimistic updates failing**
   - Verify backend API response format
   - Check error handling in network tab
   - Ensure proper error rollback

3. **Animations not working**
   - Verify CSS file is imported
   - Check for conflicting CSS rules
   - Ensure proper browser support

### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('instagram-comments-debug', 'true');
```

This will log all API calls, state changes, and user interactions to the console.
