## Identidade Visual e Design System
- Consolidar tokens de tema em `src/app/globals.css` (cores, espaçamentos, tipografia) e expandir com `--primary`, `--primary-foreground`, `--muted-foreground`, `--surface-variant`.
- Criar componentes base (sem dependências externas): `Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Toast` com Tailwind v4 e tokens do tema.
- Padronizar sombras, bordas e estados de foco; cores acessíveis (contraste AA/AAA).

## Alternância de Tema (Sol/Lua)
- Manter script de pre-hydration em `src/app/layout.tsx:23–31` para evitar flash.
- Botão unificado de tema com `lucide-react` (`Sun`/`Moon`) em header e sidebar, usando `localStorage('theme')` e `documentElement.classList.toggle('dark')`.
- Remover textos redundantes e manter ícones com `aria-label`.

## Layout Global e Navegação
- Topbar com logo, busca, botão tema e menu usuário.
- Sidebar responsiva já existente (`src/components/sidebar.tsx`) refinada com agrupamentos, estados ativos e colapsáveis.
- Conteúdo com `container` e `breadcrumbs`.

## Autenticação e Segurança
- Guard global via `AuthGuard` em `src/app/layout.tsx:22,32` (já aplicado), mantendo bypass em `/login` (`src/components/auth-guard.tsx:12–26`).
- Adicionar menu usuário com avatar, nome e "Sair" (Firebase Auth), controle de sessão e feedback.

## Dashboard Profissional
- Cards com `Card` (header, content, footer), métricas e variações.
- Seções: "Visão Geral" (técnicos, empresas, chamados, concluídos hoje), "Chamados Recentes", e "Atividade".
- Migrar classes fixas para tokens (feito em `src/app/(dashboard)/dashboard/page.tsx:80–113`); aplicar o novo `Card`.

## Chamados: UX de Fluxo
- Unificar modais (novo/editar/financeiro) com `Modal` padronizado.
- Inputs e selects com `Input`/`Select`; estados de erro; máscaras para hora/data.
- Lista e filtros mais claros; indicadores de status com `Badge`.
- Manter tema: já corrigido em `src/app/(dashboard)/chamados/page.tsx:641–792, 799–864, 1078–1092`.

## Empresas e Técnicos
- Substituir tabelas fixas por `DataTable` simples (ordenar, filtrar, paginar sem libs).
- Padronizar modais de documentos e valores com `Modal`/`Input`/`Button`.
- Migrar classes slate/white para tokens (ex.: `src/app/(dashboard)/empresas/page.tsx:377–471, 418–425, 429–457, 463–500`).

## Mapa de Técnicos
- Usar `leaflet` existente: adicionar tiles escuros quando `dark` ativo.
- Pins com estados (Disponível/Em atendimento/Ajudante) e popovers.

## Feedback, Estado e Acessibilidade
- `Toast` para sucesso/erro (salvar, excluir, upload).
- `Skeleton` e `Spinner` para carregamentos.
- Foco visível, navegação por teclado, `aria-*` e roles em modais, listas e botões.

## Performance e Qualidade
- Evitar múltiplos `onSnapshot` redundantes; reutilizar listeners.
- Debounce em buscas e autocomplete; memoização cuidadosa.
- Limpeza de efeitos e uploads; reduzir re-render em grids.

## Testes e Observabilidade
- Adicionar testes básicos de componentes (Story/fixtures simples) e smoke de rotas.
- Logs mínimos e tratamento de erros em chamadas (`/api/*`).

## Entregáveis por Fase
1. Componentes base e tokens de tema.
2. Topbar/Sidebar + ícone tema.
3. Dashboard com `Card`.
4. Chamados com `Modal`/`Input`/`Select` padronizados.
5. Empresas/Técnicos com `DataTable`.
6. Mapa com tema escuro.
7. Toast/Skeleton/Spinner + acessibilidade.

## Migração Gradual
- Priorizar telas mais usadas: Chamados, Dashboard.
- Migrar classes hardcoded → tokens; substituir blocos por componentes novos sem quebrar APIs.

Confere seguir com essa reformulação por fases, começando pelos componentes base e aplicação no Dashboard/Chamados?