# Designia Frontend - React Marketplace

A modern, high-performance marketplace frontend built with **React 19**, **TypeScript**, and **Vite**. This application features a modular architecture, real-time capabilities, and a comprehensive seller dashboard with Stripe Connect integration.

## 🏗 Architecture

The project follows a **Feature-Based Architecture** (inspired by Feature-Sliced Design) to ensure scalability and maintainability.

```
src/
├── app/                # App-wide setup (Router, Providers, Layouts)
├── features/           # Business logic grouped by domain
│   ├── auth/           # Authentication, User Profile, Security
│   ├── cart/           # Shopping Cart logic & state
│   ├── chat/           # Real-time messaging (WebSockets)
│   ├── checkout/       # Stripe Checkout integration
│   ├── orders/         # Order management & history
│   ├── products/       # Product browsing, details, reviews
│   └── seller/         # Seller dashboard, analytics, onboarding
├── shared/             # Reusable UI components & utilities
│   ├── api/            # Axios instance & interceptors
│   ├── components/     # UI Kit (Shadcn/Radix), Layouts
│   ├── hooks/          # Shared hooks (useDebounce, etc.)
│   ├── lib/            # External library configs (Stripe, utils)
│   └── utils/          # Helper functions
└── test/               # Test setup & mocks
```

### Key Technologies

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, Radix UI, Shadcn UI, Lucide Icons
- **State Management**: Zustand (Global state), TanStack Query (Server state)
- **Forms**: React Hook Form + Zod
- **Real-time**: Native WebSockets (Chat, Notifications)
- **Payments**: Stripe Connect & Embedded Checkout
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Designia Backend running (default: `http://localhost:8000`)

### 1. Installation

```bash
cd Desginia-frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**Required Variables:**

```env
# Backend API
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000

# Third-Party Keys
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Development Server

Start the Vite development server:

```bash
npm run dev
```

- **App**: http://localhost:5174 (Note: configured to 5174 to avoid conflict with backend)
- **Bundle Visualizer**: Generates `bundle-report.html` on build

## 💎 Key Features

### 🛍️ Marketplace

- **Smart Search**: Debounced search with autocomplete.
- **Advanced Filtering**: Price, Category, Condition, Rating (URL-synced).
- **Infinite Scroll**: High-performance product lists.
- **AR Preview**: Support for 3D/AR model viewing (GLB/GLTF).

### 🏪 Seller Dashboard

- **Stripe Connect**: Automated onboarding and identity verification.
- **Product Management**: CRUD operations with image & AR model uploads.
- **Order Fulfillment**: Order tracking, shipping updates, and cancellation handling.
- **Analytics**: Revenue charts, conversion rates, and sales metrics.

### 💬 Real-time Chat

- **WebSocket Integration**: Instant messaging between buyers and sellers.
- **Features**: Typing indicators, read receipts, and image sharing.
- **Inbox**: Organized thread list with unread counts.

### 🔒 Security & Auth

- **JWT Auth**: Access/Refresh token rotation with automatic interceptors.
- **2FA**: Two-factor authentication support via email.
- **Role-Based Access**: Protected routes for Sellers/Admins.

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
# Run tests
npm run test

# Run with UI
npm run test:ui
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui
```

## 🧹 Linting & Formatting

The project uses ESLint and Prettier.

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📦 Build for Production

```bash
npm run build
npm run preview
```
