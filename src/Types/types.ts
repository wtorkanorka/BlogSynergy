export interface IPost {
  id: string;
  title: string;
  publishedAt: string;
  views: number;
  tags: string[];
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  content: string;
  isPrivate: boolean;
  whitelist: any;
  comments: {
    id: string;
    userId: string;
    authorFirstName: string;
    authorLastName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
