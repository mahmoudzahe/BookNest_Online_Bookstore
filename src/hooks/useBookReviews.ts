import { useAuth } from "../auth/AuthContext";
import { useReviewEligibility } from "./useReviewEligibility";
import { useReviewEditor } from "./useReviewEditor";
import { useReviewDeletion } from "./useReviewDeletion";
import type { Book, BookReview } from "../types/book";

type Props = {
  book: Book;
  reviews: BookReview[];
  onReviewsChange: (reviews: BookReview[]) => void;
};

export function useBookReviews({ book, reviews, onReviewsChange }: Props) {
  const { user } = useAuth();
  const ownReview = user
    ? reviews.find((review) => review.userId === user.id)
    : undefined;

  const eligibility = useReviewEligibility(user?.id, book.id);
  const editor = useReviewEditor({
    book,
    user,
    hasOrdered: eligibility.hasOrdered,
    onEligibilityLost: () => eligibility.setHasOrdered(false),
    onReviewsChange,
  });
  const deletion = useReviewDeletion({
    book,
    user,
    ownReview,
    onReviewsChange,
  });

  return { user, ownReview, eligibility, editor, deletion };
}
