# PawPair

A React Native mobile app built with Expo and TypeScript for connecting potential pet adopters with shelter animals. PawPair makes pet adoption easier by helping users discover, visit, and connect with shelter pets that match their lifestyle.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Server Architecture Plan](#server-architecture-plan)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (macOS) or Android Studio (for testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pawpair
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory:
   ```bash
   # Supabase (currently configured)
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=mock://
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

   This will start the Expo development server. You can then:
   - Press `w` to open in web browser
   - Press `i` to open in iOS Simulator (macOS only)
   - Press `a` to open in Android Emulator
   - Scan the QR code with Expo Go app on your physical device

---

## Switching from Mock to Production API

Currently, the app uses mock data for development. To switch to a real backend:

### 1. Update Environment Variable

In `.env`, change:
```bash
# Development (mock data)
EXPO_PUBLIC_API_BASE_URL=mock://

# Production (real API)
EXPO_PUBLIC_API_BASE_URL=https://api.pawpair.app
```

### 2. Update Service Layer

The service files in `/services` are already structured for easy API switching:

```typescript
// services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// If using mock mode
if (API_BASE_URL === 'mock://') {
  return mockData;
}

// Otherwise, make real API calls
const response = await fetch(`${API_BASE_URL}/pets/recommended`);
```

### 3. Deploy Backend

Follow the [Server Architecture Plan](#server-architecture-plan) below to deploy your Express backend on AWS.

### 4. Update Endpoints

All API endpoints are documented in `API_DOCUMENTATION.md`. Ensure your backend implements these exact response structures for type compatibility.

---

## Project Structure

```
├── app/                      # File-based routing (Expo Router)
│   ├── _layout.tsx          # Root layout with navigation
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── home.tsx         # Pet matches
│   │   ├── saved-pets.tsx   # Saved favorites
│   │   ├── my-visits.tsx    # Visit bookings
│   │   ├── inbox.tsx        # Messages
│   │   └── profile.tsx      # User profile
│   ├── auth-choice.tsx      # Auth selection
│   ├── sign-in.tsx          # Sign in screen
│   ├── sign-up.tsx          # Sign up screen
│   ├── onboarding.tsx       # App onboarding
│   ├── profile-setup-*.tsx  # Profile creation flow
│   ├── pet-detail.tsx       # Pet details
│   ├── booking-*.tsx        # Booking flow
│   ├── chat-thread.tsx      # Messaging
│   ├── post-visit-feedback.tsx  # Feedback form
│   ├── rewards.tsx          # Rewards & badges
│   ├── shelter-map.tsx      # Shelter locations
│   └── about.tsx            # About & help
│
├── components/              # Reusable UI components
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── CalendarPicker.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx       # Empty/error states
│   ├── FilterModal.tsx
│   ├── ImageCarousel.tsx
│   ├── ListItem.tsx
│   ├── OfflineBanner.tsx    # Offline indicator
│   ├── OnboardingCarousel.tsx
│   ├── PermissionExplainer.tsx
│   ├── PetCard.tsx
│   ├── RatingStars.tsx
│   ├── Tag.tsx
│   ├── TimeSlotPicker.tsx
│   └── Toast.tsx
│
├── services/                # API service layer
│   ├── api.ts              # Base API client
│   ├── auth.ts             # Authentication
│   ├── booking.ts          # Booking management
│   ├── feedback.ts         # Feedback submission
│   ├── messages.ts         # Messaging
│   ├── pets.ts             # Pet data
│   ├── profile.ts          # User profiles
│   ├── rewards.ts          # Rewards system
│   ├── shelters.ts         # Shelter information
│   └── supabase.ts         # Supabase client
│
├── store/                   # Global state management
│   └── useStore.ts         # Zustand store
│
├── constants/               # App-wide constants
│   └── theme.ts            # Design system
│
├── types/                   # TypeScript definitions
│   ├── env.d.ts            # Environment variables
│   └── index.ts            # App types
│
├── assets/                  # Static assets
│   └── images/
│
└── API_DOCUMENTATION.md     # Complete API spec
```

---

## Design System

### Color Palette

```typescript
colors = {
  primary: '#FF8A3D',        // Orange
  primaryLight: '#FFB84D',
  primaryDark: '#E67829',

  text: '#1A1A1A',           // Dark gray
  textSecondary: '#666666',

  surface: '#FFFFFF',        // White
  background: '#F5F5F5',     // Light gray
  border: '#E5E5E5',

  success: '#10B981',        // Green
  error: '#EF4444',          // Red
  warning: '#F59E0B',        // Amber
  info: '#3B82F6',           // Blue
}
```

### Typography

```typescript
typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
}
```

### Spacing

```typescript
spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

