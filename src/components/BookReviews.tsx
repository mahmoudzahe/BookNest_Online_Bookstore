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
import { useBookReviews } from "../hooks/useBookReviews";
import type { Book, BookReview } from "../types/book";

type Props = {
  book: Book;
  reviews: BookReview[];
  onReviewsChange: (reviews: BookReview[]) => void;
};

function BookReviews({ book, reviews, onReviewsChange }: Props) {
  const {
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
  } = useBookReviews({ book, reviews, onReviewsChange });

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
        <Typography variant="h5">
          <strong>Ratings & Reviews</strong>
        </Typography>
        {!user ? (
          <Button component={RouterLink} to="/login" variant="outlined">
            Log in to write a review
          </Button>
        ) : checking ? (
          <Typography color="text.secondary">
            Checking your orders...
          </Typography>
        ) : ownReview ? (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={!hasOrdered}
              onClick={() => openEditor(ownReview)}
            >
              Edit your Review
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDeleteError("");
                setConfirmDelete(true);
              }}
            >
              Delete Review
            </Button>
          </Stack>
        ) : !hasOrdered ? (
          <Typography color="text.secondary">
            You can only review books you have ordered.
          </Typography>
        ) : (
          <Button variant="contained" onClick={() => openEditor()}>
            Write a Review
          </Button>
        )}
      </Stack>
      {error && !open && <Alert severity="warning">{error}</Alert>}
      {reviews.length === 0 && (
        <Typography color="text.secondary">No reviews yet.</Typography>
      )}
      <Stack spacing={2} divider={<Divider flexItem />}>
        {reviews.map((review) => (
          <Stack key={review.id} spacing={1}>
            <Rating size="small" value={review.rating} readOnly />
            <Typography>{review.comment}</Typography>
            <Typography variant="body2" color="text.secondary">
              by {review.userName}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Dialog
        open={open}
        onClose={() => !submitting && setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle>
          {editing ? "Edit your Review" : "Review this Book"}
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", mb: 3 }}
          >
            <Box
              component="img"
              src={book.image}
              alt={book.title}
              sx={{ width: 70, height: 95, objectFit: "contain" }}
            />
            <Typography>
              <strong>{book.title}</strong>
            </Typography>
          </Stack>
          <Typography sx={{ mb: 1 }}>Overall Rating</Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Your review"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={submitting} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={submitReview}
          >
            {submitting
              ? "Saving..."
              : editing
                ? "Update Review"
                : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete your Review?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your rating and review?
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={deleting} onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={removeReview}
          >
            {deleting ? "Deleting..." : "Delete Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default BookReviews;
