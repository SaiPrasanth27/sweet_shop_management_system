# 🍬 Sweet Shop Management System (TDD Kata)

A full-stack Sweet Shop Management System built using Test-Driven Development (TDD) principles. This project demonstrates backend API design, authentication, database integration, frontend development, automated testing, and responsible AI usage.

## 📌 Project Overview

The Sweet Shop Management System allows users to:

- **Register and log in securely** using JWT authentication
- **View available sweets** with detailed information
- **Search and filter sweets** by category and name
- **Purchase sweets** (stock decreases automatically)
- **(Admin only)** Add, update, delete, and restock sweets
- **View order history** with purchase details

The system is built following clean coding practices, RESTful API standards, and a Red–Green–Refactor TDD workflow.

## 🧱 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** (with Mongoose v8.0.3) - Database
- **JWT** (jsonwebtoken v9.0.2) - Authentication tokens
- **bcryptjs** (v2.4.3) - Password hashing
- **multer** (v1.4.5-lts.1) - File upload handling
- **express-validator** (v7.0.1) - Input validation
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Helmet** (v7.1.0) - Security middleware
- **express-rate-limit** (v7.1.5) - Rate limiting
- **dotenv** (v16.3.1) - Environment variables

### Frontend
- **React.js** (v19.2.3) - UI framework
- **React Router DOM** (v7.10.1) - Client-side routing
- **Axios** (v1.13.2) - HTTP client for API calls
- **React Scripts** (v5.0.1) - Build tooling
- **Web Vitals** (v2.1.4) - Performance monitoring

### Testing
- **Jest** (v29.7.0) - Testing framework
- **Supertest** (v6.3.3) - HTTP testing
- **MongoDB Memory Server** (v9.1.3) - In-memory database for testing
- **React Testing Library** - Frontend component testing
- **@testing-library/jest-dom** (v6.9.1) - Custom Jest matchers

### Development Tools
- **nodemon** (v3.0.2) - Auto-restart development server
- **concurrently** (v8.2.2) - Run multiple commands simultaneously
- **Git & GitHub** - Version control
- **npm** - Package management
- **ESLint** (via React Scripts) - Code linting

## 🧪 Test-Driven Development (TDD)

This project strictly follows TDD principles:

### 🔴 Red Phase
- Wrote failing tests before implementation
- Covered:
  - Authentication (register/login)
  - Sweet CRUD APIs
  - Authorization (admin vs customer)
  - Search & filter logic
  - Inventory actions (purchase, restock)
- Tests initially failed due to missing routes, auth guards, or logic

### 🟢 Green Phase
- Implemented minimum code to pass tests
- Ensured:
  - Correct HTTP status codes
  - JWT-based authorization
  - Role-based access control
  - Proper schema validation

### 🔁 Refactor Phase
- Cleaned route logic
- Removed duplication
- Improved readability
- Maintained passing tests throughout

## ✅ Test Suites & Coverage

### Test Suites Implemented

| Test File | Purpose |
|-----------|---------|
| `auth.test.js` | User registration & login |
| `sweet.model.test.js` | Sweet schema validation |
| `sweet.test.js` | Sweet CRUD APIs |
| `sweet.category.test.js` | Filtering & searching |
| `user.model.test.js` | User schema validation |
| `orders.test.js` | Order creation & lifecycle |

### Test Results
✅ **All test suites passing**  
✅ **Authentication & authorization validated**  
✅ **Admin vs customer access enforced**  
✅ **Database operations verified**  
✅ **Edge cases covered**

