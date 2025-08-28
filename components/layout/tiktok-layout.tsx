"use client"

import type React from "react"

import { TikTokSidebar } from "@/components/navigation/tiktok-sidebar"
import { useAuth } from "@/components/auth/auth-provider"

interface TikTokLayoutProps {
  children: React.ReactNode
}

export function TikTokLayout({ children }: TikTokLayoutProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      <TikTokSidebar />
      <main className="flex-1 ml-20 lg:ml-64">{children}</main>
    </div>
  )
}
