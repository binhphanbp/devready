import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tạo số lượt xem ảo ban đầu dựa trên ID của câu hỏi để giao diện trông uy tín hơn.
 * Trả về một số cố định cho mỗi ID trong khoảng 100 - 500.
 */
export function getFakeViewCount(id: string): number {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return 100 + (Math.abs(hash) % 400);
}

/**
 * Tính tổng số lượt xem hiển thị (thực tế + fake)
 */
export function getDisplayViewCount(id: string | undefined, realCount: number = 0): number {
  if (!id) return realCount || 0;
  return getFakeViewCount(id) + (Number(realCount) || 0);
}
