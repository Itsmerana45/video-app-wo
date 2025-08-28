import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a creator
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (!profile || profile.user_type !== "creator") {
      return NextResponse.json({ error: "Access denied - Creator only" }, { status: 403 })
    }

    // Get creator's videos with analytics
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("id, view_count, like_count, created_at")
      .eq("creator_id", user.id)

    if (videosError) throw videosError

    // Get total ratings
    const videoIds = videos?.map((v) => v.id) || []
    const { data: ratings } = await supabase.from("video_ratings").select("rating").in("video_id", videoIds)

    // Get total comments
    const { data: comments } = await supabase.from("comments").select("id").in("video_id", videoIds)

    // Calculate analytics
    const totalViews = videos?.reduce((sum, video) => sum + video.view_count, 0) || 0
    const totalLikes = videos?.reduce((sum, video) => sum + video.like_count, 0) || 0
    const totalVideos = videos?.length || 0
    const totalComments = comments?.length || 0
    const averageRating = ratings?.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0

    return NextResponse.json({
      analytics: {
        totalViews,
        totalLikes,
        totalVideos,
        totalComments,
        averageRating: Math.round(averageRating * 10) / 10,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
    })
  } catch (error) {
    console.error("Error fetching creator analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
