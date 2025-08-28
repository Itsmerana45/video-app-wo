import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creator_id")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("videos")
      .select(`
        *,
        profiles:creator_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (creatorId) {
      query = query.eq("creator_id", creatorId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ videos: data })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, video_url, thumbnail_url, duration, file_size, tags } = body

    // Insert video
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .insert({
        title,
        description,
        video_url,
        thumbnail_url,
        duration,
        file_size,
        creator_id: user.id,
      })
      .select()
      .single()

    if (videoError) throw videoError

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        video_id: video.id,
        tag: tag.trim().toLowerCase(),
      }))

      const { error: tagsError } = await supabase.from("video_tags").insert(tagInserts)

      if (tagsError) console.error("Error inserting tags:", tagsError)
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
