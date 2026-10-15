/** Mensaje del chat público del campus. */
export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
};