---

## State Management

The app uses **Zustand** for lightweight, performant state management:

```typescript
// Key state slices:
{
  user: User | null,                    // Current user
  profile: Profile | null,              // User profile & preferences
  favoritePetIds: string[],            // Saved pet IDs
  matches: Pet[],                      // Pet match results
  bookings: Booking[],                 // User bookings
  rewards: Reward | null,              // Rewards & badges
  shelterList: Shelter[],              // Available shelters

  // Actions:
  setUser(user),
  setProfile(profile),
  toggleFavorite(petId),
  addMatch(pet),
  // ... etc
}
```

Access state in any component:

```typescript
import { useStore } from '@/store/useStore';

const user = useStore((state) => state.user);
const toggleFavorite = useStore((state) => state.toggleFavorite);
```

---

## API Integration

### Current Status: Mock Data

All services currently return mock data for development. Each service is structured to easily switch to real API calls.

### Service Pattern

```typescript
// services/pets.ts
export const pets = {
  async recommended(profile: Profile): Promise<Pet[]> {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

    if (baseUrl === 'mock://') {
      // Return mock data
      return mockPets;
    }

    // Real API call
    const response = await fetch(`${baseUrl}/pets/recommended`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }
}
```

### API Documentation

Complete API specifications with request/response shapes are in **`API_DOCUMENTATION.md`**.

Key endpoints:
- `POST /auth/sign-in` - User authentication
- `GET /pets/recommended` - Get matched pets
- `POST /bookings` - Create visit booking
- `POST /feedback` - Submit visit feedback
- `GET /rewards` - Get user rewards

---

## Server Architecture Plan

### Technology Stack

**Backend:**
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15+ on AWS RDS
- **ORM:** Prisma or TypeORM
- **Authentication:** JWT with refresh tokens
- **Validation:** Zod or Joi

**Infrastructure (AWS):**
- **Compute:** Elastic Beanstalk (recommended) or EC2 + Nginx
- **Database:** RDS PostgreSQL (Multi-AZ for production)
- **File Storage:** S3 (pet images, user photos, feedback images)
- **Email:** SES (transactional emails, notifications)
- **Push Notifications:** SNS → FCM/APNS relay (optional)
- **Caching:** ElastiCache Redis (sessions, frequently accessed data)
- **CDN:** CloudFront (for S3 assets)
- **Monitoring:** CloudWatch + CloudWatch Logs

### Deployment Architecture

```
┌─────────────────┐
│   CloudFront    │ (CDN for static assets)
└────────┬────────┘
         │
┌────────▼────────────────────────────────┐
│      Application Load Balancer          │
└────────┬────────────────────────────────┘
         │
┌────────▼────────────────────────────────┐
│   Elastic Beanstalk Environment         │
│   ┌──────────────────────────────────┐  │
│   │  EC2 Instances (Auto-scaling)    │  │
│   │  Node.js + Express + Nginx       │  │
│   └──────────────────────────────────┘  │
└────────┬────────────────────────────────┘
         │
    ┌────▼────┐     ┌──────────┐     ┌─────────┐
    │   RDS   │     │    S3    │     │  Redis  │
    │Postgres │     │ (Images) │     │ (Cache) │
    └─────────┘     └──────────┘     └─────────┘
         │
    ┌────▼────┐
    │   SES   │ (Email)
    └─────────┘
```

