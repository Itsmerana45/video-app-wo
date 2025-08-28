import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id: videoId } = params

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        ),
        replies:comments!parent_id (
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq("video_id", videoId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ comments: data })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

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
    const { content, parent_id } = body

    const { data, error } = await supabase
      .from("comments")
      .insert({
        video_id: videoId,
        user_id: user.id,
        content,
        parent_id: parent_id || null,
      })
      .select(`
        *,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ comment: data })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
