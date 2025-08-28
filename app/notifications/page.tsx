"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, MessageCircle, UserPlus, Play, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "video_upload"
  message: string
  fromUser: string
  fromUserAvatar: string
  videoId?: string
  videoThumbnail?: string
  createdAt: string
  isRead: boolean
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      // This would typically come from a notifications table
      // For now, we'll simulate notifications based on recent activity
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "like",
          message: "liked your video",
          fromUser: "john_doe",
          fromUserAvatar: "/placeholder.svg",
          videoId: "video1",
          videoThumbnail: "/placeholder.svg",
          createdAt: "2 hours ago",
          isRead: false,
        },
        {
          id: "2",
          type: "comment",
          message: "commented on your video: 'Amazing content!'",
          fromUser: "jane_smith",
          fromUserAvatar: "/placeholder.svg",
          videoId: "video2",
          videoThumbnail: "/placeholder.svg",
          createdAt: "4 hours ago",
          isRead: false,
        },
        {
          id: "3",
          type: "follow",
          message: "started following you",
          fromUser: "creator_mike",
          fromUserAvatar: "/placeholder.svg",
          createdAt: "1 day ago",
          isRead: true,
        },
        {
          id: "4",
          type: "video_upload",
          message: "uploaded a new video",
          fromUser: "trending_creator",
          fromUserAvatar: "/placeholder.svg",
          videoId: "video3",
          videoThumbnail: "/placeholder.svg",
          createdAt: "2 days ago",
          isRead: true,
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />
      case "video_upload":
        return <Play className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Stay updated with your latest activity</p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No notifications yet</h3>
              <p className="text-muted-foreground">When people interact with your content, you'll see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md ${
                    !notification.isRead ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                      {/* User Avatar */}
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage
                          src={notification.fromUserAvatar || "/placeholder.svg"}
                          alt={notification.fromUser}
                        />
                        <AvatarFallback>{notification.fromUser.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-card-foreground">
                              <span className="font-semibold">@{notification.fromUser}</span>{" "}
                              <span>{notification.message}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
                          </div>

                          {/* Video Thumbnail (if applicable) */}
                          {notification.videoThumbnail && (
                            <div className="flex-shrink-0 ml-3">
                              <img
                                src={notification.videoThumbnail || "/placeholder.svg"}
                                alt="Video thumbnail"
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
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
