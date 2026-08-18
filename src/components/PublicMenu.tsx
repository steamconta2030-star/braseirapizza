import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Check, CheckCircle2, Flame, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { initialZones } from "../data/delivery";
import { usePersistentState } from "../hooks/usePersistentState";
import { useOnlineMenu } from "../hooks/useOnlineMenu";
import type { CartItem, Order, Product } from "../types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function PublicMenu({ onBack }: { onBack: () => void }) {
  const { products, categories, sizes, flavors, crusts, extras, zones, online } = useOnlineMenu();
  const [cart, setCart] = usePersistentState<CartItem[]>("braseira:cart", []);
  const [orders, setOrders] = usePersistentState<Order[]>("braseira:orders", []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [checkoutDeliveryType, setCheckoutDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [checkoutZoneId, setCheckoutZoneId] = useState(initialZones[0].id);
  const [sizeId, setSizeId] = useState("grande");
  const [flavorIds, setFlavorIds] = useState<string[]>([]);
  const [crustId, setCrustId] = useState("sem-borda");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const size = sizes.find((item) => item.id === sizeId) ?? sizes[0];
  const chosenFlavors = flavors.filter((item) => flavorIds.includes(item.id));
  const flavorPrice = Math.max(size.basePrice, ...chosenFlavors.map((item) => item.priceBySize[sizeId] ?? size.basePrice));
  const crustPrice = crusts.find((item) => item.id === crustId)?.price ?? 0;
  const extrasPrice = extras.filter((item) => extraIds.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  const pizzaTotal = flavorPrice + crustPrice + extrasPrice;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedZone = zones.find((item) => item.id === checkoutZoneId && item.active);
  const checkoutFee = checkoutDeliveryType === "delivery" ? (selectedZone?.fee ?? 0) : 0;
  const filteredProducts = useMemo(() => products.filter((item) => item.active && (activeCategory === "all" || item.categoryId === activeCategory)), [products, activeCategory]);

  useEffect(() => {
    if (!sizes.some((item) => item.id === sizeId)) setSizeId(sizes.find((item) => item.name === "Grande")?.id ?? sizes[0]?.id ?? "");
    if (!crusts.some((item) => item.id === crustId)) setCrustId(crusts[0]?.id ?? "");
    if (!zones.some((item) => item.id === checkoutZoneId)) setCheckoutZoneId(zones[0]?.id ?? initialZones[0].id);
  }, [checkoutZoneId, crustId, crusts, sizeId, sizes, zones]);

  function selectFlavor(id: string) {
    setFlavorIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= size.maxFlavors ? [...current.slice(1), id] : [...current, id]);
  }
  function addPizza() {
    if (!flavorIds.length) return;
    const crust = crusts.find((item) => item.id === crustId);
    const selectedExtras = extras.filter((item) => extraIds.includes(item.id));
    setCart((current) => [...current, { id: crypto.randomUUID(), name: `Pizza ${size.name}`, detail: `${chosenFlavors.map((item) => item.name).join(" + ")} • ${crust?.name}${selectedExtras.length ? ` • ${selectedExtras.map((item) => item.name).join(", ")}` : ""}`, price: pizzaTotal, quantity: 1 }]);
    setBuilderOpen(false); setCartOpen(true); setFlavorIds([]); setExtraIds([]); setCrustId(crusts[0]?.id ?? "");
  }
  function addProduct(product: Product) {
    setCart((current) => { const existing = current.find((item) => item.id === product.id); return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { id: product.id, name: product.name, detail: product.description, price: product.price, quantity: 1 }]; });
  }
  function quantity(id: string, delta: number) { setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)); }
  function finishOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const deliveryType = checkoutDeliveryType; const deliveryFee = checkoutFee;
    const zoneName = selectedZone?.neighborhood ?? "";
    const order: Order = { id: crypto.randomUUID(), number: Math.max(0, ...orders.map((item) => item.number)) + 1, customerName: String(data.get("name")), phone: String(data.get("phone")), deliveryType, address: deliveryType === "delivery" ? `${String(data.get("address"))} • ${zoneName}` : "", paymentMethod: String(data.get("paymentMethod")) as Order["paymentMethod"], changeFor: Number(data.get("changeFor")) || undefined, notes: String(data.get("notes") ?? ""), items: cart, subtotal: cartTotal, deliveryFee, total: cartTotal + deliveryFee, status: "pending", createdAt: new Date().toISOString() };
    setOrders((current) => [order, ...current]); setCart([]); setCheckoutOpen(false); setCartOpen(false); setCompletedOrder(order);
  }

  return <div className="public-menu">
    <header className="public-header"><button className="back-admin" onClick={onBack}><ArrowLeft size={17} /> Administração</button><div className="public-brand"><span><Flame size={22} /></span><div><strong>Braseira Pizza</strong><small>{online ? "Cardápio online • Feita no fogo" : "Feita no fogo. Feita para você."}</small></div></div><button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span>{cartCount}</span><b>{money.format(cartTotal)}</b></button></header>
    <section className="public-hero"><div><small>🔥 FORNO QUENTE • ENTREGA RÁPIDA</small><h1>Sua pizza, do seu jeito.</h1><p>Escolha o tamanho, combine seus sabores favoritos e deixe o resto com a Braseira.</p><button onClick={() => setBuilderOpen(true)}>Montar minha pizza <Plus size={18} /></button></div><div className="hero-pizza"><i /><span>Até 3 sabores</span></div></section>
    <nav className="category-pills"><button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>Todos</button>{categories.filter((item) => item.active).map((item) => <button key={item.id} className={activeCategory === item.id ? "active" : ""} onClick={() => setActiveCategory(item.id)}>{item.name}</button>)}</nav>
    <main className="menu-content"><div className="menu-title"><div><small>NOSSO CARDÁPIO</small><h2>Escolha o seu pedido</h2></div><span>{filteredProducts.length + 1} opções disponíveis</span></div><div className="menu-grid"><article className="menu-card build-card"><div className="menu-photo pizza-photo"><span>Monte do seu jeito</span></div><div><small>PIZZAS</small><h3>Monte sua pizza</h3><p>Escolha tamanho, sabores, borda e adicionais.</p><footer><strong>A partir de {money.format(Math.min(...sizes.map((item) => item.basePrice)))}</strong><button onClick={() => setBuilderOpen(true)}>Montar</button></footer></div></article>{filteredProducts.map((product) => <article className="menu-card" key={product.id}><div className="menu-photo">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <Flame size={34} />}</div><div><small>{categories.find((item) => item.id === product.categoryId)?.name}</small><h3>{product.name}</h3><p>{product.description}</p><footer><strong>{money.format(product.price)}</strong><button onClick={() => addProduct(product)}><Plus size={18} /></button></footer></div></article>)}</div></main>

    {builderOpen && <div className="menu-overlay"><div className="pizza-builder"><header><div><small>MONTE SUA PIZZA</small><h2>Personalize seu pedido</h2></div><button onClick={() => setBuilderOpen(false)}><X /></button></header><div className="builder-body"><section><h3><span>1</span> Escolha o tamanho</h3><div className="builder-sizes">{sizes.filter((item) => item.active).map((item) => <button key={item.id} className={sizeId === item.id ? "selected" : ""} onClick={() => { setSizeId(item.id); setFlavorIds((current) => current.slice(0, item.maxFlavors)); }}><strong>{item.name}</strong><small>{item.slices} fatias • {item.maxFlavors} sabor{item.maxFlavors > 1 ? "es" : ""}</small><b>A partir de {money.format(item.basePrice)}</b></button>)}</div></section><section><h3><span>2</span> Escolha até {size.maxFlavors} sabor{size.maxFlavors > 1 ? "es" : ""}</h3><div className="builder-flavors">{flavors.filter((item) => item.active).map((item) => { const selected = flavorIds.includes(item.id); return <button key={item.id} className={selected ? "selected" : ""} onClick={() => selectFlavor(item.id)}><i>{selected && <Check size={14} />}</i><div><strong>{item.name}</strong><small>{item.ingredients}</small></div><b>{money.format(item.priceBySize[sizeId] ?? size.basePrice)}</b></button> })}</div></section><section><h3><span>3</span> Escolha a borda</h3><div className="builder-options">{crusts.filter((item) => item.active).map((item) => <button key={item.id} className={crustId === item.id ? "selected" : ""} onClick={() => setCrustId(item.id)}>{item.name}<small>{item.price ? `+ ${money.format(item.price)}` : "Sem acréscimo"}</small></button>)}</div></section><section><h3><span>4</span> Adicionais</h3><div className="builder-options">{extras.filter((item) => item.active).map((item) => <button key={item.id} className={extraIds.includes(item.id) ? "selected" : ""} onClick={() => setExtraIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{item.name}<small>+ {money.format(item.price)}</small></button>)}</div></section></div><footer className="builder-footer"><div><span>Total da pizza</span><strong>{money.format(pizzaTotal)}</strong><small>Preço calculado pelo sabor mais caro</small></div><button disabled={!flavorIds.length} onClick={addPizza}><ShoppingBag size={18} /> Adicionar ao carrinho</button></footer></div></div>}
    {cartOpen && <div className="menu-overlay cart-overlay" onMouseDown={() => setCartOpen(false)}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><header><div><small>SEU PEDIDO</small><h2>Carrinho</h2></div><button onClick={() => setCartOpen(false)}><X /></button></header><div className="cart-items">{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={36} /><strong>Seu carrinho está vazio</strong><span>Escolha uma pizza ou outro item do cardápio.</span></div> : cart.map((item) => <article key={item.id}><div><strong>{item.name}</strong><p>{item.detail}</p><b>{money.format(item.price)}</b></div><div className="quantity"><button onClick={() => quantity(item.id, -1)}>{item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={15} />}</button><span>{item.quantity}</span><button onClick={() => quantity(item.id, 1)}><Plus size={15} /></button></div></article>)}</div><footer><div><span>Subtotal</span><strong>{money.format(cartTotal)}</strong></div><button disabled={!cart.length} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continuar pedido</button><small>Você preencherá os dados antes de confirmar.</small></footer></aside></div>}
    {checkoutOpen && <div className="menu-overlay"><form className="checkout-card" onSubmit={finishOrder}><header><div><small>FINALIZAR PEDIDO</small><h2>Seus dados</h2></div><button type="button" onClick={() => setCheckoutOpen(false)}><X /></button></header><div className="checkout-body"><div className="checkout-row"><label>Nome completo<input name="name" required placeholder="Como podemos chamar você?" /></label><label>WhatsApp<input name="phone" required inputMode="tel" placeholder="(31) 99999-9999" /></label></div><fieldset><legend>Como deseja receber?</legend><label><input type="radio" name="deliveryType" value="delivery" checked={checkoutDeliveryType === "delivery"} onChange={() => setCheckoutDeliveryType("delivery")} /> Entrega</label><label><input type="radio" name="deliveryType" value="pickup" checked={checkoutDeliveryType === "pickup"} onChange={() => setCheckoutDeliveryType("pickup")} /> Retirar na loja</label></fieldset>{checkoutDeliveryType === "delivery" && <><label>Bairro<select value={checkoutZoneId} onChange={(event) => setCheckoutZoneId(event.target.value)}>{zones.filter((zone) => zone.active).map((zone) => <option key={zone.id} value={zone.id}>{zone.neighborhood} — {zone.fee ? money.format(zone.fee) : "Entrega grátis"}</option>)}</select></label><label>Endereço de entrega<input name="address" required placeholder="Rua, número e referência" /></label></>}<div className="checkout-row"><label>Pagamento<select name="paymentMethod"><option value="pix">PIX</option><option value="cash">Dinheiro</option><option value="card">Cartão na entrega</option></select></label><label>Troco para<input name="changeFor" type="number" min="0" step="0.01" placeholder="Opcional" /></label></div><label>Observações<textarea name="notes" placeholder="Ex.: tocar o interfone, sem cebola..." /></label><div className="checkout-total"><span>Subtotal <b>{money.format(cartTotal)}</b></span><span>{checkoutDeliveryType === "delivery" ? `Entrega${selectedZone ? ` • ${selectedZone.neighborhood}` : ""}` : "Retirada"} <b>{checkoutFee ? money.format(checkoutFee) : "Grátis"}</b></span><strong>Total <b>{money.format(cartTotal + checkoutFee)}</b></strong></div></div><footer><button type="button" onClick={() => { setCheckoutOpen(false); setCartOpen(true); }}>Voltar</button><button className="confirm-order" type="submit">Confirmar pedido</button></footer></form></div>}
    {completedOrder && <div className="menu-overlay"><div className="order-success"><CheckCircle2 size={58} /><small>PEDIDO RECEBIDO</small><h2>Pedido #{String(completedOrder.number).padStart(3, "0")}</h2><p>Seu pedido foi enviado para a central da Braseira Pizza.</p><strong>{money.format(completedOrder.total)}</strong><button onClick={() => setCompletedOrder(null)}>Voltar ao cardápio</button></div></div>}
  </div>;
}
