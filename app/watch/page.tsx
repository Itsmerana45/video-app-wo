"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { VideoFeed } from "@/components/video/video-feed"
import { createClient } from "@/lib/supabase/client"

interface Video {
  id: string
  title: string
  creator: string
  creatorAvatar?: string
  videoUrl: string
  thumbnail: string
  views: string
  likes: string
  comments: string
  rating: number
  totalRatings: number
  description?: string
  tags?: string[]
}

export default function WatchPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const { data: videosData, error } = await supabase
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
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      const transformedVideos: Video[] =
        videosData?.map((video) => ({
          id: video.id,
          title: video.title,
          creator: video.profiles?.username || "Unknown",
          creatorAvatar: video.profiles?.avatar_url || "/placeholder.svg",
          videoUrl: video.video_url || "/placeholder-video.mp4",
          thumbnail: video.thumbnail_url || "/placeholder.svg",
          views: video.view_count?.toLocaleString() || "0",
          likes: video.like_count?.toLocaleString() || "0",
          comments: "0", // Will be calculated from comments table
          rating: 0, // Will be calculated from ratings
          totalRatings: 0,
          description: video.description || "",
          tags: video.video_tags?.map((tag: any) => tag.tag) || [],
        })) || []

      for (const video of transformedVideos) {
        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("video_id", video.id)

        video.comments = commentCount?.toString() || "0"

        const { data: ratingsData } = await supabase.from("video_ratings").select("rating").eq("video_id", video.id)

        if (ratingsData && ratingsData.length > 0) {
          const avgRating = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
          video.rating = Math.round(avgRating * 10) / 10
          video.totalRatings = ratingsData.length
        }
      }

      setVideos(transformedVideos)
    } catch (error) {
      console.error("Error fetching videos:", error)
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-black">
          <div className="text-white text-lg">Loading videos...</div>
        </div>
      </TikTokLayout>
    )
  }

  if (videos.length === 0) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">No videos available</h2>
            <p className="text-white/80">Check back later for new content!</p>
          </div>
        </div>
      </TikTokLayout>
    )
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-hidden">
        <VideoFeed videos={videos} />
      </div>
    </TikTokLayout>
  )
}
