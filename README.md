# Real-Time Chat Application with WebSockets

A modern, full-featured real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring WebSocket communication for instant messaging, public/private rooms, and media sharing capabilities.

## 📋 Project Overview

This is a production-ready chat application inspired by platforms like Slack, WhatsApp, and Microsoft Teams. It provides users with a seamless experience for real-time communication through multiple chat channels, one-to-one messaging, and media sharing with complete message persistence.

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x or 22.x | Backend runtime |
| **Express.js** | 4.18.x+ | REST API framework |
| **MongoDB** | 5.0+ (Local or Atlas) | NoSQL database |
| **Mongoose** | 7.x+ | MongoDB ODM |
| **React** | 18.x+ | Frontend UI library |
| **Socket.io** | 4.x+ | Real-time bidirectional communication |
| **Socket.io-client** | 4.x+ | WebSocket client for React |
| **JWT** | jsonwebtoken 9.x+ | Authentication |
| **bcryptjs** | 2.4.x+ | Password hashing |
| **Multer** | 1.4.x+ | File upload middleware |
| **React Router** | 6.x+ | Client-side routing |
| **React Hot Toast** | 2.x+ | Toast notifications |

## ✨ Key Features

### Core Features
- ✅ **Real-time Chat** - Instant message delivery using WebSockets (Socket.io)
- ✅ **Public Rooms** - Anyone can discover and join public chat rooms
- ✅ **Private Rooms** - Create password-protected rooms with custom passphrases
- ✅ **One-to-One Messaging** - Direct private conversations between users via name/email search
- ✅ **Message Persistence** - All messages saved to MongoDB for chat history
- ✅ **Media Sharing** - Send and receive images and files
- ✅ **Message Management** - Edit, unsend (delete for me/everyone), and reactions

### Must-Have Features
- ✅ **Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **User Profiles** - Display user information, avatars, and online status
- ✅ **Responsive Design** - Mobile-first responsive UI for all devices
- ✅ **Typing Indicators** - See when other users are typing
- ✅ **Online Status** - Real-time user online/offline status
- ✅ **Room Management** - Create, delete, and leave rooms; admin controls

### Advanced Features
- 🔐 **JWT Token Authentication** - Secure HTTP and WebSocket connections
- 🔒 **Password Protection** - Private rooms with passkey security
- 📁 **File Uploads** - Image and document sharing with Multer
- 💬 **Room Types** - Public, Private with Passkey, and One-to-One
- 👥 **User Search** - Find and message users by username or email
- 🎨 **Modern UI** - Clean, intuitive interface with dark theme support
- 📱 **Mobile Responsive** - Works seamlessly on all screen sizes
- 🔔 **Real-time Notifications** - Toast notifications for important events

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **MongoDB** v5.0+ (either local installation or MongoDB Atlas cloud)
- **Git** for version control

### Verify Versions

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v9.0.0 or higher
```

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chaat-app
```

#### 2. Install Root Dependencies
```bash
npm run install-all
```

This command will:
- Install backend dependencies in `/server`
- Install frontend dependencies in `/client`
- Set up the entire project structure

#### 3. Set Up Environment Variables

**Create `.env` file in the `/server` directory:**

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chat-app
# OR for MongoDB Atlas cloud:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Create `.env.local` file in the `/client` directory:**

```env
# React App API Configuration
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
```

#### 4. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
# Start MongoDB service (Windows):
mongod

# On macOS (if installed via Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get your connection string and add it to `.env` as `MONGODB_URI`
4. Update username and password in the connection string

### Running the Application

#### Start Both Servers (Recommended)
```bash
npm run dev
```

This will start:
- **Backend Server**: http://localhost:5001
- **Frontend Server**: http://localhost:3000

#### Or Run Separately

**Terminal 1 - Start Backend:**
```bash
npm run server
```
Backend runs on `http://localhost:5001`

**Terminal 2 - Start Frontend:**
```bash
npm run client
```
Frontend runs on `http://localhost:3000`

### Accessing the Application

1. Open your browser and navigate to: http://localhost:3000
2. Create a new account or login with existing credentials
3. Start chatting!

## 📁 Project Structure

