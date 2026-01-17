import { getDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Ping the database
    await db.command({ ping: 1 });
    
    return NextResponse.json({
      success: true,
      message: "Successfully connected to MongoDB!",
      database: "bazaarflow",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to MongoDB",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
