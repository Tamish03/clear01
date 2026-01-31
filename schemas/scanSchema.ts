import { z } from "zod";

export const scanSchema = z.object({
  url: z.string().url({ message: "Invalid URL provided" }),
  contentSnippet: z.string().max(1000, "Snippet too long").optional(), // The text the extension scraped
});