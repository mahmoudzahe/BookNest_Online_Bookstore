import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { addReview, deleteReview, getReviews, updateReview } from "../services/booksApi";
import { getUserOrders } from "../services/ordersApi";
import type { Book, BookReview } from "../types/book";

type Props = {
  book: Book;
  reviews: BookReview[];
  averageRating: number;
  onReviewsChange: (reviews: BookReview[]) => void;
};

function BookReviews({ book, reviews, averageRating, onReviewsChange }: Props) {
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
          setHasOrdered(orders.some((order) =>
            order.status !== "cancelled" &&
            order.items.some((item) => item.bookId === book.id)
          ));
        }
      })
      .catch(() => {
        if (active) setError("Could not check your orders.");
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => { active = false; };
  }, [book.id, user?.id]);

  const ownReview = user ? reviews.find((review) => review.userId === user.id) : undefined;

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
      if (!orders.some((order) =>
        order.status !== "cancelled" &&
        order.items.some((item) => item.bookId === book.id)
      )) {
        setHasOrdered(false);
        setError("You can only review books you have ordered.");
        return;
      }

      const existing = latestReviews.find((review) => review.userId === user.id);
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
      const match = latest.find((review) => String(review.id) === String(ownReview.id));
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

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Ratings & Reviews
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography color="text.secondary">
          {averageRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </Typography>
      </Stack>
      {!user ? (
        <Button component={RouterLink} to="/login" variant="outlined" sx={{ mb: 3 }}>
          Log in to write a review
        </Button>
      ) : checking ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>Checking your orders...</Typography>
      ) : ownReview ? (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button variant="contained" disabled={!hasOrdered} onClick={() => openEditor(ownReview)}>
            Edit your Review
          </Button>
          <Button variant="outlined" color="error" onClick={() => { setDeleteError(""); setConfirmDelete(true); }}>
            Delete Review
          </Button>
        </Stack>
      ) : !hasOrdered ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You can only review books you have ordered.
        </Typography>
      ) : (
        <Button variant="contained" sx={{ mb: 3 }} onClick={() => openEditor()}>
          Write a Review
        </Button>
      )}
      {error && !open && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {reviews.length === 0 && <Typography color="text.secondary">No reviews yet.</Typography>}
      {reviews.map((review) => (
        <Box key={review.id} sx={{ mb: 2, pb: 2 }}>
          <Rating size="small" value={review.rating} readOnly />
          <Typography>{review.comment}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            by {review.userName}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      <Dialog
        open={open}
        onClose={() => !submitting && setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle>{editing ? "Edit your Review" : "Review this Book"}</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
            <Box component="img" src={book.image} alt={book.title} sx={{ width: 70, height: 95, objectFit: "contain" }} />
            <Typography sx={{ fontWeight: 600 }}>{book.title}</Typography>
          </Stack>
          <Typography sx={{ mb: 1 }}>Overall Rating</Typography>
          <Rating value={rating} onChange={(_, value) => setRating(value)} sx={{ mb: 2 }} />
          <TextField
            label="Your review"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={submitting} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={submitting} onClick={submitReview}>
            {submitting ? "Saving..." : editing ? "Update Review" : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete your Review?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete your rating and review?</Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={deleting} onClick={removeReview}>
            {deleting ? "Deleting..." : "Delete Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookReviews;
