import {
  Alert,
  Avatar,
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
import RouterLink from "./NextLink";
import { useBookReviews } from "../hooks/useBookReviews";
import type { Book, BookReview } from "../types/book";
import { T, useI18n } from "@/i18n/LocaleContext";

type Props = {
  book: Book;
  reviews: BookReview[];
  onReviewsChange: (reviews: BookReview[]) => void;
};

function BookReviews({ book, reviews, onReviewsChange }: Props) {
  const { t } = useI18n();
  const { user, ownReview, eligibility, editor, deletion } = useBookReviews({
    book,
    reviews,
    onReviewsChange,
  });
  const { hasOrdered, checking } = eligibility;
  const {
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
  } = editor;
  const {
    confirmDelete,
    setConfirmDelete,
    deleting,
    deleteError,
    setDeleteError,
    removeReview,
  } = deletion;

  return (
    <Stack spacing={3}>
      <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <Typography
          component="h2"
          variant="h4"
          sx={{ fontWeight: 700 }}
        >
          <T text="Ratings & Reviews" />
        </Typography>
        {!user ? (
          <Button component={RouterLink} href="/login" variant="outlined">
            <T text="Log in to write a review" />
          </Button>
        ) : checking ? (
          <Typography color="text.secondary">
            <T text="Checking your orders..." />
          </Typography>
        ) : ownReview ? (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={!hasOrdered}
              onClick={() => openEditor(ownReview)}
            >
              <T text="Edit your Review" />
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDeleteError("");
                setConfirmDelete(true);
              }}
            >
              <T text="Delete Review" />
            </Button>
          </Stack>
        ) : !hasOrdered ? (
          <Typography color="text.secondary">
            <T text="You can only review books you have ordered." />
          </Typography>
        ) : (
          <Button variant="contained" onClick={() => openEditor()}>
            <T text="Write a Review" />
          </Button>
        )}
      </Stack>
      {eligibility.error && !open && (
        <Alert severity="warning">{eligibility.error}</Alert>
      )}
      {reviews.length === 0 && (
        <Typography color="text.secondary">
          <T text="No reviews yet." />
        </Typography>
      )}
      <Stack spacing={2.5} divider={<Divider flexItem />}>
        {reviews.map((review) => (
          <Stack
            key={review.id}
            direction="row"
            spacing={2}
            sx={{ alignItems: "flex-start" }}
          >
            <Avatar
              sx={{
                bgcolor: "action.selected",
                color: "text.primary",
                width: 40,
                height: 40,
              }}
            >
              {review.userName.trim().charAt(0).toUpperCase() || "R"}
            </Avatar>
            <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {review.userName}
              </Typography>
              <Rating size="small" value={review.rating} readOnly />
              <Typography sx={{ overflowWrap: "anywhere", lineHeight: 1.7 }}>
                {review.comment}
              </Typography>
            </Stack>
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
          {editing ? t("Edit your Review") : t("Review this Book")}
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
            <Typography sx={{ fontWeight: "bold" }}>{book.title}</Typography>
          </Stack>
          <Typography sx={{ mb: 1 }}>
            <T text="Overall Rating" />
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t("Your review")}
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
            <T text="Cancel" />
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={submitReview}
          >
            {submitting
              ? t("Saving...")
              : editing
                ? t("Update Review")
                : t("Submit Review")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <T text="Delete your Review?" />
        </DialogTitle>
        <DialogContent>
          <Typography>
            <T text="Are you sure you want to delete your rating and review?" />
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={deleting} onClick={() => setConfirmDelete(false)}>
            <T text="Cancel" />
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={removeReview}
          >
            {deleting ? t("Deleting...") : t("Delete Review")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default BookReviews;
