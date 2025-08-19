# 📝 WriteNest

<div align="center">

![WriteNest Logo](https://img.shields.io/badge/WriteNest-🖋️-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTlIOEwxOC4yIDguOEM...")

**Where Stories Come to Life and Writers Find Their Voice**

A modern, full-stack blogging platform designed for writers, storytellers, and content creators to share their passion with a vibrant community.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-View_Site-success?style=for-the-badge)](https://writenest.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/yourusername/writenest)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features

### 🖋️ **Content Creation**
- **Rich Text Editor** - Write with Markdown support and live preview
- **Story Publishing** - Share short stories and long-form content
- **Video Narration** - Add voice overs to your stories
- **Image Uploads** - Cloudinary integration for media management
- **Draft Management** - Save and edit drafts before publishing

### 👥 **Community Features**
- **User Profiles** - Customizable profiles with bio and social links
- **Follow System** - Follow your favorite writers
- **Comments & Likes** - Engage with community content
- **Real-time Notifications** - Get instant alerts for interactions
- **Community Forum** - Participate in discussions

### 📱 **User Experience**
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Dark/Light Theme** - Switch themes based on preference
- **Pull-to-Refresh** - Mobile-first navigation
- **Progressive Web App** - Install as a native app
- **Infinite Scroll** - Seamless content browsing

### 🔒 **Security & Performance**
- **JWT Authentication** - Secure login system
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive data sanitization
- **CORS Protection** - Cross-origin request security
- **Optimized Images** - Automatic image optimization

---

## 🛠️ Tech Stack

### **Frontend**
- **⚛️ React 18** - Modern React with hooks and concurrent features
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🎭 Framer Motion** - Smooth animations and transitions
- **🔧 Radix UI** - Accessible, unstyled UI components
- **📦 Vite** - Fast build tool and dev server
- **🚀 React Router** - Client-side routing
- **📡 Axios** - HTTP client for API calls
- **💾 Zustand** - Lightweight state management
- **🎯 React Hook Form** - Performant forms with validation

### **Backend**
- **🟢 Node.js** - JavaScript runtime
- **⚡ Express.js** - Fast, minimalist web framework
- **🍃 MongoDB** - NoSQL database with Mongoose ODM
- **🔐 JWT** - JSON Web Tokens for authentication
- **🔒 bcryptjs** - Password hashing
- **🛡️ Helmet** - Security middleware
- **📊 Morgan** - HTTP request logging
- **🔌 Socket.io** - Real-time communication

### **DevOps & Tools**
- **🐳 Docker** - Containerization (ready)
- **☁️ Cloudinary** - Image and video management
- **📝 ESLint & Prettier** - Code formatting and linting
- **🧪 Vitest** - Unit testing framework
- **📦 Concurrently** - Run multiple commands

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **MongoDB** (local or cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/writenest.git
cd writenest
```

### 2. Install Dependencies
```bash
# Install both client and server dependencies
cd Client && npm install
cd ../Server && npm install
```

### 3. Environment Setup
Create environment files:

**Client/.env.local**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_SOCKET_URL=http://localhost:5000
```

**Server/.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/writenest
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

### 4. Start Development Servers
```bash
cd Client
npm run dev:fullstack
```

This will start:
- 🎨 **Frontend**: http://localhost:5173
- 🔧 **Backend**: http://localhost:5000

---

## 📁 Project Structure

```
writenest/
├── 📁 Client/                    # React frontend application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── 📁 ui/          # Base UI components (Radix)
│   │   │   ├── 📁 blog/        # Blog-specific components
│   │   │   ├── 📁 chat/        # Chat & messaging
│   │   │   ├── 📁 layout/      # Layout components
│   │   │   └── 📁 notifications/ # Notification system
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API services
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 features/        # Feature stores (Zustand)
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 lib/             # Library configurations
│   ├── package.json
│   └── vite.config.js
├── 📁 Server/                   # Node.js backend API
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 models/              # MongoDB models
│   ├── 📁 routes/              # API routes
│   ├── 📁 middlewares/         # Custom middleware
│   ├── 📁 utils/               # Utility functions
│   ├── 📁 validators/          # Input validation schemas
│   ├── package.json
│   └── server.js
├── README.md
└── .gitignore
```

---

## 🎨 Key Pages & Features

### **Authentication System**
- 🔐 **Login/Register** - Beautiful card-based authentication
- 🔑 **Forgot Password** - Email-based password recovery
- 👤 **Profile Management** - Update user information and settings

### **Content Management**
- ✍️ **Create Blog** - Rich text editor with preview
- 📖 **Create Story** - Short-form content with video narration
- 📝 **My Posts** - Manage your published content
- 📊 **Analytics** - Track views, likes, and engagement

### **Discovery & Engagement**
- 🏠 **Feed** - Personalized content feed with pull-to-refresh
- 🔍 **Explore** - Discover trending and featured content
- 👥 **Community** - Forum-style discussions
- 🔔 **Notifications** - Real-time updates on interactions

### **Communication**
- 💬 **Messages** - Direct messaging between users
- 🗨️ **Comments** - Threaded comment system
- 📢 **Forum Chat** - Real-time community discussions

---

## 🔧 Development Scripts

### **Client Commands**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run format.fix       # Format code with Prettier
npm run test             # Run tests
```

### **Server Commands**
```bash
npm run dev              # Start with nodemon
npm start               # Start production server
npm run test            # Run tests
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
```

### **Full Stack Commands**
```bash
npm run dev:fullstack   # Start both client and server
```

---

## 🌐 API Documentation

### **Authentication Endpoints**
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile
PUT    /api/auth/profile      # Update profile
POST   /api/auth/forgot-password # Reset password
```

### **Blog Endpoints**
```
GET    /api/blogs            # Get all blogs
POST   /api/blogs            # Create new blog
GET    /api/blogs/:id        # Get specific blog
PUT    /api/blogs/:id        # Update blog
DELETE /api/blogs/:id        # Delete blog
POST   /api/blogs/:id/like   # Like/unlike blog
```

### **Story Endpoints**
```
GET    /api/stories          # Get all stories
POST   /api/stories          # Create new story
GET    /api/stories/:id      # Get specific story
PUT    /api/stories/:id      # Update story
DELETE /api/stories/:id      # Delete story
```

### **Social Features**
```
POST   /api/users/:id/follow # Follow/unfollow user
GET    /api/users/:id/followers # Get followers
GET    /api/users/:id/following # Get following
POST   /api/comments         # Add comment
GET    /api/notifications    # Get notifications
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. 🍴 Fork the repository
2. 🌱 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💍 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

### **Code Style**
- Follow ESLint and Prettier configurations
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed

---

## 📦 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd Client
npm run build
# Deploy dist/ folder
```

### **Backend (Heroku/Railway/Render)**
```bash
cd Server
# Set environment variables
# Deploy with your preferred platform
```

### **Database (MongoDB Atlas)**
- Create a MongoDB Atlas cluster
- Update `MONGODB_URI` in environment variables
- Ensure IP whitelist includes your deployment platform

---

## 🐛 Troubleshooting

### **Common Issues**

**🔴 Connection Refused Error**
- Ensure MongoDB is running
- Check database connection string
- Verify environment variables

**🔴 CORS Errors**
- Update `CORS_ORIGIN` in server environment
- Check API base URL in client environment

**🔴 Image Upload Issues**
- Verify Cloudinary credentials
- Check upload preset configuration
- Ensure file size limits are appropriate

### **Development Tips**
- Use browser dev tools for client debugging
- Check server logs for backend issues
- Monitor network tab for API request failures
- Use MongoDB Compass for database inspection

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the amazing utility-first CSS framework
- **Framer Motion** - For smooth animations
- **MongoDB** - For the flexible database solution
- **Cloudinary** - For image and video management

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/writenest/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/writenest/discussions)
- 📧 **Email**: support@writenest.com
- 🐦 **Twitter**: [@WriteNestApp](https://twitter.com/WriteNestApp)

---

<div align="center">

**Made with ❤️ by the WriteNest Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/writenest?style=social)](https://github.com/yourusername/writenest)
[![Twitter Follow](https://img.shields.io/twitter/follow/WriteNestApp?style=social)](https://twitter.com/WriteNestApp)

*Happy Writing! 📝✨*

</div>
