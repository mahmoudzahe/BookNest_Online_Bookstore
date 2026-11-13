import { useState } from "react";
import { addReview, getReviews, updateReview } from "../services/booksApi";
import { hasPurchasedBook } from "./useReviewEligibility";
import type { Book, BookReview } from "../types/book";
import type { AuthUser } from "../types/user";
import { translateInBrowser } from "@/i18n/translation";

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

  function validateExistingReview(
    existing: BookReview | undefined,
  ): string | null {
    if (editing) {
      return !existing || String(existing.id) !== String(editing.id)
        ? "Your review could not be found. Refresh the page."
        : null;
    }

    return existing ? "You have already reviewed this book." : null;
  }

  async function saveReview(
    currentUser: AuthUser,
    reviewRating: number,
    reviewComment: string,
  ) {
    if (editing) {
      await updateReview(editing.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      return;
    }

    await addReview({
      bookId: book.id,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      rating: reviewRating,
      comment: reviewComment,
    });
  }

  function resetEditor() {
    setOpen(false);
    setEditing(null);
    setComment("");
    setRating(0);
  }

  async function submitReview() {
    if (!user || !hasOrdered || submitting) return;

    const reviewRating = rating;
    const reviewComment = comment.trim();
    if (!reviewRating || !reviewComment) {
      setError(translateInBrowser("Choose a rating and write a review."));
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
        setError(translateInBrowser("You can only review books you have ordered."));
        return;
      }

      const existing = latestReviews.find(
        (review) => review.userId === user.id,
      );

      const validationError = validateExistingReview(existing);
      if (validationError) {
        setError(translateInBrowser(validationError));
        return;
      }

      await saveReview(user, reviewRating, reviewComment);
      onReviewsChange(await getReviews(book.id));
      resetEditor();
    } catch {
      setError(translateInBrowser("Could not save your review. Try again."));
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
