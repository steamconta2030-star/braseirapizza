-- Dados iniciais da Braseira Pizza. Seguro para executar mais de uma vez.
insert into public.stores (id, name, slug, active)
values ('10000000-0000-4000-8000-000000000001', 'Braseira Pizza', 'braseirapizza', true)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, active = excluded.active;

insert into public.categories (id, store_id, name, position, active) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Pizzas', 1, true),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Combos', 2, true),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Bebidas', 3, true)
on conflict (id) do update set name = excluded.name, position = excluded.position, active = excluded.active;

insert into public.products (id, store_id, category_id, name, description, price, position, active) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Pizza de Calabresa', 'Molho artesanal, muçarela, calabresa e orégano.', 65, 1, true),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Pizza de Frango com Catupiry', 'Molho artesanal, muçarela, frango e catupiry.', 68, 2, true),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'Refrigerante 2 litros', 'Escolha o sabor disponível.', 14, 3, true)
on conflict (id) do update set category_id = excluded.category_id, name = excluded.name, description = excluded.description,
  price = excluded.price, position = excluded.position, active = excluded.active;

insert into public.pizza_sizes (id, store_id, name, slices, max_flavors, base_price, position, active) values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Broto', 4, 1, 38, 1, true),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Média', 6, 2, 52, 2, true),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Grande', 8, 2, 65, 3, true),
  ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Família', 12, 3, 82, 4, true)
on conflict (id) do update set name = excluded.name, slices = excluded.slices, max_flavors = excluded.max_flavors,
  base_price = excluded.base_price, position = excluded.position, active = excluded.active;

insert into public.pizza_flavors (id, store_id, name, ingredients, position, active) values
  ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Calabresa', 'Muçarela, calabresa e orégano', 1, true),
  ('50000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Frango com Catupiry', 'Muçarela, frango e catupiry', 2, true),
  ('50000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Marguerita', 'Muçarela, tomate, manjericão e orégano', 3, true),
  ('50000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Quatro Queijos', 'Muçarela, provolone, parmesão e catupiry', 4, true)
on conflict (id) do update set name = excluded.name, ingredients = excluded.ingredients,
  position = excluded.position, active = excluded.active;

insert into public.pizza_flavor_prices (flavor_id, size_id, price) values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 38),
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 52),
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', 65),
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000004', 82),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', 41),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 56),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', 68),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000004', 87),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000001', 39),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000002', 54),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 66),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000004', 84),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000001', 44),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000002', 59),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000003', 72),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 92)
on conflict (flavor_id, size_id) do update set price = excluded.price;

insert into public.pizza_options (id, store_id, type, name, price, position, active) values
  ('60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'crust', 'Sem borda recheada', 0, 1, true),
  ('60000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'crust', 'Borda de Catupiry', 8, 2, true),
  ('60000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'crust', 'Borda de Cheddar', 8, 3, true),
  ('60000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'crust', 'Borda de Chocolate', 10, 4, true),
  ('60000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', 'extra', 'Bacon', 6, 1, true),
  ('60000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'extra', 'Catupiry extra', 5, 2, true),
  ('60000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 'extra', 'Queijo extra', 7, 3, true)
on conflict (id) do update set type = excluded.type, name = excluded.name, price = excluded.price,
  position = excluded.position, active = excluded.active;

insert into public.delivery_zones (id, store_id, neighborhood, fee, eta_minutes, active) values
  ('70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Centro', 0, 35, true),
  ('70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Veneza', 0, 35, true),
  ('70000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Caravelas', 5, 45, true),
  ('70000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Cidade Nova', 7, 50, true)
on conflict (id) do update set neighborhood = excluded.neighborhood, fee = excluded.fee,
  eta_minutes = excluded.eta_minutes, active = excluded.active;

insert into public.couriers (id, store_id, name, phone, vehicle, active)
values ('80000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Entregador 1', '', 'Moto', true)
on conflict (id) do update set name = excluded.name, phone = excluded.phone, vehicle = excluded.vehicle, active = excluded.active;