Example test output:
```
Test Suites: 6 passed, 6 total
Tests:       54 passed, 54 total
Time:        ~6s
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Sweets (Protected)
- `POST /api/Sweet` (Admin) - Create sweet
- `GET /api/Sweet` - Get all sweets
- `GET /api/Sweet?search=` - Search sweets
- `PUT /api/Sweet/:id` (Admin) - Update sweet
- `DELETE /api/Sweet/:id` (Admin) - Delete sweet

### Inventory
- `POST /api/Sweet/:id/purchase` - Purchase sweet
- `POST /api/Sweet/:id/restock` (Admin) - Restock sweet

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order

## 🎨 Frontend Features

- **Login & Registration forms** with validation
- **Sweet listing dashboard** with grid layout
- **Search & filter functionality** by category
- **Purchase modal** with quantity selection
- **Admin panel** for CRUD operations
- **Order history page** with detailed information
- **Responsive design** for mobile & desktop
- **Real-time stock updates** after purchases

## 🤖 AI Usage

### AI Tools Used
- **Kiro IDE** - AI-powered development environment and primary assistant
- **Claude (Anthropic)** - Code analysis, debugging, and architectural guidance

### How AI Was Used
- Generating initial test case structures
- Debugging failing Jest & Supertest cases
- Reasoning through JWT authorization issues
- Fixing edge cases like:
  - 401 vs 403 authorization mismatches
  - Middleware execution order
  - Multipart form uploads with authentication
  - Database persistence issues
- Structuring commit-wise TDD workflow
- Drafting professional documentation (README)

### Reflection
AI significantly improved development speed, especially during:
- Complex test failures
- Middleware debugging
- TDD iteration cycles
- Database configuration issues

However, all logic decisions, architecture, and fixes were manually reasoned and implemented. AI was used as a developer assistant, not as a code copier.

## 🧪 Test Report

Tests executed using `npm test`
- Backend tests run in isolation with MongoDB Memory Server
- Frontend manually tested via browser
- All authentication flows verified
- CRUD operations tested with proper authorization
- Edge cases and error handling covered

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher) - Required for React 19
- **npm** - Package manager
- **MongoDB** (optional - uses persistent local DB by default)

### Quick Start (Recommended)
```bash
# Install all dependencies
npm run install-all

# Start both backend and frontend concurrently
npm run dev
```

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm test          # Run all tests
npm run test:coverage  # Run tests with coverage
npm run dev       # Start development server (port 5004)
```

#### Frontend Setup
```bash
cd frontend/frontend
npm install
npm start         # Start React development server (port 3001)
npm test          # Run frontend tests
```

### Individual Commands
```bash
# Backend only
npm run server

# Frontend only  
npm run client

# Run backend tests
npm test

# Watch mode for tests
npm run test:watch
```

### Default Credentials
After seeding the database:
- **Admin**: admin@sweetshop.com / admin123
- **Customer**: customer@example.com / password123

### Environment Variables
The backend includes a `.env` file with the following configuration:
```env
USE_IN_MEMORY_DB=false                    # Use persistent database
MONGODB_URI=mongodb://localhost:27017/sweetshop  # Database connection
JWT_SECRET=<secure-random-key>            # JWT signing secret
JWT_EXPIRES_IN=7d                         # Token expiration
PORT=5004                                 # Backend server port
NODE_ENV=development                      # Environment mode
FRONTEND_URL=http://localhost:3001        # CORS allowed origin
```

**Note**: The project uses a persistent local MongoDB database by default. If MongoDB is not installed, it will automatically fall back to an in-memory database.

## 📁 Project Structure

```
sweet-shop-management/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middlewares/       # Auth & validation middleware
│   │   ├── models/            # Mongoose schemas (User, Sweet, Order)
│   │   └── routes/            # API endpoints (auth, Sweet, orders)
│   ├── tests/                 # Jest test suites
│   ├── uploads/               # Image storage directory
│   ├── .env                   # Environment variables
│   └── package.json           # Backend dependencies
├── frontend/
│   └── frontend/              # React application
│       ├── public/            # Static assets
│       ├── src/
│       │   ├── components/    # Reusable React components
│       │   │   ├── Auth/      # Login/Register components
│       │   │   ├── Layout/    # Header, navigation
│       │   │   └── Sweet/     # Sweet-related components
│       │   ├── pages/         # Page components (Home, Orders, Admin)
│       │   ├── services/      # API service layers
│       │   ├── context/       # React context (Auth, Cart)
│       │   └── utils/         # Utility functions
│       └── package.json       # Frontend dependencies
├── data/                      # Local database storage
├── node_modules/              # Root dependencies
├── package.json               # Root package with scripts
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

## 🌟 Key Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin/Customer)
- Protected routes and API endpoints
- Password hashing with bcrypt

### Sweet Management
- Full CRUD operations for sweets
- Image upload functionality
- Category-based organization
- Stock management with automatic updates

### Order System
- Purchase functionality with stock validation
- Order history tracking
- Order status management
- Detailed order information

### Search & Filter
- Text-based search across sweet names and descriptions
- Category filtering
- Real-time results

## 🧾 Conclusion

This project demonstrates:
- **Strong understanding of TDD** with comprehensive test coverage
- **Secure authentication & authorization** using industry standards
- **Clean REST API design** following best practices
- **Practical AI-assisted development** with responsible usage
- **Real-world backend & frontend integrations**
- **Professional code organization** and documentation

The Sweet Shop Management System serves as an excellent example of modern full-stack development practices, combining robust backend architecture with an intuitive frontend experience.

---

**Built using Test-Driven Development**