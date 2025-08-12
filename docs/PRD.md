# **FAQBNB Product Brief: QR-Based Property Instruction System**
*Revised Edition - Informed by MVP Learnings*

---

## **1. Project Overview**

### **Objective**
Build a scalable web platform where property owners (e.g., Airbnb hosts, vacation rental managers) can create digital instruction systems accessible via QR codes. Based on MVP validation, the system will focus on multi-tenant property management with professional QR code printing capabilities and streamlined OAuth-based authentication.

### **Key Stakeholders**
- **Primary Users**: Property Managers/Hosts (individuals managing 1-10 properties)
- **Secondary Users**: System Administrators (platform operators)
- **End Users**: Property Guests (QR code scanners)

### **Validated Problem Statement**
Property guests repeatedly ask hosts basic questions about appliance usage, WiFi passwords, and amenities. Current solutions (physical binders, apps) create friction. QR codes provide instant, mobile-friendly access to instructions without downloads or accounts.

---

## **2. Core Features (Informed by MVP)**

### **Priority 1: Essential System (Must Have)**

| Feature | Description | MVP Learning |
|---------|-------------|--------------|
| **Multi-Tenant Property Management** | Users manage multiple properties with data isolation | Proven essential - hosts typically manage 2-5 properties |
| **Public Item Display Pages** | Mobile-optimized pages accessible via QR codes | Core value - zero friction access validates strongly |
| **Professional QR Code Generation** | PDF export with vector cutting guides for printing | Critical differentiator - hosts need professional output |
| **OAuth Authentication System** | Google OAuth + access code registration flow | 70%+ user preference, reduces registration abandonment by 40% |
| **Admin Authentication** | Secure user accounts with property-based access control | Required foundation - security and data isolation mandatory |
| **Basic Analytics** | Track QR code usage and popular instructions | Moderate value - helps hosts optimize content |

### **Priority 2: Growth Enablers (Should Have)**

| Feature | Description | MVP Learning |
|---------|-------------|--------------|
| **File Upload System** | Direct upload of images and PDFs vs external links only | High demand - external links create dependency issues |
| **Registration & Onboarding** | Access code system for controlled user acquisition | Necessary for business model - freemium requires gating |
| **Property Organization** | Property types, nicknames, and categorization | Validated need - hosts categorize by location/type |
| **Email Notifications** | Registration, updates, and usage notifications | Standard SaaS expectation for user engagement |

### **Priority 3: Enhancement Features (Nice to Have)**

| Feature | Description | MVP Learning |
|---------|-------------|--------------|
| **Bulk Operations** | CSV import, batch QR generation | Efficiency feature for larger operations |
| **Team Collaboration** | Multi-user property management with roles | Enterprise feature for property management companies |
| **Advanced Analytics** | Detailed usage patterns and reporting | Business intelligence for optimization |
| **Mobile App** | Native QR scanner app | Convenience feature, web-based scanning sufficient for MVP |

---

## **3. Technical Architecture (OAuth-Integrated)**

### **Technology Stack**
*Simplified based on MVP learnings with OAuth as core requirement*

| Component | Technology | OAuth Integration |
|-----------|------------|-------------------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS | OAuth callback handling, PKCE flow |
| **Backend** | Next.js API Routes | Session-based registration completion |
| **Database** | Supabase PostgreSQL | Multi-tenant RLS with OAuth user profiles |
| **Authentication** | Supabase Auth + Google OAuth 2.0 | Primary authentication method with email fallback |
| **File Storage** | Supabase Storage | Integrated solution, good performance |
| **PDF Generation** | pdf-lib | Proven library for professional QR output |
| **Deployment** | Vercel/Railway | OAuth environment variable management |

### **OAuth Authentication Architecture**
*Critical component based on MVP validation*

```typescript
// OAuth Configuration Requirements
interface OAuthConfig {
  provider: 'google';
  clientId: string;
  redirectUri: string;
  scope: ['email', 'profile'];
  responseType: 'code';
  codeChallenge: string; // PKCE compliance
  codeChallengeMethod: 'S256';
}

// Registration Flow Integration
interface OAuthRegistration {
  accessCode: string;
  oauthSession: SupabaseSession;
  userProfile: GoogleProfile;
  autoCreateAccount: boolean;
}
```

