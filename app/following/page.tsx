"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Play, Heart, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

interface FollowingVideo {
  id: string
  title: string
  creator: string
  creatorAvatar: string
  thumbnail: string
  views: string
  likes: string
  comments: string
  duration: string
  createdAt: string
}

const mockFollowingVideos: FollowingVideo[] = [
  {
    id: "1",
    title: "Amazing sunset timelapse from my rooftop",
    creator: "naturelover",
    creatorAvatar: "/placeholder.svg",
    thumbnail: "/sunset-timelapse.png",
    views: "12.5K",
    likes: "1.2K",
    comments: "89",
    duration: "0:45",
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "Quick pasta recipe that changed my life",
    creator: "foodie_chef",
    creatorAvatar: "/placeholder.svg",
    thumbnail: "/cooking-pasta.png",
    views: "8.3K",
    likes: "892",
    comments: "156",
    duration: "1:23",
    createdAt: "1 day ago",
  },
  {
    id: "3",
    title: "Street art discovery in downtown",
    creator: "urban_explorer",
    creatorAvatar: "/placeholder.svg",
    thumbnail: "/street-art-graffiti.png",
    views: "5.7K",
    likes: "634",
    comments: "42",
    duration: "0:38",
    createdAt: "3 hours ago",
  },
]

export default function FollowingPage() {
  const { user } = useAuth()
  const [followingVideos, setFollowingVideos] = useState<FollowingVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchFollowingVideos()
    } else {
      setFollowingVideos(mockFollowingVideos)
      setIsLoading(false)
    }
  }, [user])

  const fetchFollowingVideos = async () => {
    try {
      setError(null)

      // First check if user_follows table exists by trying to query it
      const { data: followingData, error: followingError } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user?.id)

      if (followingError) {
        console.warn("Database not ready, using mock data:", followingError.message)
        setFollowingVideos(mockFollowingVideos)
        setUseMockData(true)
        setIsLoading(false)
        return
      }

      const followingIds = followingData?.map((f) => f.following_id) || []

      if (followingIds.length === 0) {
        setFollowingVideos(mockFollowingVideos)
        setUseMockData(true)
        setIsLoading(false)
        return
      }

      // Get videos from followed users
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select(`
          *,
          profiles:creator_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .in("creator_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(20)

      if (videosError) throw videosError

      const transformedVideos: FollowingVideo[] = await Promise.all(
        (videosData || []).map(async (video) => {
          // Get comment count
          const { count: commentCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("video_id", video.id)

          return {
            id: video.id,
            title: video.title,
            creator: video.profiles?.username || "Unknown",
            creatorAvatar: video.profiles?.avatar_url || "/placeholder.svg",
            thumbnail: video.thumbnail_url || "/placeholder.svg",
            views: video.view_count?.toLocaleString() || "0",
            likes: video.like_count?.toLocaleString() || "0",
            comments: commentCount?.toString() || "0",
            duration: video.duration
              ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
              : "0:00",
            createdAt: new Date(video.created_at).toLocaleDateString(),
          }
        }),
      )

      setFollowingVideos(transformedVideos)
    } catch (error) {
      console.error("Error fetching following videos:", error)
      setFollowingVideos(mockFollowingVideos)
      setUseMockData(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Following</h1>
            </div>
            <p className="text-muted-foreground">Latest videos from creators you follow</p>
            {useMockData && (
              <div className="mt-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                Showing sample content - database setup in progress
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading videos from your follows...</div>
            </div>
          ) : followingVideos.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No videos from followed creators</h3>
              <p className="text-muted-foreground mb-4">Start following creators to see their latest content here</p>
              <Button asChild>
                <Link href="/explore">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Discover Creators
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {followingVideos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card border-border"
                >
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Creator Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={video.creatorAvatar || "/placeholder.svg"} alt={video.creator} />
                          <AvatarFallback>{video.creator.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Video Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-card-foreground">@{video.creator}</span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{video.createdAt}</span>
                            </div>
                            <h3 className="font-medium text-card-foreground line-clamp-2 mb-3">{video.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Play className="h-4 w-4" />
                                <span>{video.views} views</span>
                              </div>
                              <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <Heart className="h-4 w-4" />
                                <span>{video.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                <span>{video.comments}</span>
                              </div>
                            </div>
                          </div>

                          {/* Video Thumbnail */}
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
