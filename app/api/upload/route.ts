import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")

    let supabase
    try {
      supabase = await createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (clientError) {
      console.error("[v0] Failed to create Supabase client:", clientError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: clientError instanceof Error ? clientError.message : "Unknown client error",
        },
        { status: 500 },
      )
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("[v0] Session check - Session exists:", !!session, "Session error:", sessionError)

    if (sessionError) {
      console.error("[v0] Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      console.log("[v0] No active session found")
      return NextResponse.json({ error: "Unauthorized", details: "No active session" }, { status: 401 })
    }

    const user = session.user
    console.log("[v0] Auth check - User ID:", user.id, "User email:", user.email)

    let formData
    try {
      formData = await request.formData()
      console.log("[v0] Form data parsed successfully")
    } catch (parseError) {
      console.error("[v0] Failed to parse form data:", parseError)
      return NextResponse.json(
        {
          error: "Invalid form data",
          details: parseError instanceof Error ? parseError.message : "Form parsing failed",
        },
        { status: 400 },
      )
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string

    console.log("[v0] Form data - File:", !!file, "Title:", title, "File size:", file?.size, "File type:", file?.type)

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 100MB" }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    console.log("[v0] Uploading to storage - Filename:", fileName)

    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      console.log("[v0] Available buckets:", buckets?.map((b) => b.name) || [])

      if (bucketsError) {
        console.error("[v0] Error listing buckets:", bucketsError)
        return NextResponse.json(
          {
            error: "Storage configuration error",
            details: `Failed to check storage buckets: ${bucketsError.message}`,
            action: "check_storage_setup",
          },
          { status: 500 },
        )
      }

      const videoBucket = buckets?.find((b) => b.name === "videos")
      if (!videoBucket) {
        console.error("[v0] Videos bucket not found")

        console.log("[v0] Attempting to create videos bucket automatically...")
        try {
          const setupResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/setup-storage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          const setupResult = await setupResponse.json()
          console.log("[v0] Storage setup result:", setupResult)

          if (setupResult.success) {
            console.log("[v0] Videos bucket created successfully, retrying upload...")
            // Continue with the upload process since bucket now exists
          } else {
            return NextResponse.json(
              {
                error: "Storage setup failed",
                details: setupResult.details || "Could not create videos bucket automatically",
                action: "manual_setup_required",
                setupEndpoint: "/api/setup-storage",
                instructions: "Click the 'Setup Storage' button to create the videos bucket automatically.",
              },
              { status: 500 },
            )
          }
        } catch (setupError) {
          console.error("[v0] Automatic storage setup failed:", setupError)
          return NextResponse.json(
            {
              error: "Storage not configured",
              details: "The videos storage bucket does not exist and automatic setup failed.",
              action: "manual_setup_required",
              setupEndpoint: "/api/setup-storage",
              instructions: "Click the 'Setup Storage' button to create the videos bucket.",
            },
            { status: 500 },
          )
        }
      }

      console.log("[v0] Videos bucket found successfully")
    } catch (bucketError) {
      console.error("[v0] Error checking storage buckets:", bucketError)
      return NextResponse.json(
        {
          error: "Storage system error",
          details: bucketError instanceof Error ? bucketError.message : "Unknown storage error",
          action: "check_storage_setup",
        },
        { status: 500 },
      )
    }

    // Upload video to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json(
        {
          error: "Failed to upload video",
          details: uploadError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Storage upload successful:", uploadData)

    // Get public URL for the uploaded video
    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(fileName)

    console.log("[v0] Public URL generated:", publicUrl)

    // Create video record in database
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .insert({
        title,
        description,
        video_url: publicUrl,
        thumbnail_url: null, // We'll generate this later
        duration: null, // We'll extract this later
        file_size: file.size,
        creator_id: user.id,
      })
      .select()
      .single()

    if (videoError) {
      console.error("[v0] Database insert error:", videoError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("videos").remove([fileName])
      return NextResponse.json(
        {
          error: "Failed to create video record",
          details: videoError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Video record created:", video.id)

    // Insert tags if provided
    if (tags) {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
      if (tagArray.length > 0) {
        const tagInserts = tagArray.map((tag: string) => ({
          video_id: video.id,
          tag: tag.toLowerCase(),
        }))

        const { error: tagsError } = await supabase.from("video_tags").insert(tagInserts)
        if (tagsError) {
          console.error("[v0] Error inserting tags:", tagsError)
        } else {
          console.log("[v0] Tags inserted successfully")
        }
      }
    }

    console.log("[v0] Upload completed successfully")
    return NextResponse.json({
      success: true,
      video: {
        ...video,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
