import { AI_MODELS } from "@/lib/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAllModelUrls = () => {
  const urls = AI_MODELS.map(model => {
    const baseUrlObj = new URL(model.baseUrl);
    return `${baseUrlObj.protocol}//${baseUrlObj.hostname}/*`;
  });
  return [...new Set(urls)];
};
