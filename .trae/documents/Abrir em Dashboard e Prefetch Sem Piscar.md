## Objetivo
- Redirecionar pós-login e na raiz para `/dashboard`.
- Pré-carregar dados (técnicos, empresas, chamados) durante o login e entregar o Dashboard já populado, sem flicker.

## Mudanças de Navegação
- `src/app/page.tsx`: alterar destino authed de `"/chamados"` para `"/dashboard"`.
- `src/app/login/page.tsx`: alterar `router.replace("/chamados")` para `"/dashboard"` (tanto no sucesso do login quanto em `onAuthStateChanged`).

## Prefetch de Dados no Login
- Em `onSubmit` do `src/app/login/page.tsx`:
  - Após `signInWithEmailAndPassword`, executar `Promise.all` com `getDocs` nas coleções `registrations`, `empresas`, `chamados`.
  - Salvar os resultados no `sessionStorage` (`prefetch_registrations`, `prefetch_empresas`, `prefetch_chamados`).
  - Exibir estado de loading (“Entrando… carregando dados”), e só então `router.replace("/dashboard")`.

## Seed no Dashboard (sem nova lib)
- `src/app/(dashboard)/dashboard/page.tsx`:
  - Antes dos `onSnapshot`, ler `sessionStorage` e inicializar `useState`/`setTecnicos`, `setEmpresas`, `setChamados` com os dados pré-carregados.
  - Limpar os itens de `sessionStorage` após usar para não manter lixo.
  - Manter `onSnapshot` para atualização em tempo real, evitando piscadas.

## Verificação
- Fluxo: Login → (autentica) → Prefetch paralelo → Redireciona para `/dashboard` já com dados renderizados.
- Recarregar `/dashboard` direto (usuário já logado): ainda funciona; snapshots atualizam; seed só ocorre se existir `sessionStorage`.

## Considerações
- Sem criação de novas dependências ou contextos globais: usa `sessionStorage` para handoff simples.
- Mantém compatibilidade e real-time com Firestore.

Posso aplicar essas alterações agora para entregar o login → dashboard sem atraso e sem flicker.