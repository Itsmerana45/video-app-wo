"use client"

import { useState, useEffect, useRef } from "react"
import { VideoPlayer } from "./video-player"
import { CommentsSection } from "./comments-section"
import { RatingSystem } from "./rating-system"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

interface Video {
  id: string | number
  title: string
  creator: string
  creatorAvatar?: string
  videoUrl: string
  thumbnail: string
  views: string
  likes: string
  comments: string
  description?: string
  tags?: string[]
  rating?: number
  totalRatings?: number
}

interface VideoFeedProps {
  videos: Video[]
}

interface Comment {
  id: string
  user: { username: string; avatar: string }
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies?: Comment[]
}

const mockComments: Comment[] = [
  {
    id: "1",
    user: { username: "viewer1", avatar: "/placeholder.svg" },
    content: "Amazing content! Keep it up! 🔥",
    timestamp: "2 hours ago",
    likes: 12,
    dislikes: 0,
    replies: [],
  },
  {
    id: "2",
    user: { username: "fan123", avatar: "/placeholder.svg" },
    content: "This is exactly what I was looking for. Thanks for sharing!",
    timestamp: "4 hours ago",
    likes: 8,
    dislikes: 1,
    replies: [],
  },
  {
    id: "3",
    user: { username: "creator_friend", avatar: "/placeholder.svg" },
    content: "Great work as always! Can't wait for the next one.",
    timestamp: "1 day ago",
    likes: 15,
    dislikes: 0,
    replies: [],
  },
]

