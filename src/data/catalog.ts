import type { Category, Product } from "../types";

export const initialCategories: Category[] = [
  { id: "pizzas", name: "Pizzas", active: true },
  { id: "combos", name: "Combos", active: true },
  { id: "bebidas", name: "Bebidas", active: true },
];

export const initialProducts: Product[] = [
  {
    id: "pizza-calabresa",
    categoryId: "pizzas",
    name: "Pizza de Calabresa",
    description: "Molho artesanal, muçarela, calabresa e orégano.",
    price: 65,
    imageUrl: "",
    active: true,
  },
  {
    id: "pizza-frango",
    categoryId: "pizzas",
    name: "Pizza de Frango com Catupiry",
    description: "Molho artesanal, muçarela, frango e catupiry.",
    price: 68,
    imageUrl: "",
    active: true,
  },
  {
    id: "refri-2l",
    categoryId: "bebidas",
    name: "Refrigerante 2 litros",
    description: "Escolha o sabor disponível.",
    price: 14,
    imageUrl: "",
    active: true,
  },
];
