// Listing categories - icons are lucide-react icon names
export const CATEGORIES = [
  { value: "electronics", label: "Electronics", icon: "Laptop" },
  { value: "fashion", label: "Fashion", icon: "Shirt" },
  { value: "home-garden", label: "Home & Garden", icon: "Home" },
  { value: "vehicles", label: "Vehicles", icon: "Car" },
  { value: "collectibles", label: "Collectibles", icon: "Palette" },
  { value: "sports", label: "Sports & Outdoors", icon: "Dumbbell" },
  { value: "books-media", label: "Books & Media", icon: "BookOpen" },
  { value: "toys-games", label: "Toys & Games", icon: "Gamepad2" },
  { value: "jewelry", label: "Jewelry & Watches", icon: "Gem" },
  { value: "other", label: "Other", icon: "Package" },
];

// Listing status
export const LISTING_STATUS = {
  ACTIVE: "active",
  SOLD: "sold",
  CLOSED: "closed",
  DRAFT: "draft",
};

// Bid status
export const BID_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  OUTBID: "outbid",
};

// Message status
export const MESSAGE_STATUS = {
  UNREAD: "unread",
  READ: "read",
};

// Pagination
export const ITEMS_PER_PAGE = 12;

// Image upload limits
export const MAX_IMAGES_PER_LISTING = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Currency formatting (Bangladeshi Taka)
export const formatCurrency = (amount) => {
  return "৳" + new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatting
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Time ago helper
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};
