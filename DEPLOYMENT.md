# 🚀 Deployment & Production Guide

## Pre-Production Checklist

- [ ] All environment variables configured
- [ ] MongoDB database set up and accessible
- [ ] Frontend build tested
- [ ] Security vulnerabilities audited
- [ ] HTTPS configured (for production)
- [ ] CORS properly configured for your domain
- [ ] JWT secret changed (strong 32+ character key)
- [ ] Error handling and logging implemented
- [ ] Rate limiting enabled
- [ ] Database backups automated

## Environment Configuration

### Production Environment Variables

**Backend (`server/.env`)**
```env
PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-very-secure-secret-key-min-32-characters-long
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

**Frontend (`client/.env.local`)**
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

## 🏗️ Deployment Platforms

### Option 1: Heroku

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-chat-app-backend

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com

# Deploy
git push heroku main
```

#### Frontend Deployment
```bash
# Create Heroku app
heroku create your-chat-app-frontend

# Set buildpack for React
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-create-react-app.git

# Deploy
git push heroku main
```

### Option 2: AWS (Elastic Beanstalk + S3 + RDS)

#### Backend (Elastic Beanstalk)
```bash
# Install AWS CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 your-chat-backend

# Create environment
eb create production-env

# Set environment variables
eb setenv JWT_SECRET=your-secret MONGODB_URI=connection-string

# Deploy
eb deploy
```

#### Frontend (S3 + CloudFront)
```bash
# Build React app
cd client && npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Create CloudFront distribution for HTTPS
# See AWS documentation for details
```

### Option 3: DigitalOcean App Platform

```bash
# 1. Create app.yaml in root directory
# 2. Push to GitHub
# 3. Connect repository to DigitalOcean
# 4. Set environment variables in dashboard
# 5. Deploy automatically
```

### Option 4: Railway.app

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Configure environment
railway variables

# 5. Deploy
railway up
```

## 🔒 Security Hardening

### Backend Security

```javascript
// 1. Helmet.js for security headers
const helmet = require('helmet');
app.use(helmet());

// 2. Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// 3. Input validation
const { body, validationResult } = require('express-validator');

// 4. HTTPS enforcement
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### Frontend Security

```javascript
// 1. Content Security Policy
// Set in response headers or meta tag

// 2. XSS protection
// DOMPurify for sanitizing user input
npm install dompurify

// 3. HTTPS only
// Force HTTPS in production
if (window.location.protocol !== 'https:' && 
    window.location.hostname !== 'localhost') {
  window.location.protocol = 'https:';
}
```

## 📊 Monitoring & Logging

### Backend Monitoring

```javascript
// 1. Winston Logger
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 2. Error tracking
// Use Sentry, LogRocket, or similar
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_DSN_HERE" });
app.use(Sentry.Handlers.errorHandler());
```

### Frontend Monitoring

```javascript
// 1. Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN_HERE",
  environment: "production"
});

// 2. Performance monitoring
import { BrowserTracing } from "@sentry/tracing";

// 3. Analytics
// Google Analytics, Mixpanel, Amplitude, etc.
```

## 📈 Scaling Considerations

### Database Optimization
```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
messageSchema.index({ roomId: 1, createdAt: -1 });
chatRoomSchema.index({ members: 1 });
```

### Caching Strategy
```javascript
// Implement Redis for caching
const redis = require('redis');
const client = redis.createClient();
```

### WebSocket Scaling
```javascript
// Use Socket.io with Redis adapter for multiple servers
const io = require('socket.io')(server);
const { createAdapter } = require("@socket.io/redis-adapter");

const redisClient = require('redis').createClient();
io.adapter(createAdapter(redisClient));
```

## 🧪 Pre-Deployment Testing

```bash
# 1. Backend tests
cd server
npm test

# 2. Frontend tests
cd ../client
npm test

# 3. Build production version
npm run build

# 4. Security audit
npm audit

# 5. Performance testing
npm run analyze

# 6. Load testing
npm install -g artillery
artillery run load-test.yml
```

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install dependencies
      run: npm run install-all
    
    - name: Run tests
      run: npm test
    
    - name: Build frontend
      run: npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: your-app-name
```

## 📞 Production Support

### Set Up Monitoring Dashboard
- Use tools like:
  - New Relic
  - Datadog
  - CloudWatch (AWS)
  - Stackdriver (Google Cloud)

### Implement Status Page
- Use services like:
  - Statuspage.io
  - Instatus
  - Upptime (GitHub-based)

### Error Tracking
- Use services like:
  - Sentry
  - LogRocket
  - Bugsnag
  - Rollbar

## 🗑️ Database Management

### Regular Backups

```bash
# MongoDB backup
mongodump --out ./backup/$(date +%Y%m%d_%H%M%S)

# Automated daily backup (cron job)
0 2 * * * /usr/local/bin/mongodump --out /backups/$(date +\%Y\%m\%d)
```

### Database Optimization

```bash
# Compact database
db.runCommand( { compact: 'collection_name' } )

# Create indexes
db.users.createIndex({ email: 1 })
db.messages.createIndex({ roomId: 1, createdAt: -1 })

# Remove old data
db.messages.deleteMany({ 
  createdAt: { $lt: new Date(new Date() - 90*24*60*60*1000) }
})
```

## 📋 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] All API endpoints respond correctly
- [ ] WebSocket connections establish
- [ ] Messages persist in database
- [ ] Logging is working
- [ ] Monitoring alerts configured
- [ ] Database backups scheduled
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Error handling working
- [ ] Performance acceptable

## 🚨 Troubleshooting Production Issues

### High Memory Usage
```bash
# Check process
ps aux | grep node

# Monitor with node-inspector
node --inspect server.js

# Profile memory leaks with clinic.js
npm install -g clinic
clinic doctor -- node server.js
```

### Slow Database Queries
```javascript
// Enable query logging
mongoose.set('debug', true);

// Use explain to analyze queries
db.messages.find({...}).explain("executionStats")
```

### WebSocket Connection Issues
```javascript
// Check Socket.io logs
io.on('connection_error', (error) => {
  console.error('Connection error:', error);
});

// Enable Socket.io debug mode
process.env.DEBUG = 'socket.io:*';
```

## 📚 Additional Resources

- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/nodejs-support)
- [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Now (Vercel) Deployment](https://vercel.com/docs)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

---

**Ready for Production! 🎉**