```
realtime-chaat-app/
├── server/                    # Node.js + Express backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Business logic
│   │   ├── authController.js      # Authentication logic
│   │   ├── chatController.js      # Chat operations
│   │   └── userController.js      # User operations
│   ├── middleware/           # Express middleware
│   │   └── auth.js               # JWT authentication
│   ├── models/               # Mongoose schemas
│   │   ├── User.js               # User model
│   │   ├── ChatRoom.js           # Room model
│   │   └── Message.js            # Message model
│   ├── routes/               # API route definitions
│   │   ├── auth.js               # Authentication routes
│   │   ├── chat.js               # Chat routes
│   │   └── user.js               # User routes
│   ├── uploads/              # Media uploads directory
│   ├── server.js             # Main server entry point
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Example environment variables
│
├── client/                    # React frontend
│   ├── public/               # Static files
│   │   └── index.html            # HTML entry point with favicon
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── ChatWindow.js         # Message display area
│   │   │   ├── RoomCreator.js        # Create room UI
│   │   │   ├── RoomList.js           # Room list display
│   │   │   ├── UserSearch.js         # User search component
│   │   │   ├── UserProfile.js        # User profile display
│   │   │   ├── PasskeyModal.js       # Private room passkey input
│   │   │   └── DirectChatModal.js    # Direct chat modal
│   │   ├── context/          # React Context for state management
│   │   │   ├── AuthContext.js        # Authentication state
│   │   │   └── ChatContext.js        # Chat and messaging state
│   │   ├── pages/            # Page components
│   │   │   ├── LoginPage.js          # Login page
│   │   │   ├── RegisterPage.js       # Registration page
│   │   │   └── ChatPage.js           # Main chat interface
│   │   ├── styles/           # CSS stylesheets
│   │   │   ├── Auth.css              # Authentication pages styling
│   │   │   ├── ChatPage.css          # Chat interface styling
│   │   │   ├── ChatWindow.css        # Message display styling
│   │   │   └── RoomList.css          # Room list styling
│   │   ├── utils/            # Utility functions
│   │   │   └── api.js               # Axios API client
│   │   ├── App.js            # Main App component
│   │   ├── App.css           # Global App styling
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json          # Frontend dependencies
│   └── .env.local.example    # Example env variables
│
├── package.json              # Root package.json with scripts
├── README.md                 # This file
├── DEPLOYMENT.md             # Deployment guide
└── GETTING_STARTED.md        # Quick start guide
```

## 🔌 API Endpoints

### Authentication Routes (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

### Chat Routes (`/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rooms` | Create new room |
| GET | `/rooms` | Get all public/private rooms |
| GET | `/my-rooms` | Get user's rooms |
| POST | `/rooms/:roomId/join` | Join a room |
| POST | `/rooms/:roomId/leave` | Leave a room |
| DELETE | `/rooms/:roomId` | Delete room (admin only) |
| GET | `/rooms/search/public?query=` | Search public rooms |
| POST | `/direct/:otherUserId` | Create/get one-to-one chat |
| POST | `/messages` | Send message |
| PUT | `/messages/:messageId` | Edit message |
| DELETE | `/messages/:messageId` | Delete message |
| POST | `/reactions/:messageId` | Add reaction to message |
| POST | `/upload` | Upload media file |

### User Routes (`/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/search?q=` | Search users by name/email |
| GET | `/user/profile` | Get current user profile |
| PUT | `/user/profile` | Update user profile |

## 🔒 Authentication Flow

1. **Registration**: User creates account with email and password
   - Password hashed with bcryptjs
   - User data stored in MongoDB
   - JWT token generated and returned

2. **Login**: User authenticates with email and password
   - Password verified against stored hash
   - JWT token issued with 7-day expiration
   - Token stored in localStorage

3. **WebSocket Connection**: Socket.io connection authenticated with JWT
   - Token validated on connection
   - User ID extracted and used for real-time updates

4. **Protected Routes**: All API endpoints require valid JWT token
   - Token verified via middleware
   - User ID extracted from token payload

## 📝 User Guide

### Creating an Account
1. Navigate to http://localhost:3000
2. Click "Register"
3. Enter username, email, and password
4. Click "Register"

### Logging In
1. Enter your email and password
2. Click "Login"
3. You're redirected to the chat interface

### Creating a Room
1. Click the ➕ button in the sidebar
2. Choose room type:
   - **Public**: Anyone can find and join
   - **Private with Passkey**: Share passkey with approved users
