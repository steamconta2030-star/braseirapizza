import { useMemo, useState } from "react";
import { Cloud, Database, Eye, EyeOff, Flame, LayoutDashboard, PackagePlus, Pizza, Search, Tags } from "lucide-react";
import { initialCategories, initialProducts } from "./data/catalog";
import { usePersistentState } from "./hooks/usePersistentState";
import { isSupabaseConfigured } from "./lib/supabase";
import type { Category, Product } from "./types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function App() {
  const [categories, setCategories] = usePersistentState<Category[]>("braseira:categories", initialCategories);
  const [products, setProducts] = usePersistentState<Product[]>("braseira:products", initialProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const visible = useMemo(() => products.filter((product) => {
    const matchesText = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (categoryFilter === "all" || product.categoryId === categoryFilter);
  }), [products, query, categoryFilter]);

  function toggleProduct(id: string) {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, active: !product.active } : product));
  }

  function addCategory() {
    const name = window.prompt("Nome da nova categoria:")?.trim();
    if (!name) return;
    setCategories((current) => [...current, { id: crypto.randomUUID(), name, active: true }]);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Flame size={24} /></span><div><strong>Braseira</strong><small>Pizza • Administração</small></div></div>
        <nav>
          <button><LayoutDashboard size={19} /> Visão geral</button>
          <button className="active"><Pizza size={19} /> Produtos</button>
          <button onClick={addCategory}><Tags size={19} /> Categorias</button>
        </nav>
        <div className="wave-card"><small>DESENVOLVIMENTO</small><strong>Onda 2 de 8</strong><span>Catálogo e produtos</span><div><i /></div></div>
      </aside>

      <main>
        <header className="topbar"><div><span>Painel administrativo</span><strong>Catálogo</strong></div><div className="topbar-actions"><span className="data-status" title={isSupabaseConfigured ? "Supabase conectado" : "Os dados ficam salvos neste navegador"}>{isSupabaseConfigured ? <Cloud size={15} /> : <Database size={15} />}{isSupabaseConfigured ? "Nuvem conectada" : "Salvo neste dispositivo"}</span><button className="store-status"><i /> Loja aberta</button></div></header>
        <section className="content">
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
        </section>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); setProducts((current) => [...current, { id: crypto.randomUUID(), name: String(data.get("name")), description: String(data.get("description")), categoryId: String(data.get("category")), price: Number(data.get("price")), imageUrl: String(data.get("imageUrl") ?? ""), active: true }]); setShowForm(false); }}><p className="eyebrow">NOVO ITEM</p><h2>Cadastrar produto</h2><label>Nome<input name="name" required placeholder="Ex.: Pizza Marguerita" /></label><label>Descrição<textarea name="description" required placeholder="Ingredientes e apresentação" /></label><label>Endereço da imagem <span className="optional">(opcional nesta fase)</span><input name="imageUrl" type="url" placeholder="https://..." /></label><div className="form-row"><label>Categoria<select name="category">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Preço<input name="price" required min="0" step="0.01" type="number" placeholder="0,00" /></label></div><div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary" type="submit">Salvar produto</button></div></form></div>}
    </div>
  );
}