### Environment Setup

**Development:**
```bash
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/pawpair_dev
JWT_SECRET=dev-secret-key
AWS_REGION=us-west-2
S3_BUCKET=pawpair-dev-assets
```

**Production:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/pawpair_prod
JWT_SECRET=<secure-random-string>
JWT_REFRESH_SECRET=<secure-random-string>
AWS_REGION=us-west-2
S3_BUCKET=pawpair-prod-assets
REDIS_URL=redis://elasticache-endpoint:6379
```

### Deployment Steps

1. **Set up AWS Infrastructure:**
   ```bash
   # Create RDS PostgreSQL instance
   aws rds create-db-instance --db-instance-identifier pawpair-db \
     --db-instance-class db.t3.micro \
     --engine postgres --allocated-storage 20

   # Create S3 bucket
   aws s3 mb s3://pawpair-assets

   # Create Elastic Beanstalk application
   eb init -p node.js pawpair-api
   eb create pawpair-prod
   ```

2. **Deploy Backend:**
   ```bash
   # Build TypeScript
   npm run build

   # Deploy to Elastic Beanstalk
   eb deploy
   ```

3. **Run Migrations:**
   ```bash
   # SSH into EB instance or run as post-deploy hook
   npm run migrate:prod
   ```

4. **Update Mobile App:**
   ```bash
   # Update .env
   EXPO_PUBLIC_API_BASE_URL=https://api.pawpair.app

   # Rebuild and deploy mobile app
   ```

---

## Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │
│ email (unique)  │
│ password_hash   │
│ name            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1:1
         │
┌────────▼────────┐
│    Profiles     │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ bio             │
│ photo_url       │
│ phone           │
│ verified_id     │
│ bg_check_status │
│ bg_check_date   │
│ lifestyle (JSON)│
│ preferences     │
│ address (JSON)  │
│ emergency_contact│
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│    Shelters     │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ phone           │
│ address         │
│ city            │
│ state           │
│ zip_code        │
│ location (point)│
│ hours           │
│ website         │
│ description     │
│ verified        │
│ created_at      │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐       ┌──────────────┐
│      Pets       │       │   Bookings   │
│─────────────────│       │──────────────│
│ id (PK)         │◄──┐   │ id (PK)      │
│ shelter_id (FK) │   │   │ user_id (FK) │
│ name            │   └───┤ pet_id (FK)  │
│ species         │       │ shelter_id   │
│ breed           │       │ date         │
│ age             │       │ time_slot    │
│ sex             │       │ status       │
│ size            │       │ confirmation │
│ weight          │       │ notes        │
│ description     │       │ created_at   │
│ temperament []  │       │ updated_at   │
│ medical_history │       └──────┬───────┘
│ house_trained   │              │ 1:N
│ good_with_kids  │              │
│ good_with_dogs  │       ┌──────▼───────┐
│ good_with_cats  │       │   Feedback   │
│ adoption_fee    │       │──────────────│
│ available       │       │ id (PK)      │
│ images []       │       │ booking_id   │
│ video_url       │       │ user_id (FK) │
│ created_at      │       │ pet_id (FK)  │
│ updated_at      │       │ shelter_id   │
└─────────────────┘       │ ratings      │
                          │ pet_behavior │
         ┌────────────────┤ recommend    │
         │                │ comments     │
         │                │ photos []    │
┌────────▼────────┐       │ helpful      │
│    Favorites    │       │ created_at   │
│─────────────────│       └──────────────┘
│ user_id (FK)    │
│ pet_id (FK)     │       ┌──────────────┐
│ created_at      │       │RewardsLedger │
└─────────────────┘       │──────────────│
   (composite PK)         │ id (PK)      │
                          │ user_id (FK) │
                          │ type         │
                          │ points       │
                          │ description  │
┌─────────────────┐       │ reference_id │
│    Threads      │       │ created_at   │
│─────────────────│       └──────────────┘
│ id (PK)         │
│ user_id (FK)    │       ┌──────────────┐
│ shelter_id (FK) │       │    Badges    │
│ pet_id (FK)     │       │──────────────│
│ created_at      │       │ id (PK)      │
└────────┬────────┘       │ user_id (FK) │
         │ 1:N            │ badge_type   │
         │                │ name         │
┌────────▼────────┐       │ earned_at    │
│    Messages     │       └──────────────┘
│─────────────────│
│ id (PK)         │       ┌──────────────┐
│ thread_id (FK)  │       │ AuditLogs    │
│ sender_id       │       │──────────────│
│ sender_type     │       │ id (PK)      │
│ text            │       │ user_id      │
│ read            │       │ action       │
│ created_at      │       │ resource_type│
└─────────────────┘       │ resource_id  │
                          │ ip_address   │
                          │ user_agent   │
                          │ created_at   │
                          └──────────────┘
```

