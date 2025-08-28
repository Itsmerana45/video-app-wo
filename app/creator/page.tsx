"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { AnalyticsCard } from "@/components/creator/analytics-card"
import { VideoManagementTable } from "@/components/creator/video-management-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Heart, TrendingUp, Upload, Star } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface CreatorVideo {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  view_count: number
  like_count: number
  created_at: string
  duration: number
}

export default function CreatorDashboard() {
  const { user, profile } = useAuth()
  const [videos, setVideos] = useState<CreatorVideo[]>([])
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalVideos: 0,
    avgRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Redirect if not a creator
  useEffect(() => {
    if (profile && profile.user_type !== "creator") {
      redirect("/dashboard")
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      fetchCreatorData()
    }
  }, [user])

  const fetchCreatorData = async () => {
    try {
      // Fetch creator's videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", user?.id)
        .order("created_at", { ascending: false })

      if (videosError) throw videosError

      setVideos(videosData || [])

      // Calculate analytics
      const totalViews = videosData?.reduce((sum, video) => sum + video.view_count, 0) || 0
      const totalLikes = videosData?.reduce((sum, video) => sum + video.like_count, 0) || 0
      const totalVideos = videosData?.length || 0

      // Fetch average rating
      const { data: ratingsData } = await supabase
        .from("video_ratings")
        .select("rating")
        .in("video_id", videosData?.map((v) => v.id) || [])

      const avgRating = ratingsData?.length ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length : 0

      setAnalytics({
        totalViews,
        totalLikes,
        totalVideos,
        avgRating: Math.round(avgRating * 10) / 10,
      })
    } catch (error) {
      console.error("Error fetching creator data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (videoId: string) => {
    // TODO: Implement video editing
    console.log("Edit video:", videoId)
  }

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", videoId)

      if (error) throw error

      // Refresh data
      fetchCreatorData()
    } catch (error) {
      console.error("Error deleting video:", error)
    }
  }

  const handleViewAnalytics = (videoId: string) => {
    // TODO: Implement detailed analytics view
    console.log("View analytics for:", videoId)
  }

  if (!user || !profile) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </TikTokLayout>
    )
  }

  if (profile.user_type !== "creator") {
    return null
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Creator Studio</h1>
              <p className="text-muted-foreground">Manage your content and track your performance</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Link>
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <AnalyticsCard
              title="Total Views"
              value={analytics.totalViews.toLocaleString()}
              description="All-time video views"
              trend={{ value: 12, isPositive: true }}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            />
            <AnalyticsCard
              title="Total Likes"
              value={analytics.totalLikes.toLocaleString()}
              description="All-time likes received"
              trend={{ value: 8, isPositive: true }}
              icon={<Heart className="h-4 w-4 text-muted-foreground" />}
            />
            <AnalyticsCard
              title="Videos Published"
              value={analytics.totalVideos}
              description="Total content created"
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <AnalyticsCard
              title="Average Rating"
              value={analytics.avgRating || "N/A"}
              description="User ratings average"
              icon={<Star className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Content Management */}
          <Tabs defaultValue="videos" className="space-y-4">
            <TabsList className="bg-card">
              <TabsTrigger value="videos">My Videos</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Video Management</CardTitle>
                  <CardDescription>Manage your uploaded videos, view performance, and make edits</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading videos...</div>
                  ) : videos.length > 0 ? (
                    <VideoManagementTable
                      videos={videos}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewAnalytics={handleViewAnalytics}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-card-foreground">No videos yet</h3>
                      <p className="text-muted-foreground mb-4">Start creating content to see it here</p>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/upload">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Your First Video
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Detailed Analytics</CardTitle>
                  <CardDescription>Coming soon - detailed performance metrics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Advanced analytics features will be available soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Creator Settings</CardTitle>
                  <CardDescription>Manage your creator profile and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">Creator settings panel coming soon</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TikTokLayout>
  )
}
