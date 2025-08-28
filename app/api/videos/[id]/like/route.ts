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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from("video_likes").delete().eq("video_id", videoId).eq("user_id", user.id)

      if (error) throw error

      // Update like count
      const { error: updateError } = await supabase.rpc("decrement_video_likes", {
        video_id: videoId,
      })

      if (updateError) console.error("Error updating like count:", updateError)

      return NextResponse.json({ liked: false })
    } else {
      // Like
      const { error } = await supabase.from("video_likes").insert({
        video_id: videoId,
        user_id: user.id,
      })

      if (error) throw error

      // Update like count
      const { error: updateError } = await supabase.rpc("increment_video_likes", {
        video_id: videoId,
      })

      if (updateError) console.error("Error updating like count:", updateError)

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
