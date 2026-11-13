import {
  BOOK_IMAGE_TYPES,
  BOOK_IMAGE_MAX_BYTES,
  BOOK_IMAGE_MAX_WIDTH,
  BOOK_IMAGE_MAX_HEIGHT,
  BOOK_IMAGE_QUALITY,
} from "./constants";

export async function prepareBookCover(file: File): Promise<string> {
  if (!BOOK_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > BOOK_IMAGE_MAX_BYTES) {
    throw new Error("Choose an image smaller than 5 MB.");
  }

  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      BOOK_IMAGE_MAX_WIDTH / bitmap.width,
      BOOK_IMAGE_MAX_HEIGHT / bitmap.height,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", BOOK_IMAGE_QUALITY);
  } catch {
    throw new Error("Could not read the image. Try another file.");
  } finally {
    bitmap?.close();
  }
}
