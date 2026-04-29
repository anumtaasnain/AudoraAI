# Audora AI — Backend Documentation

> This document describes the full backend requirements derived from a complete analysis of the Audora AI frontend codebase. It serves as the engineering specification for building the backend from scratch.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Recommendations](#2-tech-stack-recommendations)
3. [Application Architecture](#3-application-architecture)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Business Logic & AI Scoring](#6-business-logic--ai-scoring)
7. [Data Models (TypeScript-aligned)](#7-data-models-typescript-aligned)
8. [Environment Variables](#8-environment-variables)
9. [Security Considerations](#9-security-considerations)
10. [Deployment Notes](#10-deployment-notes)

---

## 1. Project Overview

**Audora AI** is an AI-powered event audience intelligence platform. Its core purpose is to:

- Allow attendees to **register** with professional profile data.
- Use **AI/ML scoring** to assign each attendee a **relevance score (0–100)** indicating how well-matched they are for a given event.
- Give **event organizers** a dashboard to monitor audience quality, engagement predictions, and audience segmentation.
- Give **sponsors** a lead dashboard with match scores, conversion probability predictions, and contact details for high-quality leads.

### Application Routes (from frontend)

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Marketing page with features, benefits, CTA |
| `/register` | Registration Page | Attendee profile registration form |
| `/dashboard` | Dashboard | Overview stats, charts, recent activity |
| `/dashboard/attendees` | Attendees Page | List & filter attendees by relevance score |
| `/dashboard/analytics` | Analytics Page | Engagement, ROI, segmentation, funnel charts |
| `/dashboard/sponsors` | Sponsor Page | AI-recommended leads + conversion metrics |

### User Roles

| Role | Description |
|---|---|
| **Attendee** | Registers on the platform; receives event recommendations |
| **Event Organizer** | Manages events, views audience quality metrics |
| **Sponsor** | Views AI-recommended leads and conversion data |
| **Admin** | Full system access (user management, settings) |

---

## 2. Tech Stack Recommendations

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v20+) with TypeScript |
| **Framework** | Express.js or Fastify |
| **Database** | PostgreSQL (primary relational store) |
| **ORM** | Prisma or Drizzle ORM |
| **Auth** | JWT (access + refresh tokens) + bcrypt password hashing |
| **AI Scoring** | Python microservice (FastAPI) or OpenAI/Gemini API integration |
| **Cache** | Redis (session store, rate limiting, leaderboard caching) |
| **File Storage** | AWS S3 / Cloudflare R2 (profile photos) |
| **Email** | Resend / SendGrid (registration confirmation, lead outreach) |
| **Queue** | BullMQ (async AI scoring jobs after registration) |
| **Validation** | Zod |
| **Testing** | Jest + Supertest |

---

## 3. Application Architecture

```
+----------------------------------------+
|          Frontend (React + Vite)       |
|  Landing / Register / Dashboard        |
+----------------+-----------------------+
                 | HTTPS
+----------------v-----------------------+
|         API Gateway / Reverse Proxy    |
|         (Nginx / Traefik)             |
+----------------+-----------------------+
                 |
+----------------v-----------------------+
|       Node.js REST API Server          |
|   /api/v1/auth                         |
|   /api/v1/users                        |
|   /api/v1/attendees                    |
|   /api/v1/analytics                    |
|   /api/v1/sponsors                     |
|   /api/v1/events                       |
|   /api/v1/dashboard                    |
+----+-----------------+-----------------+
     |                 |
+----v----+      +-----v------+
|PostgreSQL|     |   Redis     |
|(Primary) |     |  (Cache)    |
+----------+     +------------+
     |
+----v------------------+
|  AI Scoring Service   |
|  (Python / FastAPI)   |
|  or LLM API calls     |
+-----------------------+
```

---

## 4. Database Schema

### 4.1 `users` table

Stores all platform users (attendees, organizers, sponsors, admins).

```sql
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(50)   NOT NULL DEFAULT 'attendee',
  -- role: 'attendee' | 'organizer' | 'sponsor' | 'admin'
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.2 `attendee_profiles` table

Stores detailed professional profile for registered attendees. One-to-one with `users`.
Derived directly from the `RegistrationFormData` type in `RegistrationPage.tsx`.

```sql
CREATE TABLE attendee_profiles (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Personal Info
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NOT NULL,
  phone           VARCHAR(30),

  -- Professional Info
  company         VARCHAR(255),
  job_title       VARCHAR(255),
  industry        VARCHAR(100),
  -- Allowed values: 'technology' | 'software' | 'cloud' | 'analytics'
  --                 | 'marketing' | 'sales' | 'finance' | 'healthcare' | 'other'
  company_size    VARCHAR(20),
  -- Allowed values: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

  -- Event Preferences
  event_interest  VARCHAR(100),
  -- Allowed values: 'ai-ml' | 'cloud' | 'devops' | 'data' | 'security'
  --                 | 'product' | 'leadership' | 'startup'
  hear_about_us   VARCHAR(100),
  -- Allowed values: 'search' | 'social' | 'referral' | 'event' | 'advertisement' | 'other'

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.3 `events` table

Stores events that attendees register for.

```sql
CREATE TABLE events (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id    UUID          NOT NULL REFERENCES users(id),
  title           VARCHAR(255)  NOT NULL,
  description     TEXT,
  event_type      VARCHAR(100),
  -- Aligned with event_interest categories from registration
  location        VARCHAR(255),
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.4 `event_registrations` table

Join table linking attendees to events. Stores AI-computed relevance score.
Derived from the `Attendee` type in `AttendeesPage.tsx`.

```sql
CREATE TABLE event_registrations (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID          NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- AI Scoring
  relevance_score   INTEGER       CHECK (relevance_score BETWEEN 0 AND 100),
  relevance_status  VARCHAR(20),
  -- Derived from score: 'high' (>=80), 'moderate' (60-79), 'low' (<60)
  scoring_version   VARCHAR(20)   DEFAULT 'v1',

  -- Engagement Tracking
  engagement_score  DECIMAL(5,2)  DEFAULT 0,
  is_qualified_lead BOOLEAN       DEFAULT FALSE,
  is_converted      BOOLEAN       DEFAULT FALSE,

  registered_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);
```

**Relevance Status Logic (application layer):**
```
score >= 80  -->  'high'
score 60-79  -->  'moderate'
score < 60   -->  'low'
```

---

### 4.5 `sponsor_profiles` table

Extended profile for sponsor users.

```sql
CREATE TABLE sponsor_profiles (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name      VARCHAR(255),
  contact_name      VARCHAR(255),
  phone             VARCHAR(30),
  target_industries TEXT[],
  -- e.g. ARRAY['technology', 'software', 'cloud']
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.6 `sponsor_leads` table

Tracks leads shown to sponsors with AI-computed match and conversion scores.
Derived from the `recommendedLeads` data structure in `SponsorPage.tsx`.

```sql
CREATE TABLE sponsor_leads (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id              UUID          NOT NULL REFERENCES users(id),
  attendee_id             UUID          NOT NULL REFERENCES users(id),
  event_id                UUID          NOT NULL REFERENCES events(id),

  -- AI-Computed Scores
  match_score             INTEGER       CHECK (match_score BETWEEN 0 AND 100),
  conversion_probability  INTEGER       CHECK (conversion_probability BETWEEN 0 AND 100),
  estimated_value_min     INTEGER,      -- in USD
  estimated_value_max     INTEGER,      -- in USD

  -- Lead Classification
  lead_quality            VARCHAR(20),
  -- 'hot' (matchScore >= 85), 'warm' (60-84), 'cold' (< 60)
  previous_engagement     VARCHAR(20),
  -- 'High' | 'Medium' | 'Low'

  -- Status
  status                  VARCHAR(30)   NOT NULL DEFAULT 'new',
  -- 'new' | 'viewed' | 'contacted' | 'converted' | 'rejected'

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(sponsor_id, attendee_id, event_id)
);
```

---

### 4.7 `lead_interests` table

Interest tags associated with a sponsor lead (from `SponsorPage.tsx` `interests` array).

```sql
CREATE TABLE lead_interests (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID          NOT NULL REFERENCES sponsor_leads(id) ON DELETE CASCADE,
  interest    VARCHAR(100)  NOT NULL
  -- e.g. 'AI', 'Cloud Infrastructure', 'DevOps', 'Data Analytics'
);
```

---

### 4.8 `engagement_metrics` table

Monthly engagement snapshots per event. Powers the line charts in `DashboardPage.tsx` and `AnalyticsPage.tsx`.

```sql
CREATE TABLE engagement_metrics (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID          NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  month           DATE          NOT NULL,       -- First day of the month
  engagement_rate DECIMAL(5,2)  NOT NULL,       -- Actual engagement %
  predicted_rate  DECIMAL(5,2),                -- AI-predicted engagement %
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, month)
);
```

---

### 4.9 `audience_segmentation` table

Seniority/job-level breakdown per event. Powers the pie chart in `AnalyticsPage.tsx`.

```sql
CREATE TABLE audience_segmentation (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID          NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  segment_name    VARCHAR(100)  NOT NULL,
  -- e.g. 'C-Level Executives', 'Directors/VPs', 'Managers', 'Individual Contributors'
  count           INTEGER       NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(event_id, segment_name)
);
```

---

### 4.10 `activity_log` table

Audit log for the real-time activity feed on `DashboardPage.tsx`.

```sql
CREATE TABLE activity_log (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID          REFERENCES events(id),
  user_id     UUID          REFERENCES users(id),
  type        VARCHAR(50)   NOT NULL,
  -- 'lead_identified' | 'attendee_flagged' | 'sponsor_interest' | 'roi_updated'
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### 4.11 `refresh_tokens` table

Stores hashed JWT refresh tokens for session management.

```sql
CREATE TABLE refresh_tokens (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255)  NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ   NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### Entity Relationship Summary

```
users
  |-- attendee_profiles     (1:1, via user_id)
  |-- sponsor_profiles      (1:1, via user_id)
  |-- events                (1:many, via organizer_id)
  |-- event_registrations   (1:many, via user_id)
  |-- sponsor_leads         (1:many, via sponsor_id OR attendee_id)
  |-- refresh_tokens        (1:many)

events
  |-- event_registrations   (1:many)
  |-- sponsor_leads         (1:many)
  |-- engagement_metrics    (1:many)
  |-- audience_segmentation (1:many)
  |-- activity_log          (1:many)

sponsor_leads
  |-- lead_interests        (1:many)
```

---

## 5. API Endpoints

**Base URL:** `/api/v1`

All protected routes require: `Authorization: Bearer <access_token>`

---

### 5.1 Authentication

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user + attendee profile (triggers AI scoring) |
| `POST` | `/auth/login` | No | Login; returns access + refresh tokens |
| `POST` | `/auth/refresh` | No | Exchange refresh token for a new access token |
| `POST` | `/auth/logout` | Yes | Revoke refresh token |
| `POST` | `/auth/verify-email` | No | Verify email with token sent via email |

#### `POST /auth/register` — Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "securePassword123",
  "phone": "+1 (555) 123-4567",
  "company": "Tech Corp Inc.",
  "jobTitle": "Chief Technology Officer",
  "industry": "technology",
  "companySize": "201-500",
  "eventInterest": "ai-ml",
  "hearAboutUs": "referral"
}
```

#### `POST /auth/register` — Response `201`

```json
{
  "user": {
    "id": "uuid",
    "email": "john.doe@company.com",
    "role": "attendee"
  },
  "message": "Registration successful. AI profile analysis in progress."
}
```

#### `POST /auth/login` — Response `200`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john.doe@company.com",
    "role": "attendee"
  }
}
```

---

### 5.2 Users

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/users/me` | Yes | Get current authenticated user + profile |
| `PATCH` | `/users/me` | Yes | Update own profile |
| `DELETE` | `/users/me` | Yes | Delete own account |
| `GET` | `/users/:id` | Yes (Admin) | Get any user by ID |
| `GET` | `/users` | Yes (Admin) | List all users (paginated) |

---

### 5.3 Attendees

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/attendees` | Yes (Organizer/Admin) | List all attendees with relevance scores |
| `GET` | `/attendees/:id` | Yes | Get single attendee profile + scores |
| `GET` | `/attendees?status=high` | Yes | Filter by relevance: `high`, `moderate`, `low` |
| `GET` | `/attendees?search=sarah` | Yes | Search by name, company, or job title |
| `GET` | `/attendees/:id/score` | Yes | Get AI relevance score breakdown for attendee |

#### `GET /attendees` — Response `200`

```json
{
  "total": 587,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "uuid",
      "name": "Sarah Chen",
      "title": "Chief Technology Officer",
      "company": "TechCorp Industries",
      "email": "sarah.chen@techcorp.com",
      "industry": "Technology",
      "relevanceScore": 95,
      "status": "high"
    },
    {
      "id": "uuid",
      "name": "Chris Martinez",
      "title": "HR Specialist",
      "company": "PeopleFirst Corp",
      "email": "cmartinez@peoplefirst.com",
      "industry": "Human Resources",
      "relevanceScore": 45,
      "status": "low"
    }
  ]
}
```

---

### 5.4 Analytics

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/analytics/overview` | Yes (Organizer) | Key metrics: avg engagement, avg ROI, conversion rate, qualified leads |
| `GET` | `/analytics/engagement-by-industry` | Yes | Current vs predicted engagement per industry |
| `GET` | `/analytics/segmentation` | Yes | Audience breakdown by seniority/job level |
| `GET` | `/analytics/roi-trend` | Yes | Traditional vs AI-powered ROI over time (monthly) |
| `GET` | `/analytics/funnel` | Yes | Conversion funnel data |
| `GET` | `/analytics/engagement-trend` | Yes | Monthly actual + AI-predicted engagement |

#### `GET /analytics/overview` — Response `200`

```json
{
  "avgEngagementRate": 82.5,
  "avgROI": 4.5,
  "conversionRate": 24.2,
  "qualifiedLeadsThisMonth": 198,
  "totalAttendees": 587,
  "highRelevanceCount": 342,
  "moderateCount": 158,
  "lowRelevanceCount": 87
}
```

#### `GET /analytics/engagement-by-industry` — Response `200`

```json
{
  "data": [
    { "industry": "Technology",    "engagement": 92, "prediction": 95 },
    { "industry": "Software",      "engagement": 88, "prediction": 90 },
    { "industry": "Cloud Services","engagement": 85, "prediction": 88 },
    { "industry": "Analytics",     "engagement": 78, "prediction": 82 },
    { "industry": "Marketing",     "engagement": 72, "prediction": 75 },
    { "industry": "Sales",         "engagement": 68, "prediction": 70 },
    { "industry": "HR",            "engagement": 45, "prediction": 48 }
  ]
}
```

#### `GET /analytics/segmentation` — Response `200`

```json
{
  "total": 587,
  "data": [
    { "name": "C-Level Executives",       "value": 145, "color": "#3b82f6" },
    { "name": "Directors/VPs",            "value": 213, "color": "#8b5cf6" },
    { "name": "Managers",                 "value": 178, "color": "#ec4899" },
    { "name": "Individual Contributors",  "value": 51,  "color": "#f59e0b" }
  ]
}
```

#### `GET /analytics/roi-trend` — Response `200`

```json
{
  "data": [
    { "month": "Jan", "traditional": 2.1, "withAI": 3.5 },
    { "month": "Feb", "traditional": 2.3, "withAI": 3.8 },
    { "month": "Mar", "traditional": 2.2, "withAI": 4.0 },
    { "month": "Apr", "traditional": 2.4, "withAI": 4.2 },
    { "month": "May", "traditional": 2.3, "withAI": 4.5 },
    { "month": "Jun", "traditional": 2.5, "withAI": 4.8 }
  ]
}
```

#### `GET /analytics/funnel` — Response `200`

```json
{
  "stages": [
    { "stage": "Total Registrations", "value": 587, "color": "#3b82f6" },
    { "stage": "High Relevance",      "value": 342, "color": "#10b981" },
    { "stage": "Engaged",             "value": 285, "color": "#f59e0b" },
    { "stage": "Qualified Leads",     "value": 198, "color": "#8b5cf6" },
    { "stage": "Conversions",         "value": 142, "color": "#ec4899" }
  ]
}
```

---

### 5.5 Sponsors / Leads

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/sponsors/leads` | Yes (Sponsor) | Get AI-recommended leads for this sponsor |
| `GET` | `/sponsors/leads/:id` | Yes (Sponsor) | Get full lead profile and scores |
| `PATCH` | `/sponsors/leads/:id/status` | Yes (Sponsor) | Update lead status |
| `GET` | `/sponsors/metrics` | Yes (Sponsor) | Sponsor-specific KPIs |
| `GET` | `/sponsors/conversion-trend` | Yes (Sponsor) | Weekly conversion: traditional vs AI |
| `GET` | `/sponsors/lead-quality` | Yes (Sponsor) | Lead quality distribution (hot/warm/cold) |
| `POST` | `/sponsors/leads/export` | Yes (Sponsor) | Export all leads as CSV |

#### `GET /sponsors/leads` — Response `200`

```json
{
  "total": 138,
  "data": [
    {
      "id": "uuid",
      "name": "Sarah Chen",
      "title": "Chief Technology Officer",
      "company": "TechCorp Industries",
      "matchScore": 98,
      "conversionProbability": 87,
      "email": "sarah.chen@techcorp.com",
      "phone": "+1 (555) 123-4567",
      "interests": ["AI", "Cloud Infrastructure", "DevOps"],
      "previousEngagement": "High",
      "estimatedValueMin": 50000,
      "estimatedValueMax": 100000,
      "leadQuality": "hot",
      "status": "new"
    }
  ]
}
```

#### `PATCH /sponsors/leads/:id/status` — Request Body

```json
{ "status": "contacted" }
```

#### `GET /sponsors/metrics` — Response `200`

```json
{
  "qualifiedLeads": 138,
  "conversionRate": 31.5,
  "expectedROI": 5.2,
  "hotLeadsCount": 42
}
```

#### `GET /sponsors/conversion-trend` — Response `200`

```json
{
  "data": [
    { "week": "Week 1", "traditional": 12, "aiPowered": 24 },
    { "week": "Week 2", "traditional": 15, "aiPowered": 28 },
    { "week": "Week 3", "traditional": 14, "aiPowered": 31 },
    { "week": "Week 4", "traditional": 16, "aiPowered": 35 }
  ],
  "summary": {
    "traditionalAvg": 14.3,
    "aiPoweredAvg": 29.5,
    "improvement": 106
  }
}
```

#### `GET /sponsors/lead-quality` — Response `200`

```json
{
  "data": [
    { "category": "Hot Leads",  "count": 42 },
    { "category": "Warm Leads", "count": 68 },
    { "category": "Cold Leads", "count": 28 }
  ]
}
```

---

### 5.6 Events

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/events` | Yes | List all active events |
| `GET` | `/events/:id` | Yes | Get event details |
| `POST` | `/events` | Yes (Organizer) | Create a new event |
| `PATCH` | `/events/:id` | Yes (Organizer) | Update event details |
| `DELETE` | `/events/:id` | Yes (Organizer) | Soft-delete event |
| `POST` | `/events/:id/register` | Yes (Attendee) | Register attendee for event (triggers AI scoring job) |

---

### 5.7 Dashboard

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Yes | Stats: total attendees, high/moderate/low counts, % changes |
| `GET` | `/dashboard/activity` | Yes | Recent activity feed (latest 20 entries) |
| `GET` | `/dashboard/engagement-trend` | Yes | Monthly actual vs AI-predicted engagement |

#### `GET /dashboard/summary` — Response `200`

```json
{
  "totalAttendees": 587,
  "totalAttendeesChange": 12.5,
  "highRelevance": { "count": 342, "percentage": 58 },
  "moderate":     { "count": 158, "percentage": 27 },
  "lowRelevance": { "count": 87,  "percentage": 15 }
}
```

#### `GET /dashboard/activity` — Response `200`

```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "lead_identified",
      "title": "High-quality lead identified",
      "description": "Sarah Chen (CTO, TechCorp) registered for AI Summit 2026",
      "createdAt": "2026-04-06T09:05:00Z"
    },
    {
      "id": "uuid",
      "type": "attendee_flagged",
      "title": "Low relevance attendee flagged",
      "description": "3 attendees marked for review based on profile mismatch",
      "createdAt": "2026-04-06T08:58:00Z"
    },
    {
      "id": "uuid",
      "type": "sponsor_interest",
      "title": "New sponsor interested",
      "description": "DataFlow Inc. requesting access to lead dashboard",
      "createdAt": "2026-04-06T08:00:00Z"
    },
    {
      "id": "uuid",
      "type": "roi_updated",
      "title": "ROI prediction updated",
      "description": "Expected sponsor ROI increased to 4.2x based on new registrations",
      "createdAt": "2026-04-06T07:00:00Z"
    }
  ]
}
```

#### `GET /dashboard/engagement-trend` — Response `200`

```json
{
  "data": [
    { "month": "Jan", "engagement": 65, "prediction": 62 },
    { "month": "Feb", "engagement": 72, "prediction": 70 },
    { "month": "Mar", "engagement": 78, "prediction": 80 },
    { "month": "Apr", "engagement": 82, "prediction": 85 },
    { "month": "May", "engagement": 85, "prediction": 88 },
    { "month": "Jun", "engagement": 88, "prediction": 90 }
  ],
  "predictedGrowth": 15
}
```

---

## 6. Business Logic & AI Scoring

### 6.1 Registration Flow

```
User submits /auth/register form
        |
        v
Validate input (Zod schema)
        |
        v
Hash password -> save to users table
        |
        v
Save professional profile -> attendee_profiles table
        |
        v
Send verification email (async via queue)
        |
        v
Enqueue AI scoring job (BullMQ)
        |
        v (async worker picks up job)
Calculate relevance_score
        |
        v
Save score to event_registrations
        |
        v
Log activity_log entry ("lead_identified" or "attendee_flagged")
```

---

### 6.2 Relevance Score Calculation

The relevance score (0–100) is computed by the AI scoring service after registration:

| Factor | Weight | Notes |
|---|---|---|
| Industry match to event type | 35% | Exact match scores higher |
| Job title / seniority level | 25% | C-Level > VP > Director > Manager > IC |
| Company size | 15% | Enterprise (500+) generally scores higher for B2B events |
| Event interest alignment | 20% | Exact match to event topic |
| Profile completeness | 5% | Bonus for filling all fields |

**Score to Status mapping:**

| Score Range | Status |
|---|---|
| 80 – 100 | `high` |
| 60 – 79 | `moderate` |
| 0  – 59  | `low` |

---

### 6.3 Sponsor Match Score

Sponsor leads are scored separately per sponsor:

| Factor | Weight |
|---|---|
| Attendee relevance score | 40% |
| Match to sponsor's target industries | 30% |
| Seniority / decision-maker level | 20% |
| Estimated deal size potential | 10% |

**Match Score to Lead Quality:**

| Match Score | Lead Quality |
|---|---|
| >= 85 | `hot` |
| 60 – 84 | `warm` |
| < 60 | `cold` |

---

### 6.4 Conversion Probability

A percentage (0–100) predicted by the AI based on:
- Historical conversion data from similar professional profiles
- Engagement level during event
- Seniority and budget authority indicators

---

### 6.5 Estimated Deal Value

Estimated based on:
- Company size band (headcount)
- Industry vertical (software, cloud, etc.)
- Seniority of attendee (CTO > VP > Manager)

---

### 6.6 Audience Segmentation Rules

Job titles are classified into seniority segments:

| Segment | Indicators |
|---|---|
| C-Level Executives | CEO, CTO, CFO, COO, CISO, etc. |
| Directors/VPs | VP, Vice President, Director |
| Managers | Manager, Lead, Head of |
| Individual Contributors | Engineer, Developer, Analyst, Specialist, etc. |

---

## 7. Data Models (TypeScript-aligned)

These types match exactly what the frontend expects from the API:

```typescript
// Attendee as returned from GET /attendees
type Attendee = {
  id: string;
  name: string;
  title: string;
  company: string;
  relevanceScore: number;        // 0–100
  email: string;
  industry: string;
  status: 'high' | 'moderate' | 'low';
};

// Registration form payload — POST /auth/register
type RegistrationFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  jobTitle: string;
  industry:
    | 'technology' | 'software' | 'cloud' | 'analytics'
    | 'marketing' | 'sales' | 'finance' | 'healthcare' | 'other';
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  eventInterest:
    | 'ai-ml' | 'cloud' | 'devops' | 'data'
    | 'security' | 'product' | 'leadership' | 'startup';
  hearAboutUs: 'search' | 'social' | 'referral' | 'event' | 'advertisement' | 'other';
};

// Sponsor lead — GET /sponsors/leads
type SponsorLead = {
  id: string;
  name: string;
  title: string;
  company: string;
  matchScore: number;             // 0–100
  conversionProbability: number;  // 0–100 (percentage)
  email: string;
  phone: string;
  interests: string[];            // e.g. ['AI', 'Cloud Infrastructure', 'DevOps']
  previousEngagement: 'High' | 'Medium' | 'Low';
  estimatedValueMin: number;      // in USD
  estimatedValueMax: number;      // in USD
  leadQuality: 'hot' | 'warm' | 'cold';
  status: 'new' | 'viewed' | 'contacted' | 'converted' | 'rejected';
};

// Dashboard summary — GET /dashboard/summary
type DashboardSummary = {
  totalAttendees: number;
  totalAttendeesChange: number;   // percentage change
  highRelevance: { count: number; percentage: number };
  moderate:      { count: number; percentage: number };
  lowRelevance:  { count: number; percentage: number };
};

// Analytics overview — GET /analytics/overview
type AnalyticsOverview = {
  avgEngagementRate: number;      // e.g. 82.5
  avgROI: number;                 // e.g. 4.5
  conversionRate: number;         // e.g. 24.2
  qualifiedLeadsThisMonth: number;
  totalAttendees: number;
  highRelevanceCount: number;
  moderateCount: number;
  lowRelevanceCount: number;
};

// Activity log item — GET /dashboard/activity
type ActivityItem = {
  id: string;
  type: 'lead_identified' | 'attendee_flagged' | 'sponsor_interest' | 'roi_updated';
  title: string;
  description: string;
  createdAt: string;              // ISO 8601
};
```

---

## 8. Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:5174

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/audienceai_db

# Auth
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@audienceai.com

# AI Scoring Service
AI_SCORING_SERVICE_URL=http://localhost:8000
AI_SCORING_API_KEY=your-ai-scoring-service-key

# AWS S3 (optional - for profile images)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=audienceai-uploads
AWS_REGION=us-east-1
```

---

## 9. Security Considerations

| Concern | Mitigation |
|---|---|
| Password storage | `bcrypt` with salt rounds >= 12 |
| SQL Injection | Parameterized queries via Prisma/Drizzle ORM |
| Authentication | Short-lived JWT access tokens (15 min) + HttpOnly refresh cookie (7 days) |
| Rate Limiting | Redis-backed rate limiter on auth routes (max 10 req/min per IP) |
| CORS | Whitelist only the known frontend origin |
| Data Privacy | PII (email, phone) encrypted at rest; GDPR-compliant deletion endpoint |
| Input Validation | Zod schemas on all inbound request bodies |
| Role-based Access | Middleware guard per route enforcing `attendee`, `organizer`, `sponsor`, `admin` |
| Audit Logging | All sensitive mutations logged to `activity_log` table |
| XSS Prevention | Never reflect unsanitized user input back in responses |

---

## 10. Deployment Notes

### Infrastructure Overview

```
+----------------------------------------------------+
|  Cloud Provider (AWS / GCP / Railway / Render)     |
|                                                    |
|  +------------------+   +-------------------+     |
|  | Node.js API      |   | Python AI Service  |     |
|  | (Docker / PM2)   |   | (FastAPI, port 8000)|    |
|  +--------+---------+   +-------------------+     |
|           |                                        |
|  +--------v---------+   +-------------------+     |
|  | PostgreSQL       |   |  Redis             |     |
|  | (Managed DB)     |   |  (Cache / Queue)   |     |
|  +------------------+   +-------------------+     |
+----------------------------------------------------+
```

### Suggested Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   ├── redis.ts           # Redis client
│   │   └── env.ts             # Zod-validated env variables
│   ├── middleware/
│   │   ├── auth.ts            # JWT verify middleware
│   │   ├── roles.ts           # Role-based access guard
│   │   ├── rateLimit.ts       # Redis rate limiter
│   │   └── errorHandler.ts    # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   ├── attendees/
│   │   ├── events/
│   │   ├── analytics/
│   │   ├── sponsors/
│   │   └── dashboard/
│   ├── services/
│   │   ├── aiScoring.ts       # Calls AI scoring service
│   │   ├── email.ts           # Transactional emails (Resend)
│   │   └── queue.ts           # BullMQ job definitions + workers
│   └── app.ts                 # Express app entry point
├── prisma/
│   ├── schema.prisma          # ORM schema (mirrors SQL above)
│   └── migrations/
├── tests/
│   ├── auth.test.ts
│   ├── attendees.test.ts
│   └── sponsors.test.ts
├── .env.example
├── package.json
└── tsconfig.json
```

### Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

---

> **Review Notes:** Before development begins, please confirm:
> 1. Preferred ORM — Prisma vs Drizzle
> 2. AI scoring approach — self-hosted Python model vs external LLM API (OpenAI / Gemini)
> 3. Whether the sponsor lead dashboard needs real-time WebSocket updates for the activity feed
> 4. Whether multi-event support is required at launch, or if v1 is single-event
