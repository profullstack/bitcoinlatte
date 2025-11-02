# BitcoinLatte User Flows

## Overview

This document outlines the key user journeys through the BitcoinLatte application.

---

## 1. Anonymous User - Browse Shops

![Browse Shops Flow](diagrams/flow-browse-shops.puml)

> **Diagram**: [`diagrams/flow-browse-shops.puml`](diagrams/flow-browse-shops.puml)

**Key Features:**
- No login required
- Full map access
- View all approved shops
- See aggregated votes/comments
- Get directions

---

## 2. Anonymous User - Submit Shop

![Submit Shop Flow](diagrams/flow-submit-shop.puml)

> **Diagram**: [`diagrams/flow-submit-shop.puml`](diagrams/flow-submit-shop.puml)

**Key Features:**
- No account required
- Address autocomplete
- Image upload
- Crypto type selection
- Optional tracking with login

---

## 3. Registered User - Vote and Comment

![Vote and Comment Flow](diagrams/flow-vote-comment.puml)

> **Diagram**: [`diagrams/flow-vote-comment.puml`](diagrams/flow-vote-comment.puml)

**Key Features:**
- Magic link authentication
- Multiple vote types
- Categorized comments
- Real-time updates
- One vote per type per user

---

## 4. Registered User - Track Submissions

![Track Submissions Flow](diagrams/flow-track-submissions.puml)

> **Diagram**: [`diagrams/flow-track-submissions.puml`](diagrams/flow-track-submissions.puml)

**Key Features:**
- Submission tracking
- Status badges
- Admin feedback
- Resubmission option
- Activity history

---

## 5. Admin - Review Submissions

![Admin Review Flow](diagrams/flow-admin-review.puml)

> **Diagram**: [`diagrams/flow-admin-review.puml`](diagrams/flow-admin-review.puml)

**Key Features:**
- Bulk review interface
- Image verification
- Location validation
- Edit before approval
- Rejection with notes
- Email notifications

---

## 6. Admin - Manage Users

![Admin Manage Users Flow](diagrams/flow-admin-manage-users.puml)

> **Diagram**: [`diagrams/flow-admin-manage-users.puml`](diagrams/flow-admin-manage-users.puml)

**Key Features:**
- User search
- Admin privileges management
- Activity monitoring
- Content moderation
- Action logging

---

## 7. Shop Discovery Flow

![Shop Discovery Flow](diagrams/flow-shop-discovery.puml)

> **Diagram**: [`diagrams/flow-shop-discovery.puml`](diagrams/flow-shop-discovery.puml)

**Key Features:**
- Location-based discovery
- Interactive map
- Real-time search
- Multiple filters
- Quick preview popups

---

## 8. Mobile PWA Installation

![PWA Installation Flow](diagrams/flow-pwa-installation.puml)

> **Diagram**: [`diagrams/flow-pwa-installation.puml`](diagrams/flow-pwa-installation.puml)

**Key Features:**
- Install prompt
- Home screen icon
- Offline functionality
- Full-screen mode
- Native app feel

---

## 9. Image Upload Flow

![Image Upload Flow](diagrams/flow-image-upload.puml)

> **Diagram**: [`diagrams/flow-image-upload.puml`](diagrams/flow-image-upload.puml)

**Key Features:**
- Client-side validation
- Image preview
- Progress indicator
- Automatic resizing
- Error handling

---

## 10. Search and Filter Flow

![Search and Filter Flow](diagrams/flow-search-filter.puml)

> **Diagram**: [`diagrams/flow-search-filter.puml`](diagrams/flow-search-filter.puml)

**Key Features:**
- Multiple search types
- Combined filters
- Location-based search
- Map/list toggle
- Filter persistence

---

## Key User Personas

### 1. Coffee Enthusiast
- **Goal**: Find Bitcoin-accepting coffee shops
- **Behavior**: Browses map, reads reviews, visits shops
- **Needs**: Accurate locations, current info, directions

### 2. Bitcoin Advocate
- **Goal**: Promote Bitcoin adoption
- **Behavior**: Submits shops, votes, comments
- **Needs**: Easy submission, tracking, community engagement

### 3. Shop Owner
- **Goal**: Get listed on the platform
- **Behavior**: Submits own shop, monitors reviews
- **Needs**: Quick approval, accurate info, positive reviews

### 4. Admin/Moderator
- **Goal**: Maintain quality and accuracy
- **Behavior**: Reviews submissions, moderates content
- **Needs**: Efficient tools, clear information, bulk actions

---

## Conversion Funnels

### Submission Funnel
1. Visit site: 100%
2. Click submit: 15%
3. Start form: 10%
4. Complete form: 7%
5. Submit: 5%

**Optimization targets:**
- Simplify form
- Add progress indicator
- Reduce required fields
- Improve address autocomplete

### Registration Funnel
1. Prompted to login: 100%
2. Enter email: 40%
3. Check email: 35%
4. Click magic link: 30%
5. Complete registration: 28%

**Optimization targets:**
- Clear value proposition
- Faster email delivery
- Better email copy
- Seamless redirect

---

## Error Handling Flows

### Network Error
1. Detect offline/error
2. Show user-friendly message
3. Cache user action
4. Retry when online
5. Notify success/failure

### Validation Error
1. Detect invalid input
2. Highlight field
3. Show specific error
4. Suggest correction
5. Allow retry

### Authentication Error
1. Detect expired session
2. Save current state
3. Prompt re-authentication
4. Restore state
5. Continue action

---

## Performance Considerations

### Initial Load
- Lazy load map
- Defer non-critical JS
- Optimize images
- Cache static assets

### Navigation
- Prefetch likely routes
- Optimistic UI updates
- Background data sync
- Smooth transitions

### Interactions
- Debounce search
- Throttle scroll
- Batch updates
- Progressive enhancement