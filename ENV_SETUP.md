# SilentVoice Environment Setup Guide

## 📁 Environment Files Structure

```
silentvoice/
├── .env.example              # Template with all possible variables
├── .env.development          # Development environment
├── .env.production           # Production environment
├── .env                      # Your local environment (copy from .env.example)
├── Client/
│   ├── .env.local           # Frontend-specific variables
│   └── .env.production      # Frontend production variables
└── Server/
    ├── .env                 # Backend environment variables
    └── .env.production      # Backend production variables
```

## 🚀 Quick Setup

### 1. Copy Environment Files

```bash
# Copy the example file and customize it
cp .env.example .env

# For development
cp .env.development .env

# For client-side variables
cp Client/.env.local Client/.env.local
```

### 2. Fill Required Variables

**Minimum required variables for local development:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/silentvoice_dev

# JWT Secrets (generate your own)
JWT_SECRET=your-local-jwt-secret-key
JWT_REFRESH_SECRET=your-local-refresh-secret-key

# API URLs
API_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Generate Secrets

```bash
# Generate random secrets for JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔧 Environment Variables Explained

### Core Application

- `NODE_ENV` - Environment mode (development/production)
- `APP_NAME` - Application name (SilentVoice)
- `PORT` - Server port (default: 3001)
- `API_URL` - Backend API URL

### Database

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name

### Authentication

- `JWT_SECRET` - JWT signing secret (keep secure!)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_EXPIRES_IN` - Token expiration time
- `BCRYPT_ROUNDS` - Password hashing rounds

### Email Service

- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FROM_EMAIL` - Sender email address

### File Upload

- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### OAuth Providers

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret

### Frontend (React App)

- `REACT_APP_API_URL` - API endpoint for frontend
- `REACT_APP_APP_NAME` - App name in frontend
- `REACT_APP_ENABLE_*` - Feature flags

## 🌍 Environment-Specific Setup

### Development Environment

```bash
# Use development settings
cp .env.development .env

# Start development servers
npm run dev  # or your dev command
```

### Production Environment

```bash
# Use production template
cp .env.production .env

# Fill in production values:
# - Strong JWT secrets
# - Production database URL
# - Production SMTP settings
# - Production OAuth credentials
# - SSL certificates

# Build and deploy
npm run build
npm start
```

## 🔒 Security Best Practices

### 1. Never Commit Secrets

```gitignore
# Add to .gitignore
.env
.env.local
.env.production
.env.development.local
.env.test.local
.env.production.local
```

### 2. Use Strong Secrets

```bash
# Generate 64-byte hex strings for JWT secrets
openssl rand -hex 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Environment-Specific Values

- **Development**: Use simple, non-secure values
- **Production**: Use strong, randomly generated secrets
- **Testing**: Use separate test database and keys

## 📦 Required Services

### Local Development

1. **MongoDB** - Local instance or MongoDB Atlas
2. **Node.js** - Version 16+ recommended
3. **Redis** (optional) - For caching and sessions

### Production

1. **MongoDB Atlas** - Managed MongoDB service
2. **Email Service** - SendGrid, Mailgun, or similar
3. **File Storage** - Cloudinary, AWS S3, or similar
4. **Redis** - For production caching
5. **SSL Certificate** - For HTTPS

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   ```
   Error: Could not connect to MongoDB
   ```

   - Check `MONGODB_URI` is correct
   - Ensure MongoDB is running locally or Atlas is accessible

2. **JWT Token Invalid**

   ```
   Error: Invalid token
   ```

   - Ensure `JWT_SECRET` matches between client and server
   - Check token expiration settings

3. **Email Not Sending**

   ```
   Error: SMTP connection failed
   ```

   - Verify SMTP credentials
   - Check firewall/network settings
   - For Gmail, use App Passwords

4. **File Upload Failed**
   ```
   Error: Upload failed
   ```

   - Check Cloudinary/S3 credentials
   - Verify file size limits
   - Ensure proper CORS settings

### Debug Steps

1. Check all required variables are set
2. Verify database connectivity
3. Test SMTP settings with a simple script
4. Validate OAuth redirect URLs
5. Check server logs for detailed errors

## 📋 Environment Checklist

### Before Going Live

- [ ] All secrets are strong and unique
- [ ] Database uses production connection string
- [ ] SMTP is configured for production
- [ ] OAuth apps are configured for production domains
- [ ] File upload service is configured
- [ ] SSL certificates are installed
- [ ] Rate limiting is enabled
- [ ] Error tracking is set up
- [ ] Backups are configured
- [ ] Monitoring is in place

### Security Audit

- [ ] No secrets in code repository
- [ ] Environment files are in .gitignore
- [ ] JWT secrets are 64+ characters
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive info

## 🆘 Getting Help

If you encounter issues:

1. Check this guide first
2. Review server logs
3. Test individual services (database, SMTP, etc.)
4. Check network connectivity
5. Verify all environment variables are set correctly

For additional support, refer to the main project documentation or create an issue in the repository.