3. Enter room name and description
4. For private rooms, generate or enter a passkey
5. Click "Create Room"

### Joining a Room
1. In the sidebar, click Browse Rooms (🔍)
2. Search for public or private rooms
3. For public rooms: Click "Join"
4. For private rooms: Enter passkey in the modal and click "Join"

### Sending Messages
1. Select a room or conversation
2. Type your message in the input field
3. Press Enter or click Send
4. Messages appear in real-time

### Sharing Media
1. In the message area, click the attachment button
2. Select an image or file
3. It uploads and displays in the chat

### Direct Messaging
1. Click the ✉️ button in the sidebar
2. Search for a user by username or email
3. Click on the user to start a conversation
4. One-to-one chat opens automatically

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (Windows)
mongod

# Check connection in backend logs
# Should see: ✓ MongoDB connected
```

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Errors
- Ensure both backend and frontend are running
- Check CORS configuration in `.env`
- Verify Socket.io URLs in `.env.local`

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Regenerate JWT_SECRET in `.env`
- Ensure tokens haven't expired

### File Upload Issues
- Check `/server/uploads/` directory exists and is writable
- Verify `MAX_FILE_SIZE` in `.env` (default: 10MB)
- Check file permissions

## 🚀 Deployment

For deployment to production, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deployment Checklist
- [ ] Create production MongoDB instance
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS_ORIGIN for production domain
- [ ] Generate strong JWT_SECRET
- [ ] Configure email service (optional)
- [ ] Set up HTTPS/SSL certificates
- [ ] Deploy to Heroku, AWS, DigitalOcean, or similar

## 📦 Building for Production

```bash
# Build frontend
cd client
npm run build

# Build backend (no additional build needed)
cd ../server
npm install --production
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer Information

### System Requirements
- **OS**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 500MB free space
- **Internet**: Required for MongoDB Atlas (optional)

### Development Tools Used
- VS Code (Recommended IDE)
- Postman (API Testing)
- MongoDB Compass (Database Management)
- Git & GitHub (Version Control)

## 📢 Real-World Relevance

This application is inspired by and serves as a foundation similar to:
- **Slack** - Team communication and channels
- **WhatsApp** - One-to-one and group messaging
- **Microsoft Teams** - Enterprise chat and collaboration

It demonstrates real-world concepts used in production systems including:
- WebSocket communication
- JWT authentication
- Message persistence
- File uploads
- Real-time notifications
- User presence tracking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ❓ FAQ

**Q: Can I use this with MongoDB Atlas?**
A: Yes! Replace the local MongoDB URI with your Atlas connection string.

**Q: How do I add more users?**
A: Users register through the registration page.

**Q: Can I modify the theme colors?**
A: Yes! Edit CSS variables in `client/src/index.css`

**Q: How long are messages stored?**
A: Messages are stored indefinitely in MongoDB.

**Q: Can I export chat history?**
A: Not currently, but can be added as a feature.

## 📧 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Email: support@example.com
- Check GETTING_STARTED.md for additional help

---

**Last Updated**: April 8, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

### WebSocket Connection Failed
```
WebSocket connection failed
```
**Solution**: Check if backend server is running and `REACT_APP_API_URL` is correct

### npm install issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📚 Dependencies

### Backend (server/package.json)
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| socket.io | ^4.6.1 | WebSocket library |
| mongoose | ^7.0.3 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.0 | JWT tokens |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^16.0.3 | Environment variables |
| multer | ^1.4.5-lts.1 | File upload handling |
| nodemon | ^2.0.20 | Dev auto-reload |

### Frontend (client/package.json)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-router-dom | ^6.11.0 | Routing |
| socket.io-client | ^4.6.1 | WebSocket client |
| axios | ^1.4.0 | HTTP client |
| react-hot-toast | ^2.4.0 | Toast notifications |
| react-icons | ^4.8.0 | Icon library |
| date-fns | ^2.30.0 | Date formatting |

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

GLN Varaprasad



## 🔗 Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT Guide](https://jwt.io/introduction)

## ✨ Future Enhancements


- Voice/video call integration
- Message search and filtering
- User blocking functionality
- Server-side message encryption
- Admin panel for room management
- Rate limiting and throttling
- User ban/mute functionality
- Advanced notification system
- Analytics and reporting

---

**Last Updated**: April 2026
**Version**: 1.0.0
