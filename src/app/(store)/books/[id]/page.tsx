import type { Metadata } from "next";
import BookDetails from "@/views/BookDetails";
import { getBook } from "@/services/booksApi";
import { cookies } from "next/headers";
import { isLocale, translate } from "@/i18n/translation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const value = (await cookies()).get("booknest-locale")?.value;
  const locale = isLocale(value) ? value : "en";

  try {
    const book = await getBook(id);
    const title = `${book.title} | BookNest`;
    const description = translate(locale, book.description);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(book.image?.startsWith("https://")
          ? {
              images: [
                {
                  url: book.image,
                  alt:
                    locale === "ar"
                      ? `غلاف ${book.title}`
                      : `${book.title} cover`,
                },
              ],
            }
          : {}),
      },
    };
  } catch {
    return {
      title:
        locale === "ar"
          ? "تفاصيل الكتاب | BookNest"
          : "Book Details | BookNest",
      description:
        locale === "ar"
          ? "اكتشف الكتب وتفاصيلها على BookNest."
          : "Explore books and their details on BookNest.",
    };
  }
}

export default function Page() {
  return <BookDetails />;
}
