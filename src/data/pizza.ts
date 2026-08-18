import type { PizzaFlavor, PizzaOption, PizzaSize } from "../types";

export const initialSizes: PizzaSize[] = [
  { id: "broto", name: "Broto", slices: 4, maxFlavors: 1, basePrice: 38, active: true },
  { id: "media", name: "Média", slices: 6, maxFlavors: 2, basePrice: 52, active: true },
  { id: "grande", name: "Grande", slices: 8, maxFlavors: 2, basePrice: 65, active: true },
  { id: "familia", name: "Família", slices: 12, maxFlavors: 3, basePrice: 82, active: true },
];
export const initialFlavors: PizzaFlavor[] = [
  { id: "calabresa", name: "Calabresa", ingredients: "Muçarela, calabresa e orégano", priceBySize: { broto: 38, media: 52, grande: 65, familia: 82 }, active: true },
  { id: "frango-catupiry", name: "Frango com Catupiry", ingredients: "Muçarela, frango e catupiry", priceBySize: { broto: 41, media: 56, grande: 68, familia: 87 }, active: true },
  { id: "marguerita", name: "Marguerita", ingredients: "Muçarela, tomate, manjericão e orégano", priceBySize: { broto: 39, media: 54, grande: 66, familia: 84 }, active: true },
  { id: "quatro-queijos", name: "Quatro Queijos", ingredients: "Muçarela, provolone, parmesão e catupiry", priceBySize: { broto: 44, media: 59, grande: 72, familia: 92 }, active: true },
];
export const initialCrusts: PizzaOption[] = [
  { id: "sem-borda", name: "Sem borda recheada", price: 0, active: true },
  { id: "catupiry", name: "Borda de Catupiry", price: 8, active: true },
  { id: "cheddar", name: "Borda de Cheddar", price: 8, active: true },
  { id: "chocolate", name: "Borda de Chocolate", price: 10, active: true },
];
export const initialExtras: PizzaOption[] = [
  { id: "bacon", name: "Bacon", price: 6, active: true },
  { id: "catupiry-extra", name: "Catupiry extra", price: 5, active: true },
  { id: "queijo-extra", name: "Queijo extra", price: 7, active: true },
];
