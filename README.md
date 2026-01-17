# 🛒 BazaarFlow

**A modern marketplace platform built for Bangladesh with a unique "Seller's Choice Auction" model.**

BazaarFlow revolutionizes online trading by giving sellers full control - list your items, receive bids, and manually choose which bid to accept. No automatic highest-bidder system, just pure seller autonomy.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

![BazaarFlow Preview](https://via.placeholder.com/1200x600/1e293b/ffffff?text=BazaarFlow+Marketplace)

---

## ✨ Features

### 🎯 Core Functionality
- **Seller's Choice Auction**: Sellers manually review and accept bids - no automatic winner
- **Smart Bidding System**: Place bids with real-time updates and notifications
- **Real-time Messaging**: Built-in chat system between buyers and sellers
- **Wishlist Management**: Save favorite items for later
- **Advanced Search & Filters**: Find exactly what you're looking for
- **Responsive Dashboard**: Comprehensive seller and buyer dashboards

### 🔔 Notifications
- Real-time notifications for bids, messages, and sales
- Unread count badges on bell icon
- Notification types: bids, bid acceptance/rejection, messages, sales
- Mark as read and clear all functionality

### 🎨 UI/UX
- Modern, clean design with shadcn/ui components
- Dark/Light theme support
- Smooth animations with Motion
- Mobile-responsive across all pages
- Image optimization with Next.js Image

### 🔐 Authentication & Security
- NextAuth.js integration with JWT sessions
- Email/password authentication
- Protected routes and API endpoints
- Browser autocomplete for saved credentials

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abbasyasin1n2/bazaar-flow.git
cd bazaar-flow
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
bazaar-flow/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   ├── listings/          # Listing pages
│   │   └── layout.js          # Root layout
│   ├── components/            # React components
│   │   ├── landing/           # Landing page sections
│   │   ├── dashboard/         # Dashboard components
│   │   ├── listings/          # Listing components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities and configs
│   │   ├── db.js             # MongoDB connection
│   │   ├── auth.js           # NextAuth configuration
│   │   ├── notifications.js  # Notification helpers
│   │   └── utils.js          # Utility functions
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
└── package.json
```

---

## 🎯 How It Works

### For Sellers
1. **List Your Item**: Create a listing with photos, description, and minimum price
2. **Receive Bids**: Get notified when buyers place bids
3. **Review & Choose**: Manually review all bids and select the winner
4. **Complete Sale**: Connect with the buyer and finalize the transaction

### For Buyers
1. **Browse Listings**: Explore items across multiple categories
2. **Place Bids**: Submit your offer on items you want
3. **Get Notified**: Receive updates on bid status
4. **Message Sellers**: Chat directly with sellers about items

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.3** - React framework with App Router and Turbopack
- **React 19** - UI library
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **MongoDB Atlas** - Cloud database
- **NextAuth.js v4** - Authentication
- **Cloudinary** - Image hosting and optimization

### Development Tools
- **pnpm** - Fast package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 📊 Database Schema

### Collections

**users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

**listings**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  condition: String,
  location: String,
  minPrice: Number,
  images: [String],
  sellerId: String,
  sellerName: String,
  status: String, // "active", "sold", "inactive"
  soldTo: String,
  soldPrice: Number,
  createdAt: Date
}
```

**bids**
```javascript
{
  _id: ObjectId,
  listingId: String,
  bidderId: String,
  bidderName: String,
  amount: Number,
  status: String, // "pending", "accepted", "rejected"
  createdAt: Date
}
```

**notifications**
```javascript
{
  _id: ObjectId,
  userId: String,
  type: String, // "bid", "message", "accepted", "rejected"
  title: String,
  message: String,
  listingId: String,
  read: Boolean,
  createdAt: Date
}
```

---

## 🔑 Key Features Explained

### Notification System
- **Trigger Events**: Bid placed, bid accepted/rejected, new messages
- **Real-time Updates**: Unread count badge, dropdown preview
- **Persistent Storage**: MongoDB-backed with API endpoints
- **User Actions**: Mark as read, clear all notifications

### Wishlist System
- **Database-backed**: Survives browser refresh
- **API Integration**: RESTful endpoints for CRUD operations
- **Quick Access**: Save items for later viewing

### Messaging System
- **Direct Communication**: Buyers and sellers can chat
- **Listing Context**: Messages linked to specific items
- **Role Badges**: Clear indication of Buyer/Seller roles
- **Unread Indicators**: Know when new messages arrive

---

## 🌐 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `POST /api/listings` - Create new listing
- `GET /api/listings/[id]` - Get single listing
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Bids
- `GET /api/bids` - Get user's bids
- `POST /api/bids` - Place a bid
- `PATCH /api/bids/[id]` - Accept/reject bid

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications` - Clear all

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist` - Remove from wishlist

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/[id]` - Get messages
- `POST /api/conversations/[id]` - Send message

---

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      // Add your custom colors
    }
  }
}
```

### Categories
Update categories in `src/lib/constants.js`:

```javascript
export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  // Add more categories
];
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

**Abbas Yasin**

- GitHub: [@abbasyasin1n2](https://github.com/abbasyasin1n2)
- LinkedIn: [abbas-yasin-789452392](https://www.linkedin.com/in/abbas-yasin-789452392/)
- Twitter: [@bankai_tenshou](https://x.com/bankai_tenshou)
- Facebook: [abbas.yasin.7](https://www.facebook.com/abbas.yasin.7)
- Email: [abbasyasin5n2@gmail.com](mailto:abbasyasin5n2@gmail.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [MongoDB](https://www.mongodb.com/) - Database platform
- [Cloudinary](https://cloudinary.com/) - Media management

---

## 📞 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Send me an email
- Connect on LinkedIn

---

**Built with ❤️ for Bangladesh 🇧🇩**
