import { Photo } from "./Photo";

export interface Post {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  images: Photo[];
}