### Key Tables

**Users**
- Core authentication table
- Stores email, password hash, basic info

**Profiles**
- Extended user information
- Lifestyle preferences (housing, pets, children)
- Adoption preferences (species, size, age)
- Address and emergency contact
- Background check status

**Pets**
- Complete pet information
- Temperament tags array
- Compatibility flags (kids, dogs, cats)
- Multiple images array
- Associated with shelter

**Shelters**
- Shelter information and location
- PostGIS point type for geospatial queries
- Hours, contact info, verification status

**Bookings**
- Visit scheduling
- Links user, pet, and shelter
- Status tracking (pending, confirmed, cancelled, completed)

**Feedback**
- Post-visit reviews
- Multiple rating categories (JSON)
- Behavioral observations
- Photos array
- Helpful votes counter

**RewardsLedger**
- Transaction log for points
- Tracks all point-earning activities
- References source (booking, feedback, etc.)

**Badges**
- Achievement tracking
- User-badge associations
- Earned timestamp

**Threads & Messages**
- Messaging between users and shelters
- Thread groups messages by conversation
- Read status tracking

**Favorites**
- Saved pets (many-to-many)
- Composite primary key (user_id, pet_id)

**AuditLogs**
- Security and compliance tracking
- All sensitive actions logged
- IP address and user agent captured

### Indexes

Critical indexes for performance:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_bg_check_status ON profiles(background_check_status);

