"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Heart, MessageSquare } from "lucide-react";

interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
}

interface CommentFromBackend {
  id: string;
  text: string;
  created_at: Date | string;
  user_id: string;
  parent_id: string | null;
  article_id: string | null;
  event_id: string | null;
  user: {
    name: string;
  };
  likes: CommentLike[];
}

interface CommentsSectionProps {
  comments: CommentFromBackend[];
  postId: string; // ID článku nebo eventu
  postType: "ARTICLE" | "EVENT";
  currentUserId: string | null;
  currentUserRole?: string | null;
  onUpdate: () => Promise<void>;
}

export default function CommentsSection({
  comments,
  postId,
  postType,
  currentUserId,
  currentUserRole,
  onUpdate,
}: CommentsSectionProps) {
  const router = useRouter();
  const [mainText, setMainText] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // ID komentáře, na který se zrovna odpovídá
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const mainComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const textToSend = parentId ? replyText : mainText;

    if (!textToSend.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          articleId: postType === "ARTICLE" ? postId : null,
          eventId: postType === "EVENT" ? postId : null,
          parentId: parentId,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyText("");
          setActiveReplyId(null);
        } else {
          setMainText("");
        }
        await onUpdate();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this comment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await onUpdate();
        router.refresh();
      } else {
        alert("Could not remove this comment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUserId) {
      alert("You must be logged in to like comments.");
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "POST",
      });

      if (res.ok) {
        await onUpdate();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8 space-y-6 border-t pt-6 border-gray-200">
      <h2 className="text-xl font-bold">Comments ({comments.length})</h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {currentUserId ? (
        <form onSubmit={(e) => handleSubmit(e, null)} className="p-4 border rounded-xl bg-gray-50 space-y-3">
          <textarea
            value={mainText}
            onChange={(e) => setMainText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-lg resize-none text-sm h-20 focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !mainText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
          You must be logged in to participate in the discussion.
        </p>
      )}

      <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 border rounded-xl p-4 bg-white shadow-inner">
        {mainComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          mainComments.map((comment) => {
            const isMyComment = comment.user_id === currentUserId;
            const isAdmin = currentUserRole === "ADMIN";
            const isLikedByMe = comment.likes.some((l) => l.user_id === currentUserId);
            
            const commentReplies = replies.filter((r) => r.parent_id === comment.id);

            return (
              <div key={comment.id} className="space-y-3 border-b pb-3 border-gray-100 last:border-0 last:pb-0">
                
                <div className="p-3 border rounded-lg bg-gray-50 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">{comment.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center space-x-1 p-1 rounded hover:bg-gray-200 transition-colors text-xs ${
                          isLikedByMe ? "text-red-500 font-semibold" : "text-gray-400"
                        }`}
                        title={isLikedByMe ? "Unlike" : "Like"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? "fill-current" : ""}`} />
                        <span>{comment.likes.length}</span>
                      </button>

                      {currentUserId && (
                        <button
                          onClick={() => {
                            setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                            setReplyText("");
                          }}
                          className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                          title="Reply"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(isMyComment || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-gray-100">
                    {comment.text}
                  </p>
                </div>

                {activeReplyId === comment.id && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="ml-8 p-3 border rounded-lg bg-blue-50/50 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-2 border rounded-md resize-none text-xs h-16 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={isLoading || !replyText.trim()}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {commentReplies.length > 0 && (
                  <div className="ml-8 space-y-2 border-l-2 border-gray-100 pl-4">
                    {commentReplies.map((reply) => {
                      const isMyReply = reply.user_id === currentUserId;
                      const isReplyLikedByMe = reply.likes.some((l) => l.user_id === currentUserId);

                      return (
                        <div key={reply.id} className="p-2.5 border rounded-lg bg-gray-50/60 relative group text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">{reply.user.name}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleLike(reply.id)}
                                className={`flex items-center space-x-1 p-0.5 rounded hover:bg-gray-200 transition-colors ${
                                  isReplyLikedByMe ? "text-red-500 font-semibold" : "text-gray-400"
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${isReplyLikedByMe ? "fill-current" : ""}`} />
                                <span className="text-[10px]">{reply.likes.length}</span>
                              </button>

                              {(isMyReply || isAdmin) && (
                                <button
                                  onClick={() => handleDelete(reply.id)}
                                  className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mt-1.5 bg-white p-2 rounded border border-gray-50">
                            {reply.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}