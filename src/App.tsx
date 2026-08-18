import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Banknote, Bike, ChefHat, ClipboardList, Cloud, CookingPot, Database, Eye, EyeOff, Flame, LayoutDashboard, PackagePlus, Pizza, Search, Store, Tags } from "lucide-react";
import PizzaSettings from "./components/PizzaSettings";
import PublicMenu from "./components/PublicMenu";
import OrdersBoard from "./components/OrdersBoard";
import DeliverySettings from "./components/DeliverySettings";
import Operations from "./components/Operations";
import AdminAuth from "./components/AdminAuth";
import { initialCategories, initialProducts } from "./data/catalog";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { Category, Product } from "./types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const STORE_ID = "10000000-0000-4000-8000-000000000001";

export default function App() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [section, setSection] = useState<"dashboard" | "kitchen" | "cash" | "products" | "pizza" | "orders" | "delivery" | "public">("public");

  const visible = useMemo(() => products.filter((product) => {
    const matchesText = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (categoryFilter === "all" || product.categoryId === categoryFilter);
  }), [products, query, categoryFilter]);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("categories").select("id,name,active").eq("store_id", STORE_ID).order("position"),
      supabase.from("products").select("id,category_id,name,description,price,image_path,active").eq("store_id", STORE_ID).order("position"),
      supabase.from("stores").select("accepting_orders").eq("id", STORE_ID).single(),
    ]).then(([categoryResult, productResult, storeResult]) => {
      if (categoryResult.data) setCategories(categoryResult.data.map((row) => ({ id: row.id, name: row.name, active: row.active })));
      if (productResult.data) setProducts(productResult.data.map((row) => ({ id: row.id, categoryId: row.category_id, name: row.name, description: row.description, price: Number(row.price), imageUrl: row.image_path ?? "", active: row.active })));
      if (storeResult.data) setStoreOpen(storeResult.data.accepting_orders);
    });
  }, []);

  async function toggleProduct(id: string) {
    const product = products.find((item) => item.id === id); if (!product || !supabase) return;
    setProducts((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item));
    const { error } = await supabase.from("products").update({ active: !product.active, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setProducts((current) => current.map((item) => item.id === id ? product : item));
  }

  async function addCategory() {
    const name = window.prompt("Nome da nova categoria:")?.trim();
    if (!name || !supabase) return;
    const { data, error } = await supabase.from("categories").insert({ store_id: STORE_ID, name, position: categories.length, active: true }).select("id,name,active").single();
    if (!error && data) setCategories((current) => [...current, { id: data.id, name: data.name, active: data.active }]);
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return;
    const data = new FormData(event.currentTarget);
    const input = { store_id: STORE_ID, name: String(data.get("name")), description: String(data.get("description")), category_id: String(data.get("category")), price: Number(data.get("price")), image_path: String(data.get("imageUrl") ?? "") || null, position: products.length, active: true };
    const { data: saved, error } = await supabase.from("products").insert(input).select("id,category_id,name,description,price,image_path,active").single();
    if (!error && saved) { setProducts((current) => [...current, { id: saved.id, categoryId: saved.category_id, name: saved.name, description: saved.description, price: Number(saved.price), imageUrl: saved.image_path ?? "", active: saved.active }]); setShowForm(false); }
  }

  async function toggleStore() { if (!supabase) return; const next = !storeOpen; setStoreOpen(next); const { error } = await supabase.from("stores").update({ accepting_orders: next, updated_at: new Date().toISOString() }).eq("id", STORE_ID); if (error) setStoreOpen(!next); }

  if (section === "public") return <PublicMenu onBack={() => setSection("dashboard")} />;
  const sectionTitle = section === "dashboard" ? "Visão geral" : section === "kitchen" ? "Cozinha" : section === "cash" ? "Caixa e relatórios" : section === "pizza" ? "Montagem de pizzas" : section === "orders" ? "Central de pedidos" : section === "delivery" ? "Entrega e retirada" : "Catálogo";

  return <AdminAuth onBack={() => setSection("public")}>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Flame size={24} /></span><div><strong>Braseira</strong><small>Pizza • Administração</small></div></div>
        <nav>
          <button className={section === "dashboard" ? "active" : ""} onClick={() => setSection("dashboard")}><LayoutDashboard size={19} /> Visão geral</button>
          <button className={section === "kitchen" ? "active" : ""} onClick={() => setSection("kitchen")}><CookingPot size={19} /> Cozinha</button>
          <button className={section === "cash" ? "active" : ""} onClick={() => setSection("cash")}><Banknote size={19} /> Caixa e relatórios</button>
          <button className={section === "products" ? "active" : ""} onClick={() => setSection("products")}><Pizza size={19} /> Produtos</button>
          <button className={section === "pizza" ? "active" : ""} onClick={() => setSection("pizza")}><ChefHat size={19} /> Montagem</button>
          <button className={section === "orders" ? "active" : ""} onClick={() => setSection("orders")}><ClipboardList size={19} /> Pedidos</button>
          <button className={section === "delivery" ? "active" : ""} onClick={() => setSection("delivery")}><Bike size={19} /> Entregas</button>
          <button onClick={() => setSection("public")}><Store size={19} /> Ver cardápio</button>
          <button onClick={addCategory}><Tags size={19} /> Categorias</button>
        </nav>
        <div className="wave-card"><small>NOVA FASE</small><strong>Onda 9 de 12</strong><span>Controle da loja</span><div><i style={{ width: "75%" }} /></div></div>
      </aside>

      <main>
        <header className="topbar"><div><span>Painel administrativo</span><strong>{sectionTitle}</strong></div><div className="topbar-actions"><span className="data-status" title={isSupabaseConfigured ? "Supabase conectado" : "Os dados ficam salvos neste navegador"}>{isSupabaseConfigured ? <Cloud size={15} /> : <Database size={15} />}{isSupabaseConfigured ? "Nuvem conectada" : "Salvo neste dispositivo"}</span><button className={`store-status ${storeOpen ? "" : "closed"}`} onClick={toggleStore}><i /> {storeOpen ? "Loja aberta" : "Loja fechada"}</button></div></header>
        {section === "dashboard" ? <Operations view="dashboard" /> : section === "kitchen" ? <Operations view="kitchen" /> : section === "cash" ? <Operations view="cash" /> : section === "pizza" ? <PizzaSettings /> : section === "orders" ? <OrdersBoard /> : section === "delivery" ? <DeliverySettings /> : <section className="content">
          <div className="title-row"><div><p className="eyebrow">GESTÃO DO CARDÁPIO</p><h1>Produtos</h1><p>Cadastre os itens que aparecerão no cardápio da Braseira Pizza.</p></div><button className="primary" onClick={() => setShowForm(true)}><PackagePlus size={18} /> Novo produto</button></div>

          <div className="stats">
            <article><span>Produtos cadastrados</span><strong>{products.length}</strong></article>
            <article><span>Ativos no cardápio</span><strong>{products.filter((p) => p.active).length}</strong></article>
            <article><span>Categorias</span><strong>{categories.length}</strong></article>
          </div>

          <div className="toolbar"><label><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto..." /></label><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>

          <div className="product-grid">
            {visible.map((product) => <article className="product-card" key={product.id}>
              <div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <Pizza size={42} />}<span className={product.active ? "available" : "unavailable"}>{product.active ? "Disponível" : "Oculto"}</span></div>
              <div className="product-body"><small>{categories.find((category) => category.id === product.categoryId)?.name}</small><h2>{product.name}</h2><p>{product.description}</p><footer><strong>{money.format(product.price)}</strong><button onClick={() => toggleProduct(product.id)} title={product.active ? "Ocultar do cardápio" : "Exibir no cardápio"}>{product.active ? <Eye size={18} /> : <EyeOff size={18} />}</button></footer></div>
            </article>)}
          </div>
        </section>}
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={addProduct}><p className="eyebrow">NOVO ITEM</p><h2>Cadastrar produto</h2><label>Nome<input name="name" required placeholder="Ex.: Pizza Marguerita" /></label><label>Descrição<textarea name="description" required placeholder="Ingredientes e apresentação" /></label><label>Endereço da imagem <span className="optional">(opcional nesta fase)</span><input name="imageUrl" type="url" placeholder="https://..." /></label><div className="form-row"><label>Categoria<select name="category">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Preço<input name="price" required min="0" step="0.01" type="number" placeholder="0,00" /></label></div><div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary" type="submit">Salvar produto</button></div></form></div>}
    </div>
  </AdminAuth>;
}
