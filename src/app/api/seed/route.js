import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { LISTING_STATUS } from "@/lib/constants";

const demoListings = [
  {
    title: "Vintage Polaroid Camera SX-70",
    description: "Classic Polaroid SX-70 Land Camera in excellent working condition. This iconic instant camera from the 1970s is a collector's dream. Comes with original leather case and manual. Film tested and produces beautiful photos.",
    category: "collectibles",
    startingPrice: 150,
    buyNowPrice: 250,
    currentBid: 175,
    bidCount: 5,
    images: [
      { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800", publicId: "demo1" }
    ],
    sellerId: "demo-seller-1",
    sellerName: "VintageFinds",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "MacBook Pro 14\" M3 Pro - Like New",
    description: "2024 MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Space Black color. Only 3 months old, selling because I upgraded to the Max chip. Includes original box, charger, and AppleCare+ until 2027.",
    category: "electronics",
    startingPrice: 1500,
    buyNowPrice: 1800,
    currentBid: 1650,
    bidCount: 12,
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", publicId: "demo2" }
    ],
    sellerId: "demo-seller-2",
    sellerName: "TechDeals",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Handmade Leather Messenger Bag",
    description: "Artisan-crafted genuine leather messenger bag. Hand-stitched with premium full-grain leather. Perfect for laptops up to 15 inches. Features multiple pockets and adjustable shoulder strap. Unique patina develops over time.",
    category: "fashion",
    startingPrice: 120,
    buyNowPrice: null,
    currentBid: 145,
    bidCount: 8,
    images: [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", publicId: "demo3" }
    ],
    sellerId: "demo-seller-3",
    sellerName: "LeatherCraft",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Sony PlayStation 5 Digital Edition",
    description: "PS5 Digital Edition console in perfect condition. Includes DualSense controller, HDMI cable, and power cord. Selling because I barely use it. No scratches or issues. Ready to play!",
    category: "electronics",
    startingPrice: 350,
    buyNowPrice: 400,
    currentBid: 380,
    bidCount: 15,
    images: [
      { url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800", publicId: "demo4" }
    ],
    sellerId: "demo-seller-4",
    sellerName: "GamerZone",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    title: "Mid-Century Modern Teak Coffee Table",
    description: "Beautiful Danish mid-century modern coffee table in solid teak. Authentic 1960s piece with elegant tapered legs. Some minor wear consistent with age adds to its character. Dimensions: 48\" x 20\" x 16\".",
    category: "home-garden",
    startingPrice: 400,
    buyNowPrice: 650,
    currentBid: 450,
    bidCount: 6,
    images: [
      { url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800", publicId: "demo5" }
    ],
    sellerId: "demo-seller-5",
    sellerName: "RetroHome",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Vintage Rolex Datejust 1601",
    description: "1970s Rolex Datejust reference 1601 with silver dial. Recently serviced, keeps excellent time. Original jubilee bracelet shows honest wear. Comes with box only, no papers. Serious buyers only.",
    category: "jewelry",
    startingPrice: 4500,
    buyNowPrice: 5500,
    currentBid: 4800,
    bidCount: 9,
    images: [
      { url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800", publicId: "demo6" }
    ],
    sellerId: "demo-seller-6",
    sellerName: "WatchCollector",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    title: "Complete Harry Potter First Edition Set",
    description: "All 7 Harry Potter books, UK first editions. Books 1-3 are first printings with all the rare errors. Books 4-7 are first edition, first printing. All in very good condition with dust jackets. A must for serious collectors.",
    category: "books-media",
    startingPrice: 2000,
    buyNowPrice: 3500,
    currentBid: null,
    bidCount: 0,
    images: [
      { url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", publicId: "demo7" }
    ],
    sellerId: "demo-seller-7",
    sellerName: "RareBooks",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    title: "Professional DSLR Camera Kit - Canon 5D Mark IV",
    description: "Canon 5D Mark IV body with 24-70mm f/2.8L II and 70-200mm f/2.8L III lenses. Shutter count under 20k. Includes 3 batteries, dual charger, memory cards, and professional camera bag. Perfect for weddings or portraits.",
    category: "electronics",
    startingPrice: 3200,
    buyNowPrice: 4000,
    currentBid: 3400,
    bidCount: 7,
    images: [
      { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800", publicId: "demo8" }
    ],
    sellerId: "demo-seller-8",
    sellerName: "ProPhoto",
    status: LISTING_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

export async function GET() {
  try {
    const listingsCollection = await getCollection("listings");
    
    // Check if demo data already exists
    const existingCount = await listingsCollection.countDocuments({
      sellerId: { $regex: /^demo-seller/ }
    });

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Demo listings already exist",
        count: existingCount,
      });
    }

    // Insert demo listings
    const result = await listingsCollection.insertMany(demoListings);

    return NextResponse.json({
      success: true,
      message: "Demo listings created successfully",
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
