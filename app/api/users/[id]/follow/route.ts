import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.id

    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from("user_follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single()

      if (existingFollow) {
        return NextResponse.json({ error: "Already following this user" }, { status: 400 })
      }

      // Create follow relationship
      const { error: followError } = await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      })

      if (followError) throw followError

      return NextResponse.json({ success: true, following: true })
    } catch (dbError: any) {
      if (dbError.message?.includes("user_follows") || dbError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Follow system not set up yet. Please run database migrations.",
            following: false,
          },
          { status: 503 },
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.id

    try {
      // Remove follow relationship
      const { error: unfollowError } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)

      if (unfollowError) throw unfollowError

      return NextResponse.json({ success: true, following: false })
    } catch (dbError: any) {
      if (dbError.message?.includes("user_follows") || dbError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Follow system not set up yet. Please run database migrations.",
            following: false,
          },
          { status: 503 },
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
