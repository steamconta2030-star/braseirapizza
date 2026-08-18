export type Category = {
  id: string;
  name: string;
  active: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
};
