import { uploadImage } from "./imageApi";

export async function uploadTicketAttachments(
  files: File[],
): Promise<string[]> {
  const uploaded = await Promise.all(files.map((file) => uploadImage(file)));
  return uploaded.map((response) => {
    const url = response.data?.url;
    if (!url) throw new Error("An attachment upload returned no URL.");
    return url;
  });
}