**OAuth Implementation Requirements**:
- PKCE (Proof Key for Code Exchange) client-side flow
- Google OAuth 2.0 with proper scope management
- Automatic user profile creation from OAuth data
- Session-based registration completion API
- Fallback to email/password authentication

### **Database Schema (OAuth-Enhanced)**

```sql
-- Core multi-tenant structure (validated in MVP)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  oauth_provider TEXT, -- 'google', 'email', null
  oauth_provider_id TEXT, -- Google user ID
  avatar_url TEXT, -- From OAuth profile
  created_at TIMESTAMP
)

properties (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  nickname VARCHAR(100) NOT NULL,
  property_type VARCHAR(50), -- house, apartment, villa
  address TEXT,
  created_at TIMESTAMP
)

items (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  public_id VARCHAR(8) UNIQUE, -- Shortened based on MVP feedback
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP
)

item_links (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  title VARCHAR(255) NOT NULL,
  link_type VARCHAR(20), -- youtube, pdf, image, text, file
  url TEXT,
  file_url TEXT, -- For uploaded files
  display_order INTEGER,
  created_at TIMESTAMP
)

-- Analytics (simplified based on actual usage)
item_visits (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  visited_at TIMESTAMP DEFAULT NOW(),
  session_id TEXT
)

-- Access management (OAuth-compatible registration system)
access_requests (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  access_code VARCHAR(12) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, used
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  registration_date TIMESTAMP,
  registration_method VARCHAR(20) -- 'oauth', 'email'
)
```

---

## **4. User Experience Design (OAuth-First)**

### **Registration Experience**
*Streamlined based on OAuth validation (70%+ user preference)*

