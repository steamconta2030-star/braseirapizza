import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChefHat, Clock3, PackageCheck, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Courier, Order, OrderStatus } from "../types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const statusLabel: Record<OrderStatus, string> = { pending: "Novo", confirmed: "Confirmado", preparing: "Em preparo", ready: "Pronto", delivered: "Entregue", cancelled: "Cancelado" };
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { pending: "confirmed", confirmed: "preparing", preparing: "ready", ready: "delivered" };
const nextLabel: Partial<Record<OrderStatus, string>> = { pending: "Confirmar pedido", confirmed: "Iniciar preparo", preparing: "Marcar como pronto", ready: "Finalizar entrega" };

export default function OrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadError, setLoadError] = useState("");
  const load = useCallback(async () => {
    if (!supabase) return;
    const [{ data: orderRows, error }, { data: courierRows }] = await Promise.all([
      supabase.from("orders").select("id,number,customer_name,phone,delivery_type,address,payment_method,change_for,notes,subtotal,delivery_fee,total,status,courier_id,created_at,order_items(id,name,detail,quantity,unit_price)").order("created_at", { ascending: false }).limit(100),
      supabase.from("couriers").select("id,name,phone,vehicle,active").order("name"),
    ]);
    if (error) { setLoadError("Não foi possível carregar os pedidos desta conta."); return; }
    setLoadError("");
    setOrders((orderRows ?? []).map((row) => ({
      id: row.id, number: Number(row.number), customerName: row.customer_name, phone: row.phone,
      deliveryType: row.delivery_type as Order["deliveryType"], address: row.address ?? "",
      paymentMethod: row.payment_method as Order["paymentMethod"], changeFor: row.change_for ? Number(row.change_for) : undefined,
      notes: row.notes, subtotal: Number(row.subtotal), deliveryFee: Number(row.delivery_fee), total: Number(row.total),
      status: row.status as OrderStatus, courierId: row.courier_id ?? undefined, createdAt: row.created_at,
      items: (row.order_items ?? []).map((item) => ({ id: item.id, name: item.name, detail: item.detail, quantity: item.quantity, price: Number(item.unit_price) })),
    })));
    setCouriers((courierRows ?? []).map((row) => ({ id: row.id, name: row.name, phone: row.phone, vehicle: row.vehicle, active: row.active })));
  }, []);

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;
    const channel = client.channel("braseira-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load()).subscribe();
    return () => { client.removeChannel(channel); };
  }, [load]);

  const active = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  async function update(id: string, status: OrderStatus) { setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order)); const { error } = await supabase!.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id); if (error) { setLoadError("Não foi possível atualizar o pedido."); load(); } }
  async function assignCourier(id: string, courierId: string) { setOrders((current) => current.map((order) => order.id === id ? { ...order, courierId: courierId || undefined } : order)); const { error } = await supabase!.from("orders").update({ courier_id: courierId || null, updated_at: new Date().toISOString() }).eq("id", id); if (error) { setLoadError("Não foi possível atribuir o entregador."); load(); } }
  return <section className="content orders-board"><div className="title-row"><div><p className="eyebrow">CENTRAL DE OPERAÇÃO</p><h1>Pedidos</h1><p>Acompanhe os pedidos recebidos e atualize cada etapa.</p></div><span className="live-badge"><i /> Atualização automática</span></div>
    {loadError && <p className="admin-login-error" role="alert">{loadError}</p>}<div className="stats"><article><span>Pedidos ativos</span><strong>{active.length}</strong></article><article><span>Aguardando confirmação</span><strong>{orders.filter((item) => item.status === "pending").length}</strong></article><article><span>Em preparo</span><strong>{orders.filter((item) => item.status === "preparing").length}</strong></article></div>
    {orders.length === 0 ? <div className="orders-empty"><Clock3 size={42} /><h2>Nenhum pedido recebido</h2><p>Faça um pedido pelo cardápio público para testar o fluxo.</p></div> : <div className="orders-list">{orders.map((order) => <article className={`order-card status-${order.status}`} key={order.id}><header><div><span>Pedido #{String(order.number).padStart(3, "0")}</span><h2>{order.customerName}</h2><small>{new Date(order.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {order.deliveryType === "delivery" ? "Entrega" : "Retirada"}</small></div><b>{statusLabel[order.status]}</b></header><div className="order-items">{order.items.map((item) => <p key={item.id}><span>{item.quantity}× {item.name}<small>{item.detail}</small></span><b>{money.format(item.price * item.quantity)}</b></p>)}</div><div className="order-customer"><p><strong>Contato:</strong> {order.phone}</p>{order.address && <p><strong>Endereço:</strong> {order.address}</p>}<p><strong>Pagamento:</strong> {order.paymentMethod === "pix" ? "PIX" : order.paymentMethod === "cash" ? "Dinheiro" : "Cartão"}</p>{order.deliveryType === "delivery" && <label className="courier-select">Entregador<select value={order.courierId ?? ""} onChange={(event) => assignCourier(order.id, event.target.value)}><option value="">Atribuir depois</option>{couriers.filter((courier) => courier.active).map((courier) => <option key={courier.id} value={courier.id}>{courier.name} • {courier.vehicle}</option>)}</select></label>}{order.notes && <p><strong>Observações:</strong> {order.notes}</p>}</div><footer><div><span>Total</span><strong>{money.format(order.total)}</strong></div><div className="order-actions">{nextStatus[order.status] && <button className="advance-order" onClick={() => update(order.id, nextStatus[order.status]!)}>{order.status === "preparing" ? <PackageCheck size={17} /> : order.status === "confirmed" ? <ChefHat size={17} /> : <CheckCircle2 size={17} />}{nextLabel[order.status]}</button>}{!["delivered", "cancelled"].includes(order.status) && <button className="cancel-order" onClick={() => update(order.id, "cancelled")}><XCircle size={17} /></button>}</div></footer></article>)}</div>}
  </section>;
}
