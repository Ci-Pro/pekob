export interface Video {
  id: string;
  title: string;
  description: string | null;
  category: string;
  videoUrl: string;
  videoSource: string;  // "upload" or "embed"
  thumbnailUrl: string;
  duration: string | null;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
