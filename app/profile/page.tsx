"use client"

import { useState, useEffect } from "react"
import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { User, Mail, Calendar, Edit3, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      await refreshProfile()
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      })
    }
    setIsEditing(false)
  }

  if (!user || !profile) {
    return (
      <TikTokLayout>
        <div className="h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </TikTokLayout>
    )
  }

  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        isEditing
                          ? formData.avatar_url?.trim() || "/placeholder.svg"
                          : profile.avatar_url?.trim() || "/placeholder.svg"
                      }
                      alt={profile.username}
                    />
                    <AvatarFallback className="text-lg">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {profile.display_name || profile.username}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">{profile.user_type}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-card-foreground">
                      Username
                    </Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input id="username" value={profile.username} disabled className="bg-muted" />
                    </div>
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-card-foreground">
                      Email
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={profile.email} disabled className="bg-muted" />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="display_name" className="text-card-foreground">
                      Display Name
                    </Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your display name"
                      className="bg-input"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-card-foreground">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="bg-input"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="avatar_url" className="text-card-foreground">
                      Avatar URL
                    </Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-input"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-card-foreground">Member Since</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input value={new Date(profile.created_at).toLocaleDateString()} disabled className="bg-muted" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TikTokLayout>
  )
}
