import { LoginForm } from "@/components/auth/login-form"
import { Video, Play, Heart, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4">
              <Video className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">VideoShare</h1>
          </div>
          <p className="text-2xl text-muted-foreground mb-4">
            Discover and share amazing videos from creators around the world
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Join millions of creators and viewers in the ultimate video sharing experience
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border">
              <Play className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Endless Discovery</h3>
              <p className="text-sm text-muted-foreground text-center">
                Scroll through an infinite feed of engaging content tailored to your interests
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Connect & Engage</h3>
              <p className="text-sm text-muted-foreground text-center">
                Like, comment, and share your favorite videos with the community
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Create & Share</h3>
              <p className="text-sm text-muted-foreground text-center">
                Upload your own content and build your audience of followers
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
