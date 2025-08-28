import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        profiles:creator_id (
          username,
          display_name,
          avatar_url
        ),
        video_tags (
          tag
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description } = body

    const { data, error } = await supabase
      .from("videos")
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("creator_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const { error } = await supabase.from("videos").delete().eq("id", id).eq("creator_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}