**Registration Page Flow**:
```
┌─────────────────────────────────┐
│     Welcome to FAQBNB          │
│                                 │
│ Access Code: [___________]      │
│ Email: [________________]       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  🚀 Continue with Google    │ │  <- Primary CTA
│ └─────────────────────────────┘ │
│                                 │
│        ─── OR ───               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   📧 Register with Email    │ │  <- Secondary option
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**OAuth User Journey** (Primary Flow):
1. User receives registration link: `faqbnb.com/register?code=ABC123&email=user@example.com`
2. User clicks "Continue with Google"
3. Google OAuth flow (PKCE-compliant, secure)
4. Return to app with authenticated OAuth session
5. Automatic registration completion using session + access code
6. Direct redirect to dashboard (no manual login required)

**Email Registration Journey** (Fallback):
1. User enters password and confirms email
2. Traditional email/password account creation
3. Access code validation and consumption
4. Account setup and redirect to dashboard

### **Public Item Page (Core Experience)**
*Based on successful MVP validation*

**URL Format**: `faqbnb.com/item/{publicId}`

**Mobile-First Layout**:
```
┌─────────────────────────────────┐
│        [Item Name]              │
│     [Brief Description]         │
├─────────────────────────────────┤
│                                 │
│    [Instruction Links Grid]     │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │📺 │ │📄 │ │🔗 │       │
│  │Video│ │PDF │ │Link │       │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
└─────────────────────────────────┘
```

**Key Requirements**:
- Load time < 2 seconds (validated as critical)
- Works offline after initial load
- No authentication required
- Touch-friendly interface (44px minimum tap targets)

### **Admin Dashboard**
*OAuth-integrated with simplified property management*

**Authentication-Aware Interface**:
- User avatar from OAuth profile in header
- "Signed in with Google" indicator
- Property selector at top level
- Context-aware item management

**Property Management**:
- Property selector with user's properties
- Quick property creation with type selection
- Property-specific analytics and QR generation

**Item Management**:
- Simple form for item creation
- Drag-and-drop link reordering (validated as useful)
- Real-time QR code preview
- File upload integration

### **QR Code Printing System**
*Professional output validated as key differentiator*

**Requirements**:
- PDF export with vector cutting guides
- A4 and US Letter support
- Configurable QR code sizes (20-60mm range)
- Batch printing for multiple items
- Print-shop ready output quality

---

## **5. Implementation Phases (OAuth-Prioritized)**

### **Phase 1: OAuth Authentication & Core Platform (8-10 weeks)**
*Foundation for multi-tenant operation with OAuth as primary auth*

**Week 1-2: OAuth Authentication Foundation**
- Google Cloud Console OAuth setup
- Supabase OAuth provider configuration
- PKCE flow implementation (client-side)
- OAuth callback handling and session management
- Access code validation system for OAuth users
- Registration page with dual auth options (OAuth primary)

**Week 3-4: Multi-Tenant Infrastructure**
- Multi-tenant database setup with RLS policies
- OAuth user profile integration
- Property management with user association
- Basic admin interface with OAuth user context

**Week 5-6: Item Management System**
- Property-based item CRUD operations
- Link management with multiple types
- Public item display pages (no auth required)
- Mobile-responsive design validation

**Week 7-8: QR Code Generation & PDF System**
- QR code generation for items
- Professional PDF export with vector cutting guides
- Print layout configuration
- Batch printing capabilities

**Week 9-10: File Upload & Polish**
- Supabase Storage integration
- Image and PDF upload functionality
- Thumbnail generation and file management
- Error handling, edge cases, and performance optimization

### **Phase 2: Scale Features & Business Model (4-6 weeks)**
*Features for growth and retention*

**Week 11-12: Enhanced User Experience**
- Email notification system
- Improved OAuth onboarding flow
- Bulk operations (CSV import)
- Enhanced analytics dashboard

**Week 13-14: Collaboration Features**
- Team member invitations (OAuth-compatible)
- Role-based permissions
- Activity logging and audit trail
- Property sharing capabilities

**Week 15-16: Business Features**
- Payment integration (Stripe)
- Usage-based pricing tiers
- Admin back-office for user management
- Customer support tools and OAuth user management

---

## **6. Business Model (Validated Approach)**

### **Freemium SaaS Pricing**
*Based on MVP user feedback and OAuth adoption patterns*

**Free Tier**:
- 1 property, 10 items
- External links only (YouTube, etc.)
- Basic QR code generation
- Google OAuth signup
- Community support

**Host Plan - $9/month**:
- 3 properties, 50 items per property
- File uploads (100MB storage)
- PDF export with cutting guides
- Email support
- Basic analytics
- OAuth + email authentication options

**Property Manager - $29/month**:
- 10 properties, unlimited items
- 1GB storage, team collaboration
- Advanced analytics and reporting
- Bulk operations
- Priority support
- OAuth-based team invitations

**Enterprise - Custom**:
- Unlimited properties and items
- Custom storage limits
- White-label options
- API access with OAuth integration
- Dedicated support

### **Revenue Model**
- **Primary**: Monthly subscriptions
- **Secondary**: One-time setup services for large customers
- **Future**: Marketplace for instruction templates

### **OAuth Impact on Business Model**
- Reduces signup friction → Higher conversion rates
- Eliminates password reset support → Lower support costs
- Professional appearance → Higher enterprise adoption
- Google integration → Trust and reliability perception

---

## **7. Success Metrics (OAuth-Enhanced)**

### **Authentication Metrics**
- **OAuth Adoption Rate**: % of users choosing Google OAuth vs email/password (Target: 70%+)
- **Registration Completion**: % of OAuth users completing full registration (Target: 95%+)
- **Authentication Errors**: OAuth failure rates and error types (Target: <2%)
- **User Preference**: Correlation between OAuth usage and user retention

### **Product Metrics**
- **User Adoption**: Active properties, items created per user
- **Engagement**: QR scans per item, instruction completion rates
- **Quality**: Customer satisfaction, support ticket volume

### **Business Metrics**
- **Revenue**: Monthly recurring revenue (MRR), average revenue per user (ARPU)
- **Growth**: Customer acquisition cost (CAC), monthly churn rate
- **Efficiency**: Time to value for new users, support cost per customer

### **Technical Metrics**
- **Performance**: Page load times (<2s), uptime (99.9%)
- **Scale**: Concurrent users, database query performance
- **Security**: Zero security incidents, OAuth compliance adherence

---

## **8. Risk Assessment (OAuth-Considered)**

### **OAuth-Specific Risks**
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Google OAuth Policy Changes** | High | Low | Maintain email/password fallback always available |
| **PKCE Implementation Complexity** | Medium | Medium | Thorough testing, follow Supabase best practices |
| **OAuth Provider Downtime** | Medium | Low | Graceful fallback to email registration |
| **User Privacy Concerns** | Low | Medium | Clear OAuth permission explanations, privacy policy |

### **Technical Risks**
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Supabase OAuth Scaling** | Medium | Low | Monitor usage, plan migration path if needed |
| **PDF Generation Performance** | Medium | Medium | Background processing for large batches |
| **File Storage Costs** | Low | High | Storage quotas, file compression optimization |

### **Business Risks**
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| **Market Adoption** | High | Medium | Focus on proven use cases, OAuth-simplified onboarding |
| **Competition** | High | High | Emphasize professional QR printing + OAuth UX |
| **Customer Acquisition** | High | Medium | Leverage OAuth for viral growth, existing communities |

---

## **9. Technical Requirements (OAuth-Compliant)**

### **OAuth Security Requirements**
- PKCE (Proof Key for Code Exchange) implementation mandatory
- Secure OAuth token handling and storage
- Proper OAuth scope management (email, profile only)
- Session security and automatic token refresh
- OAuth provider verification and validation

### **Performance Requirements**
- OAuth callback processing <1 second
- Public pages load in <2 seconds
- Support 1000+ concurrent QR scans
- 99.9% uptime including OAuth provider dependencies
- Mobile-first responsive design

### **Security Requirements**
- Multi-tenant data isolation via RLS
- OAuth session security and CSRF protection
- HTTPS everywhere with proper certificate management
- Regular security audits including OAuth flow
- GDPR compliance for international OAuth users

### **Scalability Requirements**
- Support 10,000+ users in first year
- Handle 100,000+ QR scans per month
- Database designed for horizontal scaling
- CDN integration for global performance
- OAuth provider failover capabilities

### **Development Requirements**

```typescript
// OAuth Implementation Standards
interface OAuthFlow {
  // Client-side PKCE implementation
  initiateOAuth(): Promise<OAuthChallenge>;
  handleCallback(code: string, state: string): Promise<OAuthSession>;
  completeRegistration(session: OAuthSession, accessCode: string): Promise<User>;
}

