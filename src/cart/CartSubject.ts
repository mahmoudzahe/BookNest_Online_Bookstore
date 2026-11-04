import type { CartItem } from "../types/cart";

type CartObserver = (items: CartItem[]) => void;

class CartSubject {
  private observers = new Set<CartObserver>();
  private currentItems: CartItem[] = [];

  subscribe(observer: CartObserver): () => void {
    this.observers.add(observer);
    observer(this.currentItems);

    return () => {
      this.observers.delete(observer);
    };
  }

  notify(items: CartItem[]): void {
    this.currentItems = items;

    this.observers.forEach((observer) => {
      observer(items);
    });
  }
}

export const cartSubject = new CartSubject();
