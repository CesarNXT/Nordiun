## Cards de Chamados
- Adicionar visualização em cards (alternar Cards/Tabela) na página `Chamados`.
- Cada card exibe: Nome, Data e Hora, Técnico (nome e sobrenome), Cidade, Estado e Status.
- Badge de "Aviso" quando passou do horário e não iniciou; badge "Em andamento" quando ativo.
- Clique no card abre o modal atual com os detalhes completos.

## Filtros e Ordenação
- Filtros rápidos: Todos / Avisos / Em andamento.
- Ordenação prioriza: Avisos → Em andamento → Agendados por horário → demais.

## Correção dos logs Firestore (net::ERR_ABORTED)
- Centralizar `onSnapshot` em um provider único (AppDataProvider) para `registrations`, `empresas`, `chamados` e compartilhar via Context, evitando múltiplos canais por página.
- Garantir `unsub` único no provider e não duplicar listeners em `Dashboard` e `Chamados`.
- Ajustes de SDK:
  - Reduzir verbosidade com `setLogLevel('error')`.
  - Opcional para redes/proxy: `initializeFirestore(app, { experimentalForceLongPolling: true })` se o erro persistir.
- Fallback: se `onSnapshot` cair, usar `getDocs` imediato e re-tentar com backoff, exibindo dados sem flicker.

## Integração
- Provider adicionado no `RootLayout`.
- `Dashboard` e `Chamados` passam a consumir dados do Context em vez de abrir novos snapshots.
- Manter prefetch do login já implementado para inicializar rapidamente o Dashboard.

## Verificação
- Lint sem erros.
- Testar: Cards com campos corretos; filtros e ordenação; modal abre; logs do Firestore diminuem significativamente; dados atualizam em tempo real sem múltiplos canais.

Posso aplicar essas mudanças agora para entregar a visualização em cards e estabilizar os listeners do Firestore?