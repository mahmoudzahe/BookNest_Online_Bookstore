export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  featured: boolean;
  rating: number;
  image: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  userName: string;
  userId?: string;
  rating: number;
  comment: string;
}