interface OAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userProfile: GoogleProfile;
  scope: string[];
}

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}
```

---

## **10. Success Criteria**

### **OAuth Authentication Success (1 month)**
- 70%+ of users choose Google OAuth over email/password
- <2% OAuth authentication failure rate
- 95%+ OAuth registration completion rate
- Zero OAuth security incidents

### **MVP Success (3 months)**
- 100 active users with properties
- 1,000+ items created
- 5,000+ QR scans per month
- <5% monthly churn rate
- 80%+ user satisfaction with OAuth signup experience

### **Growth Success (12 months)**
- 1,000 paying customers
- $25,000 monthly recurring revenue
- 50,000+ QR scans per month
- Market validation for enterprise features
- OAuth-driven viral growth coefficient >1.1

---

## **11. OAuth User Journey Detailed**

### **Registration Link Distribution**
**Admin Action**: Send registration link to new user
```
https://faqbnb.com/register?code=ABC12345&email=newuser@example.com
```

### **Primary Flow: OAuth Registration**
1. **Landing**: User clicks registration link
2. **Page Load**: Registration form loads with pre-filled email and access code
3. **OAuth Initiation**: User clicks "Continue with Google"
4. **Google OAuth**: Secure PKCE-compliant OAuth flow
5. **Callback**: Return to FAQBNB with authenticated session
6. **Registration**: Automatic account creation using OAuth profile + access code
7. **Success**: Direct redirect to dashboard with welcome tour

### **Secondary Flow: Email Registration**
1. **Landing**: User clicks registration link
2. **Page Load**: Registration form loads with pre-filled email and access code
3. **Manual Entry**: User clicks "Register with Email"
4. **Password**: User creates password
5. **Validation**: Access code validation and account creation
6. **Success**: Redirect to dashboard with welcome tour

### **Error Handling**
- **Invalid Access Code**: Clear error message with link to request new code
- **OAuth Failure**: Automatic fallback to email registration option
- **Duplicate Email**: Redirect to login with helpful message
- **Network Issues**: Retry mechanisms with user-friendly messaging

---

