import { useEffect, useState } from "react";
import { initialCategories, initialProducts } from "../data/catalog";
import { initialZones } from "../data/delivery";
import { initialCrusts, initialExtras, initialFlavors, initialSizes } from "../data/pizza";
import { supabase } from "../lib/supabase";
import type { Category, DeliveryZone, PizzaFlavor, PizzaOption, PizzaSize, Product } from "../types";

type MenuData = {
  categories: Category[];
  products: Product[];
  sizes: PizzaSize[];
  flavors: PizzaFlavor[];
  crusts: PizzaOption[];
  extras: PizzaOption[];
  zones: DeliveryZone[];
  online: boolean;
};

const fallback: MenuData = {
  categories: initialCategories,
  products: initialProducts,
  sizes: initialSizes,
  flavors: initialFlavors,
  crusts: initialCrusts,
  extras: initialExtras,
  zones: initialZones,
  online: false,
};

export function useOnlineMenu() {
  const [data, setData] = useState<MenuData>(fallback);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    async function load() {
      const [categoriesResult, productsResult, sizesResult, flavorsResult, pricesResult, optionsResult, zonesResult] = await Promise.all([
        supabase!.from("categories").select("id,name,active").order("position"),
        supabase!.from("products").select("id,category_id,name,description,price,image_path,active").order("position"),
        supabase!.from("pizza_sizes").select("id,name,slices,max_flavors,base_price,active").order("position"),
        supabase!.from("pizza_flavors").select("id,name,ingredients,active").order("position"),
        supabase!.from("pizza_flavor_prices").select("flavor_id,size_id,price"),
        supabase!.from("pizza_options").select("id,type,name,price,active").order("position"),
        supabase!.from("delivery_zones").select("id,neighborhood,fee,eta_minutes,active").order("neighborhood"),
      ]);

      const failed = [categoriesResult, productsResult, sizesResult, flavorsResult, pricesResult, optionsResult, zonesResult]
        .find((result) => result.error);
      if (failed?.error) throw failed.error;

      const categories: Category[] = (categoriesResult.data ?? []).map((row) => ({ id: row.id, name: row.name, active: row.active }));
      const products: Product[] = (productsResult.data ?? []).map((row) => ({
        id: row.id,
        categoryId: row.category_id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        imageUrl: row.image_path ? supabase!.storage.from("product-images").getPublicUrl(row.image_path).data.publicUrl : "",
        active: row.active,
      }));
      const sizes: PizzaSize[] = (sizesResult.data ?? []).map((row) => ({
        id: row.id, name: row.name, slices: row.slices, maxFlavors: row.max_flavors, basePrice: Number(row.base_price), active: row.active,
      }));
      const prices = pricesResult.data ?? [];
      const flavors: PizzaFlavor[] = (flavorsResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        ingredients: row.ingredients,
        active: row.active,
        priceBySize: Object.fromEntries(prices.filter((price) => price.flavor_id === row.id).map((price) => [price.size_id, Number(price.price)])),
      }));
      const crusts: PizzaOption[] = (optionsResult.data ?? []).filter((row) => row.type === "crust").map((row) => ({ id: row.id, name: row.name, price: Number(row.price), active: row.active }));
      const extras: PizzaOption[] = (optionsResult.data ?? []).filter((row) => row.type === "extra").map((row) => ({ id: row.id, name: row.name, price: Number(row.price), active: row.active }));
      const zones: DeliveryZone[] = (zonesResult.data ?? []).map((row) => ({ id: row.id, neighborhood: row.neighborhood, fee: Number(row.fee), etaMinutes: row.eta_minutes, active: row.active }));

      if (active) setData({ categories, products, sizes, flavors, crusts, extras, zones, online: true });
    }

    load().catch((error) => console.error("Não foi possível carregar o cardápio online.", error));
    return () => { active = false; };
  }, []);

  return data;
}
