import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Storage setup API called")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cxvresrlypuhyipvuefo.supabase.co"
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dnJlc3JseXB1aHlpcHZ1ZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzY3NjIsImV4cCI6MjA3MTk1Mjc2Mn0.G6V9q_fZ9Uyc-h6DMAiihgpFzVdsXfQOkw2mvkqh0ow"

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          error: "Supabase configuration missing",
          details: "NEXT_PUBLIC_SUPABASE_URL is required",
        },
        { status: 400 },
      )
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Admin Supabase client created")

    // Check if videos bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    console.log("[v0] Available buckets:", buckets?.map((b) => b.name) || [])

    if (listError) {
      console.log("[v0] Error listing buckets:", listError)
      return NextResponse.json(
        {
          error: "Failed to check existing buckets",
          details: listError.message,
        },
        { status: 500 },
      )
    }

    const videosExists = buckets?.some((bucket) => bucket.name === "videos")

    if (videosExists) {
      console.log("[v0] Videos bucket already exists")
      return NextResponse.json({
        success: true,
        message: "Videos bucket already exists",
        bucket: "videos",
      })
    }

    // Create the videos bucket
    console.log("[v0] Creating videos bucket...")
    const { data: bucket, error: createError } = await supabase.storage.createBucket("videos", {
      public: true,
      allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
      fileSizeLimit: 104857600, // 100MB
    })

    if (createError) {
      console.log("[v0] Error creating bucket:", createError)
      return NextResponse.json(
        {
          error: "Failed to create videos bucket",
          details: createError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Videos bucket created successfully:", bucket)

    console.log("[v0] Storage setup completed successfully")

    return NextResponse.json({
      success: true,
      message: "Videos bucket created successfully",
      bucket: "videos",
    })
  } catch (error) {
    console.log("[v0] Unexpected error in storage setup:", error)
    return NextResponse.json(
      {
        error: "Unexpected error during storage setup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
