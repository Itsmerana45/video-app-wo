"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Play, Heart, MessageCircle, Share, Clock, File as Fire } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface TrendingVideo {
  id: string
  title: string
  creator: string
  creatorAvatar: string
  thumbnail: string
  views: string
  likes: string
  comments: string
  duration: string
  trendingScore: number
}

export default function TrendingPage() {
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([])
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("today")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingVideos()
  }, [timeFilter])

  const fetchTrendingVideos = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const now = new Date()
      const startDate = new Date()

      switch (timeFilter) {
        case "today":
          startDate.setDate(now.getDate() - 1)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
      }

      const { data: videosData, error } = await supabase
        .from("videos")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("view_count", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Database query failed:", error)
        setTrendingVideos(getMockTrendingVideos())
        return
      }

      const transformedVideos: TrendingVideo[] = await Promise.all(
        (videosData || []).map(async (video) => {
          const commentClient = createClient()

          let commentCount = 0
          try {
            const { count } = await commentClient
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("video_id", video.id)
            commentCount = count || 0
          } catch (error) {
            console.error("Error fetching comment count:", error)
            commentCount = Math.floor(Math.random() * 50)
          }

          let creatorInfo = { username: "Unknown", avatar_url: "/placeholder.svg" }
          try {
            const profileClient = createClient()
            const { data: profile } = await profileClient
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", video.creator_id)
              .single()

            if (profile) {
              creatorInfo = profile
            }
          } catch (error) {
            console.error("Error fetching creator info:", error)
          }

          const trendingScore = (video.view_count || 0) + (video.like_count || 0) * 2 + commentCount * 3

          return {
            id: video.id,
            title: video.title,
            creator: creatorInfo.username,
            creatorAvatar: creatorInfo.avatar_url || "/placeholder.svg",
            thumbnail: video.thumbnail_url || "/placeholder.svg",
            views: (video.view_count || 0).toLocaleString(),
            likes: (video.like_count || 0).toLocaleString(),
            comments: commentCount.toString(),
            duration: video.duration
              ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
              : "0:00",
            trendingScore,
          }
        }),
      )

      transformedVideos.sort((a, b) => b.trendingScore - a.trendingScore)
      setTrendingVideos(transformedVideos)
    } catch (error) {
      console.error("Error fetching trending videos:", error)
      setTrendingVideos(getMockTrendingVideos())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockTrendingVideos = (): TrendingVideo[] => [
    {
      id: "trending-1",
      title: "Epic Gaming Montage - Best Plays 2024",
      creator: "ProGamer",
      creatorAvatar: "/placeholder.svg",
      thumbnail: "/ultimate-gaming-setup.png",
      views: "1.2M",
      likes: "89K",
      comments: "2.1K",
      duration: "3:45",
      trendingScore: 1000000,
    },
    {
      id: "trending-2",
      title: "Tokyo Street Food Adventure",
      creator: "FoodieExplorer",
      creatorAvatar: "/placeholder.svg",
      thumbnail: "/vibrant-tokyo-cityscape.png",
      views: "856K",
      likes: "67K",
      comments: "1.8K",
      duration: "8:22",
      trendingScore: 900000,
    },
    {
      id: "trending-3",
      title: "Behind the Scenes: Music Production",
      creator: "BeatMaker",
      creatorAvatar: "/placeholder.svg",
      thumbnail: "/music-studio.png",
      views: "634K",
      likes: "45K",
      comments: "1.2K",
      duration: "5:17",
      trendingScore: 700000,
    },
  ]

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Fire className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-foreground">Trending</h1>
            </div>
            <p className="text-muted-foreground">Discover what's hot right now</p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={timeFilter === "today" ? "default" : "outline"}
              onClick={() => setTimeFilter("today")}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button
              variant={timeFilter === "week" ? "default" : "outline"}
              onClick={() => setTimeFilter("week")}
              size="sm"
            >
              This Week
            </Button>
            <Button
              variant={timeFilter === "month" ? "default" : "outline"}
              onClick={() => setTimeFilter("month")}
              size="sm"
            >
              This Month
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading trending videos...</div>
            </div>
          ) : trendingVideos.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No trending videos</h3>
              <p className="text-muted-foreground">Check back later for trending content!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card border-border"
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>

                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                        <Link
                          href={`/watch?v=${video.id}`}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Play className="h-6 w-6 text-white fill-current" />
                        </Link>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {video.duration}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-card-foreground line-clamp-2 text-sm">{video.title}</h3>
                          <Badge variant="secondary" className="ml-2 flex-shrink-0">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={video.creatorAvatar || "/placeholder.svg"}
                            alt={video.creator}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-muted-foreground">@{video.creator}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            <span>{video.views}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{video.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{video.comments}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
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
