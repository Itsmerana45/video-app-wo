"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Reply, ThumbsUp, ThumbsDown } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface Comment {
  id: number
  user: {
    username: string
    avatar?: string
  }
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies?: Comment[]
  isLiked?: boolean
  isDisliked?: boolean
}

interface CommentsSectionProps {
  videoId: number
  comments: Comment[]
}

export function CommentsSection({ videoId, comments: initialComments }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Date.now(),
      user: {
        username: user.username,
        avatar: user.avatar,
      },
      content: newComment,
      timestamp: "just now",
      likes: 0,
      dislikes: 0,
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleSubmitReply = (parentId: number) => {
    if (!replyContent.trim() || !user) return

    const reply: Comment = {
      id: Date.now(),
      user: {
        username: user.username,
        avatar: user.avatar,
      },
      content: replyContent,
      timestamp: "just now",
      likes: 0,
      dislikes: 0,
    }

    setComments(
      comments.map((comment) =>
        comment.id === parentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), reply],
            }
          : comment,
      ),
    )

    setReplyContent("")
    setReplyingTo(null)
  }

  const handleLikeComment = (commentId: number, isReply = false, parentId?: number) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                        dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes,
                        isLiked: !reply.isLiked,
                        isDisliked: false,
                      }
                    : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
                isLiked: !comment.isLiked,
                isDisliked: false,
              }
            : comment,
        ),
      )
    }
  }

  const handleDislikeComment = (commentId: number, isReply = false, parentId?: number) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes,
                        isDisliked: !reply.isDisliked,
                        isLiked: false,
                      }
                    : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes,
                isDisliked: !comment.isDisliked,
                isLiked: false,
              }
            : comment,
        ),
      )
    }
  }

  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: { comment: Comment; isReply?: boolean; parentId?: number }) => (
    <div className={`flex space-x-3 ${isReply ? "ml-12 mt-3" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
        <AvatarFallback>{comment.user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.user.username || "Unknown User"}</span>
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLikeComment(comment.id, isReply, parentId)}
            className={`h-auto p-1 ${comment.isLiked ? "text-primary" : "text-muted-foreground"}`}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            {comment.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDislikeComment(comment.id, isReply, parentId)}
            className={`h-auto p-1 ${comment.isDisliked ? "text-destructive" : "text-muted-foreground"}`}
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            {comment.dislikes}
          </Button>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="h-auto p-1 text-muted-foreground"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>
        {replyingTo === comment.id && (
          <div className="flex space-x-2 mt-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px]"
            />
            <div className="flex flex-col space-y-1">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                Reply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

        {/* Add Comment Form */}
        {user && (
          <div className="flex space-x-3 mb-6">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  )
}
