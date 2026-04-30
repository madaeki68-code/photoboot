export interface Project {
  id: string;
  title: string;
  location: string;
  mainImg: string;
  tag: string;
  description?: string;
  detailImages: string[];
  order: number;
}
