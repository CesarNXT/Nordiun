## Problema
- O tema escuro está sendo aplicado globalmente pelo `RootLayout`, deixando a página de login escura.

## Objetivo
- Permitir que somente a área autenticada (segmento `(dashboard)`) alterne entre claro/escuro.
- Garantir que as páginas públicas (ex.: `/login`) permaneçam sempre em tema claro.

## Mudanças Propostas
1. Remover a aplicação global de `.dark` do `src/app/layout.tsx` (script de pre-hydration).
2. Adicionar script de pre-hydration apenas no `src/app/(dashboard)/layout.tsx` para ler `localStorage('theme')` e aplicar `.dark` antes da hidratação SOMENTE nas rotas autenticadas.
3. Manter os toggles de tema (Sol/Lua) apenas na área logada (já em `sidebar` e `(dashboard)/layout.tsx`).
4. Fallback (opcional): no `src/app/login/page.tsx` adicionar um pequeno efeito que remove `.dark` ao montar, prevenindo qualquer resquício.

## Arquivos a alterar
- `src/app/layout.tsx`: remover script que chama `document.documentElement.classList.toggle('dark', ...)`.
- `src/app/(dashboard)/layout.tsx`: inserir script equivalente para o segmento, aplicado antes da hidratação.
- `src/app/login/page.tsx`: (opcional) efeito `document.documentElement.classList.remove('dark')`.

## Verificação
- Abrir `/login`: sempre claro.
- Logar e abrir `/dashboard`: alternância Sol/Lua funciona e persiste em `localStorage`.
- Navegar entre áreas: tema escuro só persiste dentro de `(dashboard)`; páginas públicas continuam claras.

Confirmando, executo essas mudanças agora para alinhar o escopo do tema com a área logada.