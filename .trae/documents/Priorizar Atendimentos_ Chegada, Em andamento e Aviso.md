## Objetivo
- Dar prioridade ao controle de horário: ver rapidamente data/hora, se o técnico chegou e se o atendimento já deveria estar em andamento.
- Marcar “Em andamento” manualmente e destacar automaticamente “Aviso” quando passou do horário e não começou.

## Modelagem de Dados (mínima)
- Adicionar campo opcional `arrivalAt` (ISO string) no documento de chamado para registrar chegada do técnico.
- Manter `status` existente (Agendado, Em andamento, Concluído, etc.). “Aviso” será um indicador derivado (não muda `status`).

## Regras de Negócio
- “Chegada do técnico”: botão “Registrar chegada” grava `arrivalAt = now` e altera `status` para “Em andamento”.
- “Aviso”: calcular dinamicamente quando `now >= (appointmentDate + appointmentTime)` e `status` NÃO é “Em andamento/Concluído/Cancelado”. Exibir badge e colocar na frente da lista.
- Ordenação: 1) Avisos primeiro, 2) Em andamento, 3) Agendados por horário, 4) Concluídos.
- Filtro rápido: “Só Avisos”, “Só Em andamento”, “Todos”.

## UX em Chamados
- Lista: mostrar badge `Aviso` ou `Em andamento` ao lado do título; exibir data e hora juntos.
- Detalhe/Modal de edição (`src/app/(dashboard)/chamados/page.tsx`):
  - Se não iniciado, mostrar botão “Registrar chegada” (set `arrivalAt` e `status`).
  - Exibir `arrivalAt` quando existir.
  - Botão “Marcar em andamento” visível quando necessário (sem `arrivalAt`).

## Dashboard
- Métricas novas: contar Avisos e Em andamento.
  - Atualizar `src/app/(dashboard)/dashboard/page.tsx` para exibir “Avisos” e “Em andamento” nos cards.

## Implementação Técnica
- `src/app/(dashboard)/chamados/page.tsx`:
  - Calcular `isLate` com base em `appointmentDate` + `appointmentTime`.
  - Adicionar ações: `registerArrival()` e `markInProgress()` que fazem `updateDoc` no Firestore.
  - Aplicar ordenação/filtros na renderização da lista.
- `src/app/(dashboard)/dashboard/page.tsx`:
  - Derivar contagens `avisosCount` e `andamentoCount`.

## Verificação
- Lint sem erros.
- Testar casos: agendado futuro (sem aviso), passado (mostra aviso), registrar chegada (vira Em andamento e some aviso), concluir (retira dos avisos).

Posso aplicar agora essas alterações focadas em chamados e dashboard para priorizar horário, chegada e avisos.