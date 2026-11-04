import { useState } from "react";
import { addReview, getReviews, updateReview } from "../services/booksApi";
import { hasPurchasedBook } from "./useReviewEligibility";
import type { Book, BookReview } from "../types/book";
import type { AuthUser } from "../types/user";

type Params = {
  book: Book;
  user: AuthUser | null;
  hasOrdered: boolean;
  onEligibilityLost: () => void;
  onReviewsChange: (reviews: BookReview[]) => void;
};

export function useReviewEditor({
  book,
  user,
  hasOrdered,
  onEligibilityLost,
  onReviewsChange,
}: Params) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<BookReview | null>(null);

  function openEditor(review: BookReview | null = null) {
    setEditing(review);
    setRating(review?.rating ?? 0);
    setComment(review?.comment ?? "");
    setError("");
    setOpen(true);
  }

  async function submitReview() {
    if (!user || !hasOrdered || submitting) return;
    if (!rating || !comment.trim()) {
      setError("Choose a rating and write a review.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const [eligible, latestReviews] = await Promise.all([
        hasPurchasedBook(user.id, book.id),
        getReviews(book.id),
      ]);
      if (!eligible) {
        onEligibilityLost();
        setError("You can only review books you have ordered.");
        return;
      }
      const existing = latestReviews.find(
        (review) => review.userId === user.id,
      );
      if (editing) {
        if (!existing || String(existing.id) !== String(editing.id)) {
          setError("Your review could not be found. Refresh the page.");
          return;
        }
        await updateReview(editing.id, { rating, comment: comment.trim() });
      } else {
        if (existing) {
          setError("You have already reviewed this book.");
          return;
        }
        await addReview({
          bookId: book.id,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          rating,
          comment: comment.trim(),
        });
      }
      onReviewsChange(await getReviews(book.id));
      setOpen(false);
      setEditing(null);
      setComment("");
      setRating(0);
    } catch {
      setError("Could not save your review. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    open,
    setOpen,
    rating,
    setRating,
    comment,
    setComment,
    error,
    submitting,
    editing,
    openEditor,
    submitReview,
  };
}
