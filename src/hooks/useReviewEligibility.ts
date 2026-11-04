import { useEffect, useState } from "react";
import { getUserOrders } from "../services/ordersApi";

export async function hasPurchasedBook(userId: string, bookId: string) {
  const orders = await getUserOrders(userId);
  return orders.some(
    (order) =>
      order.status !== "cancelled" &&
      order.items.some((item) => item.bookId === bookId),
  );
}

export function useReviewEligibility(
  userId: string | undefined,
  bookId: string,
) {
  const [hasOrdered, setHasOrdered] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setHasOrdered(false);
      setChecking(false);
      setError("");
      return;
    }

    let active = true;
    setChecking(true);
    setError("");
    hasPurchasedBook(userId, bookId)
      .then((eligible) => {
        if (active) setHasOrdered(eligible);
      })
      .catch(() => {
        if (active) {
          setHasOrdered(false);
          setError("Could not check your orders.");
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [userId, bookId]);

  return { hasOrdered, checking, error, setHasOrdered };
}
