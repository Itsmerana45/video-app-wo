import { TikTokLayout } from "@/components/layout/tiktok-layout"
import { VideoUploadForm } from "@/components/video/video-upload-form"

export default function UploadPage() {
  return (
    <TikTokLayout>
      <div className="h-screen overflow-y-auto bg-background">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload Video</h1>
            <p className="text-muted-foreground">Share your creativity with the world</p>
          </div>
          <VideoUploadForm />
        </div>
      </div>
    </TikTokLayout>
  )
}
