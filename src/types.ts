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

export type PizzaSize = { id: string; name: string; slices: number; maxFlavors: number; basePrice: number; active: boolean };
export type PizzaFlavor = { id: string; name: string; ingredients: string; priceBySize: Record<string, number>; active: boolean };
export type PizzaOption = { id: string; name: string; price: number; active: boolean };