-- Pets
CREATE INDEX idx_pets_shelter_id ON pets(shelter_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_available ON pets(available_for_adoption);
CREATE INDEX idx_pets_species_size_age ON pets(species, size, age);

-- Shelters
CREATE INDEX idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX idx_shelters_verified ON shelters(verified);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_pet_id ON bookings(pet_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Feedback
CREATE INDEX idx_feedback_pet_id ON feedback(pet_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- RewardsLedger
CREATE INDEX idx_rewards_user_id ON rewards_ledger(user_id);
CREATE INDEX idx_rewards_type ON rewards_ledger(type);

-- Messages
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);

-- Favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_pet_id ON favorites(pet_id);
```

---

## Security

### Authentication & Authorization

**JWT Strategy:**
- Access tokens (15 min expiry)
- Refresh tokens (7 day expiry, stored in httpOnly cookies)
- Token rotation on refresh
- Blacklist for revoked tokens (Redis)

**Password Security:**
- bcrypt with salt rounds = 12
- Minimum 8 characters, complexity requirements
- Password reset via email with time-limited tokens

**Endpoints:**
```typescript
// Public endpoints (no auth)
POST /auth/sign-up
POST /auth/sign-in
POST /auth/forgot-password
POST /auth/reset-password

// Protected endpoints (JWT required)
GET /profile
PUT /profile
GET /pets/*
POST /bookings
// ... all other endpoints
```

### Background Check Integration

**Provider Webhook:**
```typescript
POST /webhooks/background-check
Headers: {
  'X-Webhook-Signature': 'hmac-sha256-signature'
}

Body: {
  userId: 'uuid',
  checkId: 'check-123',
  status: 'approved' | 'denied' | 'pending',
  completedAt: '2025-10-18T00:00:00Z',
  details: { ... }
}
```

**Verification Flow:**
1. Verify webhook signature (HMAC-SHA256)
2. Update `profiles.background_check_status`
3. Update `profiles.background_check_date`
4. Send notification to user (email + push)
5. Log in audit_logs table

**Supported Providers:**
- Checkr
- Sterling
- GoodHire

### Rate Limiting

**Strategy:** Token bucket algorithm via Redis

**Limits:**
```typescript
// Authentication endpoints
POST /auth/* → 5 requests per 15 minutes per IP

// General API endpoints
* → 100 requests per 15 minutes per user

// Webhook endpoints
POST /webhooks/* → 1000 requests per hour per provider

// Image uploads
POST /upload/* → 10 requests per hour per user
```

**Implementation:**
```typescript
// Express middleware
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many requests, please try again later'
});

app.use('/auth', authLimiter);
```

### Input Validation

**All inputs validated with Zod schemas:**

```typescript
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  name: z.string().min(2).max(100)
});

// In route handler
app.post('/auth/sign-up', async (req, res) => {
  try {
    const data = signUpSchema.parse(req.body);
    // ... proceed with validated data
  } catch (error) {
    return res.status(400).json({ error: error.errors });
  }
});
```

### Audit Logging

**All sensitive actions logged:**
- User authentication (login, logout, failed attempts)
- Profile updates
- Background check submissions
- Booking creation/modification/cancellation
- Admin actions
- Data exports
- Password changes

**Log Structure:**
```typescript
{
  userId: 'uuid',
  action: 'user.login',
  resourceType: 'auth',
  resourceId: 'user-uuid',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2025-10-18T00:00:00Z',
  metadata: { ... }
}
```

**Retention:** 90 days in database, 1 year in S3 cold storage

### Data Protection

**Encryption:**
- TLS 1.3 for all API traffic
- At-rest encryption for RDS (AWS KMS)
- Encrypted S3 buckets (AES-256)
- Sensitive fields encrypted in database (SSN, payment info)

**PII Handling:**
- Minimal collection principle
- User data export on request (GDPR compliance)
- Right to deletion honored within 30 days
- Data anonymization for deleted users (retain analytics)

**CORS Configuration:**
```typescript
const corsOptions = {
  origin: [
    'https://pawpair.app',
    'exp://localhost:8081', // Expo dev
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Monitoring & Alerts

**CloudWatch Alarms:**
- Failed login attempts spike (> 100 in 5 min)
- API error rate > 5%
- Database connection failures
- Unusual data access patterns
- Background check webhook failures

**Log Analysis:**
- Failed authentication attempts
- Privilege escalation attempts
- Unusual API usage patterns
- Geographic anomalies

---

## Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error logging configured
- [ ] API documentation up to date

### CI/CD Pipeline

**GitHub Actions workflow:**

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - name: Deploy to Elastic Beanstalk
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: pawpair-api
          environment_name: pawpair-prod
          version_label: ${{ github.sha }}
          region: us-west-2
```

### Mobile App Deployment

**iOS:**
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android:**
```bash
# Build for Google Play
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for web
npm run build:web

# Run tests (when implemented)
npm test

# Database migrations (backend)
npm run migrate:dev
npm run migrate:prod

# Generate Prisma client (backend)
npx prisma generate

# Seed database (backend)
npm run seed
```

---

## Support

For issues or questions:
- Email: support@pawpair.com
- Documentation: `API_DOCUMENTATION.md`
- Security issues: security@pawpair.com

---

## License

© 2025 PawPair. All rights reserved.
