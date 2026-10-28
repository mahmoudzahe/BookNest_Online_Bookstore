import type { Metadata } from "next";
import BookDetails from "@/views/BookDetails";
import { getBook } from "@/services/booksApi";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const book = await getBook(id);
    const title = `${book.title} | BookNest`;
    const description = book.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(book.image?.startsWith("https://")
          ? { images: [{ url: book.image, alt: `${book.title} cover` }] }
          : {}),
      },
    };
  } catch {
    return {
      title: "Book Details | BookNest",
      description: "Explore books and their details on BookNest.",
    };
  }
}

export default function Page() {
  return <BookDetails />;
}
