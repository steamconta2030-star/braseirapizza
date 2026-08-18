# Braseira Pizza

Sistema web para operação de pizzaria, com cardápio digital, montagem de pizzas, pedidos em tempo real, painel administrativo, cozinha, entrega e PDV.

## Estratégia

O projeto reutiliza padrões técnicos validados no DistribuIA, sem copiar módulos desnecessários nem credenciais:

- React 19 e TypeScript
- TanStack Start, Router e Query
- Tailwind CSS
- Supabase/PostgreSQL
- Zod
- PWA e suporte offline progressivo
- atualização de pedidos em tempo real

## Desenvolvimento em ondas

1. Fundação, arquitetura e segurança
2. Catálogo, categorias, produtos e imagens
3. Tamanhos, sabores, bordas e adicionais
4. Cardápio público e carrinho
5. Pedidos e central em tempo real
6. Entrega, retirada, bairros e taxas
7. Painel, cozinha, caixa e relatórios
8. Testes, segurança e publicação

Consulte [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para as decisões técnicas.

## Regras de segurança

- Nunca versionar arquivos `.env`.
- Usar um projeto Supabase exclusivo para o Braseira Pizza.
- Calcular preços e taxas no servidor.
- Isolar dados por estabelecimento.
- Validar toda entrada pública com Zod.
- Não transportar políticas RLS antigas sem revisão.

## Status

Onda 1 em andamento: preparação da fundação técnica.
