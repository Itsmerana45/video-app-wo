"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, UserPlus, UserCheck, Play, Heart, Grid3X3, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  user_type: string
  created_at: string
  follower_count: number
  following_count: number
  video_count: number
  total_likes: number
}

interface UserVideo {
  id: string
  title: string
  thumbnail_url: string | null
  view_count: number
  like_count: number
  duration: number
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [videos, setVideos] = useState<UserVideo[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [followSystemAvailable, setFollowSystemAvailable] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
  }, [params.username])

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single()

      if (profileError) throw profileError

      // Fetch user's videos
      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(12)

      const userProfile: UserProfile = {
        ...profileData,
        video_count: videosData?.length || 0,
        total_likes: videosData?.reduce((sum, video) => sum + video.like_count, 0) || 0,
      }

      setProfile(userProfile)
      setVideos(videosData || [])

      // Check if current user follows this user
      if (currentUser && currentUser.id !== profileData.id) {
        try {
          const { data: followData } = await supabase
            .from("user_follows")
            .select("*")
            .eq("follower_id", currentUser.id)
            .eq("following_id", profileData.id)
            .single()

          setIsFollowing(!!followData)
        } catch (followError: any) {
          if (followError.message?.includes("user_follows") || followError.code === "42P01") {
            setFollowSystemAvailable(false)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !profile || isFollowLoading || !followSystemAvailable) return

    setIsFollowLoading(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 503) {
          alert("Follow system is being set up. Please try again later.")
          return
        }
        throw new Error(errorData.error || "Failed to update follow status")
      }

      const data = await response.json()
      setIsFollowing(data.following)

      // Update follower count optimistically
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              follower_count: data.following ? prev.follower_count + 1 : prev.follower_count - 1,
            }
          : null,
      )
    } catch (error) {
      console.error("Error updating follow status:", error)
      alert("Failed to update follow status. Please try again.")
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </TikTokLayout>
    )
  }

  if (!profile) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">User not found</h3>
            <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </TikTokLayout>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage src={profile.avatar_url?.trim() || "/placeholder.svg"} alt={profile.username} />
              <AvatarFallback className="text-4xl">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{profile.display_name || profile.username}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>

                {!isOwnProfile && currentUser && followSystemAvailable && (
                  <Button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-primary hover:bg-primary/90"}
                  >
                    {isFollowLoading ? (
                      "Loading..."
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                {isOwnProfile && (
                  <Button asChild variant="outline">
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profile.video_count}</div>
                  <div className="text-sm text-muted-foreground">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profile.follower_count.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profile.following_count}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profile.total_likes.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && <p className="text-card-foreground mb-4">{profile.bio}</p>}

              {/* User Type Badge */}
              <div className="flex justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {profile.user_type}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card">
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Liked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-6">
              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No videos yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "Upload your first video to get started!"
                      : "This user hasn't uploaded any videos yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((video) => (
                    <Card
                      key={video.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border-border group"
                    >
                      <div className="relative aspect-[3/4]">
                        <img
                          src={video.thumbnail_url || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <Link
                          href={`/watch?v=${video.id}`}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-8 w-8 text-white fill-current" />
                        </Link>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between text-white text-xs">
                            <div className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              <span>{video.view_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{video.like_count.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked" className="mt-6">
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Liked videos are private</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Only you can see videos you've liked." : "This user's liked videos are private."}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TikTokLayout>
  )
}
