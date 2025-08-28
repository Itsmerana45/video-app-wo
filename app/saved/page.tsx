"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, Play, Heart, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

interface SavedVideo {
  id: string
  title: string
  creator: string
  creatorAvatar: string
  thumbnail: string
  views: string
  likes: string
  duration: string
  savedAt: string
}

export default function SavedPage() {
  const { user } = useAuth()
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSavedVideos()
    }
  }, [user])

  const fetchSavedVideos = async () => {
    try {
      // This would typically come from a saved_videos table
      // For now, we'll simulate saved videos
      const mockSavedVideos: SavedVideo[] = [
        {
          id: "1",
          title: "Amazing Dance Tutorial - Learn the Latest Moves",
          creator: "dance_master",
          creatorAvatar: "/placeholder.svg",
          thumbnail: "/dance-challenge.png",
          views: "1.2M",
          likes: "89K",
          duration: "2:45",
          savedAt: "2 days ago",
        },
        {
          id: "2",
          title: "Cooking Hack: Perfect Pasta Every Time",
          creator: "chef_pro",
          creatorAvatar: "/placeholder.svg",
          thumbnail: "/cooking-pasta.png",
          views: "856K",
          likes: "45K",
          duration: "1:30",
          savedAt: "1 week ago",
        },
      ]

      setSavedVideos(mockSavedVideos)
    } catch (error) {
      console.error("Error fetching saved videos:", error)
      setSavedVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  const removeSaved = async (videoId: string) => {
    setSavedVideos((prev) => prev.filter((video) => video.id !== videoId))
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Saved</h1>
            </div>
            <p className="text-muted-foreground">Videos you've saved for later</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading saved videos...</div>
            </div>
          ) : savedVideos.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No saved videos</h3>
              <p className="text-muted-foreground mb-4">
                Save videos you want to watch later by tapping the bookmark icon
              </p>
              <Button asChild>
                <Link href="/explore">Discover Videos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedVideos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border-border group"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeSaved(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">@{video.creator}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{video.views} views</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{video.likes}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Saved {video.savedAt}</p>
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
