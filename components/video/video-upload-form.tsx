"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileVideo, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface VideoFile {
  file: File
  preview: string
  duration?: number
}

export function VideoUploadForm() {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [needsStorageSetup, setNeedsStorageSetup] = useState(false)
  const [isSettingUpStorage, setIsSettingUpStorage] = useState(false)
  const [storageSetupMessage, setStorageSetupMessage] = useState("")
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find((file) => file.type.startsWith("video/"))

    if (videoFile) {
      handleVideoFile(videoFile)
    }
  }, [])

  const handleVideoFile = (file: File) => {
    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File size must be less than 100MB")
      setUploadStatus("error")
      return
    }

    const preview = URL.createObjectURL(file)
    setVideoFile({ file, preview })
    setUploadStatus("idle")
    setErrorMessage("")
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      handleVideoFile(file)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleStorageSetup = async () => {
    setIsSettingUpStorage(true)
    setStorageSetupMessage("")

    try {
      console.log("[v0] Starting storage setup...")
      const response = await fetch("/api/setup-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      console.log("[v0] Storage setup result:", result)

      if (result.success) {
        setStorageSetupMessage("Storage bucket created successfully! You can now upload videos.")
        setNeedsStorageSetup(false)
        setUploadStatus("idle")
        setErrorMessage("")
      } else {
        setStorageSetupMessage(`Setup failed: ${result.details || result.error}`)
      }
    } catch (error) {
      console.error("[v0] Storage setup error:", error)
      setStorageSetupMessage(`Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSettingUpStorage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile || !title.trim()) return

    console.log("[v0] Starting upload process")
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage("")
    setNeedsStorageSetup(false)
    setStorageSetupMessage("")

    try {
      const formData = new FormData()
      formData.append("file", videoFile.file)
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("tags", tags.join(","))

      console.log("[v0] Sending upload request")

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      let result
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        // Handle non-JSON responses (likely error pages)
        const text = await response.text()
        console.log("[v0] Non-JSON response received:", text.substring(0, 200))
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }

      console.log("[v0] Upload response:", result)

      if (!response.ok) {
        if (result.action === "run_storage_script" || result.action === "manual_setup_required") {
          setNeedsStorageSetup(true)
        }
        throw new Error(result.details || result.error || "Upload failed")
      }

      console.log("[v0] Upload successful")
      setUploadStatus("success")

      // Reset form after successful upload
      setTimeout(() => {
        removeVideo()
        setTitle("")
        setDescription("")
        setTags([])
        setUploadProgress(0)
        setUploadStatus("idle")
        router.push("/dashboard") // Redirect to dashboard
      }, 2000)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Upload failed")
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  const removeVideo = () => {
    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview)
      setVideoFile(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Upload Your Video</CardTitle>
          <CardDescription>Share your creativity with the world</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!videoFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Drop your video here</p>
                  <p className="text-muted-foreground">or click to browse (max 100MB)</p>
                </div>
                <input type="file" accept="video/*" onChange={handleFileInput} className="hidden" id="video-upload" />
                <Button asChild variant="outline">
                  <label htmlFor="video-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video src={videoFile.preview} controls className="w-full h-64 object-contain" />
                <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeVideo}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileVideo className="h-4 w-4" />
                <span>{videoFile.file.name}</span>
                <span>({(videoFile.file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
            </div>
          )}

          {uploadStatus === "error" && errorMessage && (
            <div className="space-y-3">
              <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">Upload Failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{errorMessage}</p>
                </div>
              </div>

              {needsStorageSetup && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium">Storage Setup Required</p>
                      <p className="text-sm text-blue-700 mt-1">
                        The video storage bucket needs to be configured. Click the button below to set it up
                        automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleStorageSetup}
                      disabled={isSettingUpStorage}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      {isSettingUpStorage ? "Setting up storage..." : "Setup Storage Automatically"}
                    </Button>

                    {storageSetupMessage && (
                      <div
                        className={`p-2 rounded text-sm ${
                          storageSetupMessage.includes("successfully")
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {storageSetupMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Video uploaded successfully! Redirecting...</span>
            </div>
          )}

          {videoFile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video a catchy title"
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (max 10)</Label>
                <div className="flex space-x-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    disabled={isUploading || tags.length >= 10}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    disabled={isUploading || tags.length >= 10 || !currentTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X className="h-3 w-3 ml-1" onClick={() => !isUploading && removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || !title.trim() || uploadStatus === "success"}
              >
                {isUploading ? "Uploading..." : uploadStatus === "success" ? "Upload Complete!" : "Upload Video"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
