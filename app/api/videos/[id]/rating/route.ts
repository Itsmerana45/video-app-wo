import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: videoId } = params
    const body = await request.json()
    const { rating } = body

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("video_ratings")
      .upsert({
        video_id: videoId,
        user_id: user.id,
        rating,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ rating: data })
  } catch (error) {
    console.error("Error rating video:", error)
    return NextResponse.json({ error: "Failed to rate video" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: videoId } = params

    const { data, error } = await supabase.from("video_ratings").select("rating").eq("video_id", videoId)

    if (error) throw error

    const ratings = data || []
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
    })
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}
