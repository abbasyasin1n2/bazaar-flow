# Changelog

All notable changes to BazaarFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added

- **Seller's Choice Auction System**: Sellers manually accept/reject bids
- **User Authentication**: NextAuth.js with email/password
- **Listing Management**: Create, edit, delete listings with image upload
- **Bidding System**: Place bids with real-time updates
- **Notification System**:
  - Bid placed notifications for sellers
  - Bid accepted/rejected notifications for bidders
  - New message notifications
  - Unread count badges
  - Mark as read and clear all functionality
- **Messaging System**:
  - Direct chat between buyers and sellers
  - Conversation threads linked to listings
  - Role badges (Buyer/Seller)
  - Unread message indicators
- **Wishlist Feature**:
  - Database-backed wishlist
  - Add/remove items
  - Persistent across sessions
- **Dashboard**:
  - Overview with stats and charts
  - My Listings management
  - Bids received/placed tracking
  - Messages inbox
  - Wishlist view
  - Settings page
- **Search & Filters**:
  - Search by title/description
  - Filter by category, condition, location
  - Sort by price, date
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Dark/Light mode toggle
- **Image Optimization**: Next.js Image with Cloudinary
- **Social Links**: GitHub, LinkedIn, Twitter, Facebook, Email

### Features

- Landing page with hero, stats, how-it-works, categories, CTA
- Browse listings page with advanced filters
- Listing detail page with bid history
- User profile and settings
- Order tracking system
- Revenue analytics for sellers
- Browser autocomplete for login credentials

### Technical

- Next.js 16.1.3 with App Router and Turbopack
- React 19
- MongoDB Atlas for database
- Cloudinary for image hosting
- Tailwind CSS v4 for styling
- shadcn/ui component library
- Motion for animations
- SweetAlert2 for notifications

### Security

- Password hashing with bcryptjs
- JWT-based sessions
- Protected API routes
- Environment variable configuration

---

## [0.1.0] - 2026-01-01

### Added

- Initial project setup
- Basic structure and configuration
- Core dependencies installation

---

For more details, see the [commit history](https://github.com/abbasyasin1n2/bazaar-flow/commits/main).
