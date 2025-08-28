"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Compass,
  User,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Video,
  Bell,
  Bookmark,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { usePathname } from "next/navigation"

export function TikTokSidebar() {
  const { user, profile, logout } = useAuth()
  const pathname = usePathname()

  if (!user || !profile) return null

  const isActive = (path: string) => pathname === path

  const navigationItems = [
    { href: "/dashboard", icon: Home, label: "For You", active: isActive("/dashboard") },
    { href: "/following", icon: Users, label: "Following", active: isActive("/following") },
    { href: "/explore", icon: Compass, label: "Explore", active: isActive("/explore") },
    { href: "/trending", icon: TrendingUp, label: "Trending", active: isActive("/trending") },
    { href: "/watch", icon: Video, label: "Live", active: isActive("/watch") },
  ]

  const personalItems = [
    { href: "/notifications", icon: Bell, label: "Notifications", active: isActive("/notifications") },
    { href: "/saved", icon: Bookmark, label: "Saved", active: isActive("/saved") },
  ]

  const creatorItems =
    profile.user_type === "creator"
      ? [
          { href: "/upload", icon: Upload, label: "Upload", active: isActive("/upload") },
          { href: "/creator", icon: BarChart3, label: "Creator Studio", active: isActive("/creator") },
        ]
      : []

  return (
    <div className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Video className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden lg:block text-xl font-bold text-sidebar-foreground">VideoShare</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-primary"
                } lg:px-4 px-2`}
              >
                <item.icon className="h-6 w-6 lg:mr-3" />
                <span className="hidden lg:block">{item.label}</span>
              </Button>
            </Link>
          ))}

          {/* Personal Section */}
          <div className="hidden lg:block px-4 py-2">
            <div className="h-px bg-sidebar-border" />
          </div>
          {personalItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-primary"
                } lg:px-4 px-2`}
              >
                <item.icon className="h-6 w-6 lg:mr-3" />
                <span className="hidden lg:block">{item.label}</span>
              </Button>
            </Link>
          ))}

          {creatorItems.length > 0 && (
            <>
              <div className="hidden lg:block px-4 py-2">
                <div className="h-px bg-sidebar-border" />
              </div>
              {creatorItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    className={`w-full justify-start h-12 ${
                      item.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-primary"
                    } lg:px-4 px-2`}
                  >
                    <item.icon className="h-6 w-6 lg:mr-3" />
                    <span className="hidden lg:block">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 lg:px-4 px-2">
              <Avatar className="h-8 w-8 lg:mr-3">
                <AvatarImage src={profile.avatar_url?.trim() || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.display_name || profile.username}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">@{profile.username}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="right">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{profile.display_name || profile.username}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile.user_type}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
