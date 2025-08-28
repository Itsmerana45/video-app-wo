"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Hash, Users, Play, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  creator: string
  thumbnail: string
  views: string
  likes: string
  type: "video" | "user" | "hashtag"
}

const mockTrendingHashtags = ["comedy", "travel", "gaming", "cooking", "music", "dance", "art", "tech"]

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Amazing Sunset Timelapse",
    creator: "naturelover",
    thumbnail: "/sunset-timelapse.png",
    views: "125K",
    likes: "8.2K",
    type: "video",
  },
  {
    id: "2",
    title: "Quick Pasta Recipe",
    creator: "chefmike",
    thumbnail: "/cooking-pasta.png",
    views: "89K",
    likes: "5.1K",
    type: "video",
  },
  {
    id: "3",
    title: "Street Art Tour",
    creator: "artexplorer",
    thumbnail: "/street-art-graffiti.png",
    views: "67K",
    likes: "3.8K",
    type: "video",
  },
  {
    id: "4",
    title: "Gaming Tips & Tricks",
    creator: "progamer",
    thumbnail: "/ultimate-gaming-setup.png",
    views: "156K",
    likes: "12.3K",
    type: "video",
  },
  {
    id: "5",
    title: "Travel Vlog: Tokyo",
    creator: "wanderlust",
    thumbnail: "/vibrant-tokyo-cityscape.png",
    views: "203K",
    likes: "18.7K",
    type: "video",
  },
  {
    id: "6",
    title: "Music Producer",
    creator: "beatmaker",
    thumbnail: "/music-studio.png",
    views: "45K",
    likes: "2.9K",
    type: "user",
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>(mockSearchResults)
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>(mockTrendingHashtags)
  const [isLoading, setIsLoading] = useState(false)
  const [databaseConnected, setDatabaseConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTrendingContent()
  }, [])

  const fetchTrendingContent = async () => {
    try {
      const { data: testData, error: testError } = await supabase.from("videos").select("id").limit(1)

      if (testError) {
        console.log("Database not ready, using mock data:", testError.message)
        setDatabaseConnected(false)
        return
      }

      setDatabaseConnected(true)

      // Fetch trending hashtags
      const { data: tagsData } = await supabase.from("video_tags").select("tag").limit(10)

      const tags = tagsData?.map((t) => t.tag) || []
      if (tags.length > 0) {
        setTrendingHashtags([...new Set(tags)].slice(0, 8))
      }

      // Fetch popular videos for initial display
      const { data: videosData } = await supabase
        .from("videos")
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `)
        .order("view_count", { ascending: false })
        .limit(12)

      const results: SearchResult[] =
        videosData?.map((video) => ({
          id: video.id,
          title: video.title,
          creator: video.profiles?.username || "Unknown",
          thumbnail: video.thumbnail_url || "/placeholder.svg",
          views: video.view_count?.toLocaleString() || "0",
          likes: video.like_count?.toLocaleString() || "0",
          type: "video" as const,
        })) || []

      if (results.length > 0) {
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Error fetching trending content:", error)
      setDatabaseConnected(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      if (!databaseConnected) {
        const filteredResults = mockSearchResults.filter(
          (result) =>
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.creator.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setSearchResults(filteredResults)
        setIsLoading(false)
        return
      }

      // Search videos
      const { data: videosData } = await supabase
        .from("videos")
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(20)

      // Search users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10)

      const videoResults: SearchResult[] =
        videosData?.map((video) => ({
          id: video.id,
          title: video.title,
          creator: video.profiles?.username || "Unknown",
          thumbnail: video.thumbnail_url || "/placeholder.svg",
          views: video.view_count?.toLocaleString() || "0",
          likes: video.like_count?.toLocaleString() || "0",
          type: "video" as const,
        })) || []

      const userResults: SearchResult[] =
        usersData?.map((user) => ({
          id: user.id,
          title: user.display_name || user.username,
          creator: `@${user.username}`,
          thumbnail: user.avatar_url || "/placeholder.svg",
          views: "0", // Could be follower count
          likes: "0",
          type: "user" as const,
        })) || []

      setSearchResults([...videoResults, ...userResults])
    } catch (error) {
      console.error("Error searching:", error)
      const filteredResults = mockSearchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.creator.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filteredResults)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore</h1>
            <p className="text-muted-foreground">Discover trending content and creators</p>
            {!databaseConnected && (
              <div className="mt-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1 rounded-md">
                Using demo data - database not connected
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos, users, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Trending Hashtags */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Trending Hashtags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setSearchQuery(`#${tag}`)
                    handleSearch()
                  }}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((result) => (
              <Card
                key={result.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border-border"
              >
                <div className="relative group">
                  <img
                    src={result.thumbnail || "/placeholder.svg"}
                    alt={result.title}
                    className="w-full h-48 object-cover"
                  />
                  {result.type === "video" ? (
                    <Link
                      href={`/watch?v=${result.id}`}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                        <Play className="h-6 w-6 fill-current" />
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/user/${result.creator.replace("@", "")}`}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                        <Users className="h-6 w-6" />
                      </Button>
                    </Link>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={result.type === "video" ? "default" : "secondary"}>
                      {result.type === "video" ? "Video" : "User"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">{result.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{result.creator}</p>
                  {result.type === "video" && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{result.views} views</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{result.likes}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {searchResults.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {searchQuery ? "No results found" : "Start exploring"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try different keywords or browse trending content"
                  : "Search for videos, users, or hashtags to discover amazing content"}
              </p>
            </div>
          )}
        </div>
      </div>
    </TikTokLayout>
  )
}
