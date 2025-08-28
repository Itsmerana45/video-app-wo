"use client"

import { useState } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Shield, Eye } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    uploads: false,
    email: true,
    push: true,
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showActivity: false,
    allowMessages: true,
    showInSearch: true,
  })

  const [preferences, setPreferences] = useState({
    autoplay: true,
    hd: false,
    captions: false,
    darkMode: true,
  })

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>
            <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle className="text-card-foreground">Notifications</CardTitle>
                </div>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="likes" className="text-card-foreground">
                    Likes on your videos
                  </Label>
                  <Switch
                    id="likes"
                    checked={notifications.likes}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, likes: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments" className="text-card-foreground">
                    Comments on your videos
                  </Label>
                  <Switch
                    id="comments"
                    checked={notifications.comments}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, comments: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="follows" className="text-card-foreground">
                    New followers
                  </Label>
                  <Switch
                    id="follows"
                    checked={notifications.follows}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, follows: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="uploads" className="text-card-foreground">
                    New uploads from followed creators
                  </Label>
                  <Switch
                    id="uploads"
                    checked={notifications.uploads}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, uploads: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-card-foreground">
                    Email notifications
                  </Label>
                  <Switch
                    id="email"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="text-card-foreground">
                    Push notifications
                  </Label>
                  <Switch
                    id="push"
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-card-foreground">Privacy & Safety</CardTitle>
                </div>
                <CardDescription>Control who can see your content and interact with you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public" className="text-card-foreground">
                    Public profile
                  </Label>
                  <Switch
                    id="public"
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, publicProfile: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="activity" className="text-card-foreground">
                    Show activity status
                  </Label>
                  <Switch
                    id="activity"
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showActivity: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="messages" className="text-card-foreground">
                    Allow direct messages
                  </Label>
                  <Switch
                    id="messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowMessages: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="search" className="text-card-foreground">
                    Show in search results
                  </Label>
                  <Switch
                    id="search"
                    checked={privacy.showInSearch}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showInSearch: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Preferences */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle className="text-card-foreground">Video Preferences</CardTitle>
                </div>
                <CardDescription>Customize your video viewing experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoplay" className="text-card-foreground">
                    Autoplay videos
                  </Label>
                  <Switch
                    id="autoplay"
                    checked={preferences.autoplay}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoplay: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hd" className="text-card-foreground">
                    Play in HD when available
                  </Label>
                  <Switch
                    id="hd"
                    checked={preferences.hd}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, hd: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="captions" className="text-card-foreground">
                    Show captions by default
                  </Label>
                  <Switch
                    id="captions"
                    checked={preferences.captions}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, captions: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="text-card-foreground">
                    Dark mode
                  </Label>
                  <Switch
                    id="darkMode"
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, darkMode: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </TikTokLayout>
  )
}
