"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Heart, MessageCircle, Share } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Video {
  id: string
  title: string
  creator: string
  thumbnail: string
  views: string
  likes: string
  duration: string
}

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      console.log("[v0] Starting video fetch...")

      const supabase = createClient()

      const { data: videosData, error } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          thumbnail_url,
          view_count,
          like_count,
          duration,
          created_at,
          profiles:creator_id(username, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(12)

      if (error) {
        console.error("[v0] Database query failed:", error.message)
        console.log("[v0] Using mock data as fallback")
        setVideos(getMockVideos())
        return
      }

      console.log("[v0] Query success, got", videosData?.length || 0, "videos")

      const transformedVideos: Video[] =
        videosData?.map((video: any) => ({
          id: video.id,
          title: video.title || "Untitled Video",
          creator: video.profiles?.username || video.profiles?.full_name || "Unknown",
          thumbnail: video.thumbnail_url || "/video-thumbnail.png",
          views: video.view_count?.toLocaleString() || "0",
          likes: video.like_count?.toLocaleString() || "0",
          duration: video.duration
            ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
            : "0:00",
        })) || []

      setVideos(transformedVideos)
    } catch (error) {
      console.error("[v0] Video fetch failed:", error)
      console.log("[v0] Using mock data as fallback")
      setVideos(getMockVideos())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockVideos = (): Video[] => [
    {
      id: "1",
      title: "Amazing Sunset Timelapse",
      creator: "naturelover",
      thumbnail: "/sunset-timelapse.png",
      views: "12,543",
      likes: "1,234",
      duration: "2:15",
    },
    {
      id: "2",
      title: "Cooking Pasta Like a Pro",
      creator: "chefmaster",
      thumbnail: "/cooking-pasta.png",
      views: "8,921",
      likes: "892",
      duration: "3:42",
    },
    {
      id: "3",
      title: "Street Art Graffiti Process",
      creator: "urbanartist",
      thumbnail: "/street-art-graffiti.png",
      views: "15,678",
      likes: "2,156",
      duration: "4:28",
    },
  ]

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">For You</h1>
            <p className="text-muted-foreground">Discover trending videos from creators you love</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading videos...</div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No videos available</h2>
              <p className="text-muted-foreground">Check back later for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border-border"
                >
                  <div className="relative group">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-64 object-cover"
                    />
                    <Link
                      href={`/watch?v=${video.id}`}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                        <Play className="h-6 w-6 fill-current" />
                      </Button>
                    </Link>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                      {video.duration}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2 text-card-foreground">{video.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">@{video.creator}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{video.views} views</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{video.likes}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TikTokLayout>
  )
}
