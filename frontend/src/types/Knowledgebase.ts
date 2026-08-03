export interface KnowledgebaseArticle {
  id: string;
  companyId: string;
  categoryId: string;
  title: string;
  content: string; // Markdown or HTML
  tags: string[];
  authorId: string;
  viewCount: number;
  helpfulCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
