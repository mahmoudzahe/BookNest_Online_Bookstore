import { useState } from "react";
import { deleteReview, getReviews } from "../services/booksApi";
import type { Book, BookReview } from "../types/book";
import type { AuthUser } from "../types/user";

type Params = {
  book: Book;
  user: AuthUser | null;
  ownReview: BookReview | undefined;
  onReviewsChange: (reviews: BookReview[]) => void;
};

export function useReviewDeletion({
  book,
  user,
  ownReview,
  onReviewsChange,
}: Params) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function removeReview() {
    if (!user || !ownReview || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const latest = await getReviews(book.id);
      const match = latest.find(
        (review) => String(review.id) === String(ownReview.id),
      );
      if (!match || match.userId !== user.id) {
        setDeleteError("Review not found. Refresh the page.");
        return;
      }
      await deleteReview(ownReview.id);
      onReviewsChange(await getReviews(book.id));
      setConfirmDelete(false);
    } catch {
      setDeleteError("Could not delete your review. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return {
    confirmDelete,
    setConfirmDelete,
    deleting,
    deleteError,
    setDeleteError,
    removeReview,
  };
}
