export type Item = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  merchant: string;
  category: string;
};

export type Fit = {
  id: string;
  name: string;
  itemIds: string[];
};

export type Poll = {
  id: string;
  authorId: string;
  description: string;
  fitA: Fit;
  fitB: Fit;
  createdAt: number;
  status: "open" | "closed";
  votes: { A: number; B: number };
  voters: Record<string, "A" | "B">;
};

export type SavedEntry = {
  // poll id
  id: string;
  authorId: string;
  fit: Fit;
  savedAt: number;
};
