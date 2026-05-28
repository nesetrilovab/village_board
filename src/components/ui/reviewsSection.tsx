"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface ReviewWithUser {
    id: string;
    rating: number;
    text: string | null;
    created_at: Date | string;
    user_id: string;
    user: {
        name: string;
    };
}

interface ReviewsSectionProps {
    reviews: ReviewWithUser[];
    adId: string;
    currentUserId: string | null;
    isAuthor: boolean;
    onUpdate: () => Promise<void>;
}

export default function ReviewsSection({ reviews, adId, currentUserId, isAuthor, onUpdate }: ReviewsSectionProps) {
    const router = useRouter();
    const [rating, setRating] = useState<number>(1); // Defaultně vybarvená 1 hvězda
    const [text, setText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const hasAlreadyReviewed = reviews.some((r) => r.user_id === currentUserId);

    const showForm = currentUserId && !isAuthor && !hasAlreadyReviewed;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, text, adId }),
            });

            if (res.ok) {
                setText("");
                setRating(1);
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

    const handleDelete = async (reviewId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this review?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await onUpdate();
                router.refresh();
            } else {
                alert("Could not remove this review.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mt-8 space-y-6 border-t pt-6 border-gray-200">
            <h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>

            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-gray-50 space-y-4">
                    <h3 className="font-semibold text-lg">Add review</h3>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                            >
                                {star <= rating ? "★" : "☆"}
                            </button>
                        ))}
                        <span className="text-sm text-gray-500 ml-2">({rating} z 5)</span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Disclose your experience..."
                        className="w-full p-2 border rounded-lg resize-none text-sm h-24 focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : "Send review"}
                    </button>
                </form>
            )}

            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 border rounded-xl p-4 bg-white shadow-inner">
                {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No reviews available.</p>
                ) : (
                    reviews.map((review) => {
                        const isMyReview = review.user_id === currentUserId;

                        return (
                            <div key={review.id} className="p-3 border rounded-lg bg-gray-50 relative group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold">{review.user.name}</p>
                                        <div className="text-amber-500 text-sm">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </div>
                                    </div>

                                    {isMyReview && (
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {review.text && (
                                    <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-gray-100">
                                        {review.text}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}