export function VideoFeed({ videos }: VideoFeedProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [likedVideos, setLikedVideos] = useState<Set<string | number>>(new Set())
  const [openComments, setOpenComments] = useState<string | number | null>(null)
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({})
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [databaseConnected, setDatabaseConnected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { user } = useAuth()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const videoHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / videoHeight)

      if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentVideoIndex(newIndex)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [currentVideoIndex, videos.length])

  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      const nextIndex = currentVideoIndex + 1
      setCurrentVideoIndex(nextIndex)
      scrollToVideo(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1
      setCurrentVideoIndex(prevIndex)
      scrollToVideo(prevIndex)
    }
  }

  const scrollToVideo = (index: number) => {
    const container = containerRef.current
    if (!container) return

    const videoHeight = container.clientHeight
    container.scrollTo({
      top: index * videoHeight,
      behavior: "smooth",
    })
  }

  const toggleLike = async (videoId: string | number) => {
    if (!user) return

    try {
      const { error: testError } = await supabase.from("video_likes").select("id").limit(1)
      if (testError) {
        console.log("Database not ready, using mock like functionality:", testError.message)
        // Mock like functionality
        const newLikedVideos = new Set(likedVideos)
        if (likedVideos.has(videoId)) {
          newLikedVideos.delete(videoId)
        } else {
          newLikedVideos.add(videoId)
        }
        setLikedVideos(newLikedVideos)
        return
      }

      const videoIdStr = videoId.toString()
      const isLiked = likedVideos.has(videoId)

      if (isLiked) {
        const { error } = await supabase.from("video_likes").delete().eq("video_id", videoIdStr).eq("user_id", user.id)

        if (!error) {
          const newLikedVideos = new Set(likedVideos)
          newLikedVideos.delete(videoId)
          setLikedVideos(newLikedVideos)

          await supabase.rpc("decrement_video_likes", { video_id: videoIdStr })
        }
      } else {
        const { error } = await supabase.from("video_likes").insert({ video_id: videoIdStr, user_id: user.id })

        if (!error) {
          const newLikedVideos = new Set(likedVideos)
          newLikedVideos.add(videoId)
          setLikedVideos(newLikedVideos)

          await supabase.rpc("increment_video_likes", { video_id: videoIdStr })
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      const newLikedVideos = new Set(likedVideos)
      if (likedVideos.has(videoId)) {
        newLikedVideos.delete(videoId)
      } else {
        newLikedVideos.add(videoId)
      }
      setLikedVideos(newLikedVideos)
    }
  }

  const toggleComments = async (videoId: string | number) => {
    const newOpenComments = openComments === videoId ? null : videoId
    setOpenComments(newOpenComments)

    if (newOpenComments && !comments[videoId.toString()]) {
      setIsLoadingComments(true)
      try {
        const { error: testError } = await supabase.from("comments").select("id").limit(1)
        if (testError) {
          console.log("Database not ready, using mock comments:", testError.message)
          setComments((prev) => ({
            ...prev,
            [videoId.toString()]: mockComments,
          }))
          setIsLoadingComments(false)
          return
        }

        const { data: commentsData, error } = await supabase
          .from("comments")
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("video_id", videoId.toString())
          .is("parent_id", null)
          .order("created_at", { ascending: false })

        if (error) throw error

        const transformedComments: Comment[] =
          commentsData?.map((comment) => ({
            id: comment.id,
            user: {
              username: comment.profiles?.username || "Unknown",
              avatar: comment.profiles?.avatar_url || "/placeholder.svg",
            },
            content: comment.content,
            timestamp: new Date(comment.created_at).toLocaleString(),
            likes: comment.like_count || 0,
            dislikes: comment.dislike_count || 0,
            replies: [], // TODO: Fetch replies
          })) || []

        setComments((prev) => ({
          ...prev,
          [videoId.toString()]: transformedComments.length > 0 ? transformedComments : mockComments,
        }))
      } catch (error) {
        console.error("Error fetching comments:", error)
        setComments((prev) => ({
          ...prev,
          [videoId.toString()]: mockComments,
        }))
      } finally {
        setIsLoadingComments(false)
      }
    }
  }

  useEffect(() => {
    if (user && videos.length > 0) {
      loadUserLikes()
    }
  }, [user, videos])

  const loadUserLikes = async () => {
    if (!user) return

    try {
      const { error: testError } = await supabase.from("video_likes").select("id").limit(1)
      if (testError) {
        console.log("Database not ready, skipping user likes:", testError.message)
        setDatabaseConnected(false)
        return
      }

      setDatabaseConnected(true)
      const videoIds = videos.map((v) => v.id.toString())
      const { data: likesData, error } = await supabase
        .from("video_likes")
        .select("video_id")
        .eq("user_id", user.id)
        .in("video_id", videoIds)

      if (error) throw error

      const likedVideoIds = new Set(likesData?.map((like) => like.video_id) || [])
      setLikedVideos(likedVideoIds)
    } catch (error) {
      console.error("Error loading user likes:", error)
      setDatabaseConnected(false)
    }
  }

  if (!videos.length) return null

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-screen snap-start flex relative">
          {/* Main Video Section */}
          <div className="flex-1 relative bg-black">
            <div className="h-full flex items-center justify-center">
              <VideoPlayer
                src={video.videoUrl || "/placeholder-video.mp4"}
                title={video.title}
                onNext={index < videos.length - 1 ? handleNext : undefined}
                onPrevious={index > 0 ? handlePrevious : undefined}
                autoPlay={index === currentVideoIndex}
              />
            </div>

            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-end justify-between">
                <div className="flex-1 text-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={video.creatorAvatar?.trim() || "/placeholder.svg"} />
                      <AvatarFallback>{video.creator.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">@{video.creator}</p>
                      <p className="text-sm text-white/80">{video.views} views</p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold mb-2">{video.title}</h2>
                  {video.description && <p className="text-sm text-white/90 mb-2 line-clamp-2">{video.description}</p>}
                  {video.tags && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons - TikTok Style */}
                <div className="flex flex-col items-center space-y-4 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center space-y-1 text-white hover:bg-white/20 h-auto p-2"
                  >
                    <Heart className={`h-6 w-6 ${likedVideos.has(video.id) ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-xs">{video.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(video.id)}
                    className={`flex flex-col items-center space-y-1 text-white hover:bg-white/20 h-auto p-2 ${
                      openComments === video.id ? "bg-white/20" : ""
                    }`}
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-xs">{video.comments}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-col items-center space-y-1 text-white hover:bg-white/20 h-auto p-2"
                  >
                    <Share className="h-6 w-6" />
                    <span className="text-xs">Share</span>
                  </Button>

                  <div className="pt-2">
                    <RatingSystem
                      videoId={video.id.toString()}
                      initialRating={video.rating || 0}
                      totalRatings={video.totalRatings || 0}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Comments Sidebar */}
          <div className="hidden lg:block w-80 bg-background border-l">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Comments</h3>
                {!databaseConnected && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Demo comments - database not connected
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingComments ? (
                  <div className="p-4 text-center text-muted-foreground">Loading comments...</div>
                ) : (
                  <CommentsSection videoId={video.id.toString()} comments={comments[video.id.toString()] || []} />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Comments Popup Modal */}
          {openComments === video.id && (
            <div className="lg:hidden fixed inset-0 z-50 flex items-end">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50" onClick={() => setOpenComments(null)} />

              {/* Modal Content */}
              <div className="relative w-full bg-background rounded-t-xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Comments</h3>
                  <Button variant="ghost" size="sm" onClick={() => setOpenComments(null)} className="h-auto p-2">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoadingComments ? (
                    <div className="p-4 text-center text-muted-foreground">Loading comments...</div>
                  ) : (
                    <CommentsSection videoId={video.id.toString()} comments={comments[video.id.toString()] || []} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
