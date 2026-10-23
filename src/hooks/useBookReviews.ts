import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  addReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../services/booksApi";
import { getUserOrders } from "../services/ordersApi";
import type { Book, BookReview } from "../types/book";

type Props = {
  book: Book;
  reviews: BookReview[];
  onReviewsChange: (reviews: BookReview[]) => void;
};

export function useBookReviews({ book, reviews, onReviewsChange }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [checking, setChecking] = useState(false);
  const [editing, setEditing] = useState<BookReview | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!user) {
      setHasOrdered(false);
      return;
    }

    let active = true;
    setChecking(true);
    getUserOrders(user.id)
      .then((orders) => {
        if (active) {
          setHasOrdered(
            orders.some(
              (order) =>
                order.status !== "cancelled" &&
                order.items.some((item) => item.bookId === book.id),
            ),
          );
        }
      })
      .catch(() => {
        if (active) setError("Could not check your orders.");
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [book.id, user?.id]);

  const ownReview = user
    ? reviews.find((review) => review.userId === user.id)
    : undefined;

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
      const [orders, latestReviews] = await Promise.all([
        getUserOrders(user.id),
        getReviews(book.id),
      ]);
      if (
        !orders.some(
          (order) =>
            order.status !== "cancelled" &&
            order.items.some((item) => item.bookId === book.id),
        )
      ) {
        setHasOrdered(false);
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
    user,
    open,
    setOpen,
    rating,
    setRating,
    comment,
    setComment,
    error,
    submitting,
    hasOrdered,
    checking,
    editing,
    ownReview,
    confirmDelete,
    setConfirmDelete,
    deleting,
    deleteError,
    setDeleteError,
    openEditor,
    submitReview,
    removeReview,
  };
}
