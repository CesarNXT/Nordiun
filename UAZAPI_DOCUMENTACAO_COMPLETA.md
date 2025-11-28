# UazAPI - Documentação Completa Extraída

**Data de Extração:** 24/10/2025, 17:43:31

**Total de Endpoints:** 37

---

## 📑 Índice

### Instâncias

- [Inicializar Instância](#inst-ncias-0)
- [Listar Todas Instâncias](#inst-ncias-1)
- [Atualizar Campos Admin](#inst-ncias-2)
- [Conectar Instância](#inst-ncias-3)
- [Desconectar Instância](#inst-ncias-4)
- [Status da Instância](#inst-ncias-5)
- [Atualizar Nome Instância](#inst-ncias-6)
- [Deletar Instância](#inst-ncias-7)
- [Obter Privacidade](#inst-ncias-8)
- [Atualizar Privacidade](#inst-ncias-9)
- [Atualizar Presença](#inst-ncias-10)

### Webhooks Globais

- [Obter Webhook Global](#webhooks-globais-0)
- [Configurar Webhook Global](#webhooks-globais-1)

### Perfil

- [Atualizar Nome Perfil](#perfil-0)
- [Atualizar Foto Perfil](#perfil-1)

### Chamadas

- [Fazer Chamada](#chamadas-0)
- [Rejeitar Chamada](#chamadas-1)

### Webhooks e SSE

- [Obter Webhook Instância](#webhooks-e-sse-0)
- [Configurar Webhook Instância](#webhooks-e-sse-1)
- [Server-Sent Events](#webhooks-e-sse-2)

### Envio de Mensagens

- [Enviar Texto](#envio-de-mensagens-0)
- [Enviar Mídia](#envio-de-mensagens-1)
- [Enviar Contato](#envio-de-mensagens-2)
- [Enviar Localização](#envio-de-mensagens-3)
- [Presença de Mensagem](#envio-de-mensagens-4)
- [Enviar Status](#envio-de-mensagens-5)
- [Enviar Menu](#envio-de-mensagens-6)
- [Enviar Carrossel](#envio-de-mensagens-7)
- [Enviar Botão Localização](#envio-de-mensagens-8)
- [Enviar Botão PIX](#envio-de-mensagens-9)

### Chats

- [Obter Detalhes Completos do Chat](#chats-details)

### Sender

- [Disparo Simples](#sender-0)
- [Disparo Avançado](#sender-1)
- [Editar Disparo](#sender-2)
- [Limpar Concluídos](#sender-3)
- [Limpar Todas](#sender-4)
- [Listar Pastas](#sender-5)
- [Listar Mensagens](#sender-6)

---

# Instâncias

## Inicializar Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~init](https://docs.uazapi.com/endpoint/post/instance~init)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Criar Instancia
POST
Listar todas as instâncias
GET
Atualizar campos administrativos
POST
Ver Webhook Global
GET
Configurar Webhook Global
POST
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/init
Criar Instancia

Cria uma nova instância do WhatsApp. Para criar uma instância você precisa:

Ter um admintoken válido
Enviar pelo menos o nome da instância
A instância será criada desconectada
Será gerado um token único para autenticação

Após criar a instância, guarde o token retornado pois ele será necessário para todas as outras operações.

Estados possíveis da instância:

disconnected: Desconectado do WhatsApp
connecting: Em processo de conexão
connected: Conectado e autenticado

Campos administrativos (adminField01/adminField02) são opcionais e podem ser usados para armazenar metadados personalizados. OS valores desses campos são vísiveis para o dono da instancia via token, porém apenas o administrador da api (via admin token) pode editá-los.

Request
Body
name
string
required

Nome da instância

Example: "minha-instancia"

systemName
string

Nome do sistema (opcional, padrão 'uazapiGO' se não informado)

Example: "apilocal"

adminField01
string

Campo administrativo 1 para metadados personalizados (opcional)

Example: "custom-metadata-1"

adminField02
string

Campo administrativo 2 para metadados personalizados (opcional)

Example: "custom-metadata-2"

Responses
200
Sucesso
401
Token inválido/expirado
404
Instância não encontrada
500
Erro interno
```

### Blocos de Código

#### Código 1

```
/instance/init
```

#### Código 2

```
disconnected
```

#### Código 3

```
connecting
```

#### Código 4

```
connected
```

---

## Listar Todas Instâncias

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/instance~all](https://docs.uazapi.com/endpoint/get/instance~all)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Criar Instancia
POST
Listar todas as instâncias
GET
Atualizar campos administrativos
POST
Ver Webhook Global
GET
Configurar Webhook Global
POST
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/instance/all
Listar todas as instâncias

Retorna uma lista completa de todas as instâncias do sistema, incluindo:

ID e nome de cada instância
Status atual (disconnected, connecting, connected)
Data de criação
Última desconexão e motivo
Informações de perfil (se conectado)

Requer permissões de administrador.

Responses
200
Lista de instâncias retornada com sucesso
401
Token inválido ou expirado
403
Token de administrador inválido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/instance/all
```

---

## Atualizar Campos Admin

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~updateAdminFields](https://docs.uazapi.com/endpoint/post/instance~updateAdminFields)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Criar Instancia
POST
Listar todas as instâncias
GET
Atualizar campos administrativos
POST
Ver Webhook Global
GET
Configurar Webhook Global
POST
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/updateAdminFields
Atualizar campos administrativos

Atualiza os campos administrativos (adminField01/adminField02) de uma instância.

Campos administrativos são opcionais e podem ser usados para armazenar metadados personalizados. Estes campos são persistidos no banco de dados e podem ser utilizados para integrações com outros sistemas ou para armazenamento de informações internas. OS valores desses campos são vísiveis para o dono da instancia via token, porém apenas o administrador da api (via admin token) pode editá-los.

Request
Body
id
string
required

ID da instância

Example: "inst_123456"

adminField01
string

Campo administrativo 1

Example: "clientId_456"

adminField02
string

Campo administrativo 2

Example: "integration_xyz"

Responses
200
Campos atualizados com sucesso
401
Token de administrador inválido
404
Instância não encontrada
500
Erro interno
```

### Blocos de Código

#### Código 1

```
/instance/updateAdminFields
```

---

## Conectar Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~connect](https://docs.uazapi.com/endpoint/post/instance~connect)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/connect
Conectar instância ao WhatsApp

Inicia o processo de conexão de uma instância ao WhatsApp. Este endpoint:

Requer o token de autenticação da instância
Recebe o número de telefone associado à conta WhatsApp
Gera um QR code caso não passe o campo phone
Ou Gera código de pareamento se passar o o campo phone
Atualiza o status da instância para "connecting"

O processo de conexão permanece pendente até que:

O QR code seja escaneado no WhatsApp do celular, ou
O código de pareamento seja usado no WhatsApp
Timeout de 2 minutos para QRCode seja atingido ou 5 minutos para o código de pareamento

Use o endpoint /instance/status para monitorar o progresso da conexão.

Estados possíveis da instância:

disconnected: Desconectado do WhatsApp
connecting: Em processo de conexão
connected: Conectado e autenticado

Exemplo de requisição:

{
  "phone": "5511999999999"
}

Request
Body
phone
string
required

Número de telefone no formato internacional (ex: 5511999999999)

Example: "5511999999999"

Responses
200
Sucesso
401
Token inválido/expirado
404
Instância não encontrada
429
Limite de conexões simultâneas atingido
500
Erro interno
```

### Blocos de Código

#### Código 1

```
/instance/connect
```

#### Código 2

```
phone
```

#### Código 3

```
phone
```

#### Código 4

```
disconnected
```

#### Código 5

```
connecting
```

#### Código 6

```
connected
```

#### Código 7

```
{
  "phone": "5511999999999"
}

```

#### Código 8

```
{
  "phone": "5511999999999"
}

```

---

## Desconectar Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~disconnect](https://docs.uazapi.com/endpoint/post/instance~disconnect)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/disconnect
Desconectar instância

Desconecta a instância do WhatsApp, encerrando a sessão atual. Esta operação:

Encerra a conexão ativa

Requer novo QR code para reconectar

Diferenças entre desconectar e hibernar:

Desconectar: Encerra completamente a sessão, exigindo novo login

Hibernar: Mantém a sessão ativa, apenas pausa a conexão

Use este endpoint para:

Encerrar completamente uma sessão

Forçar uma nova autenticação

Limpar credenciais de uma instância

Reiniciar o processo de conexão

Estados possíveis após desconectar:

disconnected: Desconectado do WhatsApp

connecting: Em processo de reconexão (após usar /instance/connect)
```

### Blocos de Código

#### Código 1

```
/instance/disconnect
```

#### Código 2

```
disconnected
```

#### Código 3

```
connecting
```

---

## Status da Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/instance~status](https://docs.uazapi.com/endpoint/get/instance~status)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/instance/status
Verificar status da instância

Retorna o status atual de uma instância, incluindo:

Estado da conexão (disconnected, connecting, connected)
QR code atualizado (se em processo de conexão)
Código de pareamento (se disponível)
Informações da última desconexão
Detalhes completos da instância

Este endpoint é particularmente útil para:

Monitorar o progresso da conexão
Obter QR codes atualizados durante o processo de conexão
Verificar o estado atual da instância
Identificar problemas de conexão

Estados possíveis:

disconnected: Desconectado do WhatsApp
connecting: Em processo de conexão (aguardando QR code ou código de pareamento)
connected: Conectado e autenticado com sucesso
Responses
200
Sucesso
401
Token inválido/expirado
404
Instância não encontrada
500
Erro interno
```

### Blocos de Código

#### Código 1

```
/instance/status
```

#### Código 2

```
disconnected
```

#### Código 3

```
connecting
```

#### Código 4

```
connected
```

---

## Atualizar Nome Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~updateInstanceName](https://docs.uazapi.com/endpoint/post/instance~updateInstanceName)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/updateInstanceName
Atualizar nome da instância

Atualiza o nome de uma instância WhatsApp existente. O nome não precisa ser único.

Request
Body
name
string
required

Novo nome para a instância

Example: "Minha Nova Instância 2024!@#"

Responses
200
Sucesso
401
Token inválido/expirado
404
Instância não encontrada
500
Erro interno
```

### Blocos de Código

#### Código 1

```
/instance/updateInstanceName
```

---

## Deletar Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/delete/instance](https://docs.uazapi.com/endpoint/delete/instance)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
DELETE
/instance
Deletar instância

Remove a instância do sistema.

Responses
200
Instância deletada com sucesso
401
Falha na autenticação
404
Instância não encontrada
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/instance
```

---

## Obter Privacidade

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/instance~privacy](https://docs.uazapi.com/endpoint/get/instance~privacy)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/instance/privacy
Buscar configurações de privacidade

Busca as configurações de privacidade atuais da instância do WhatsApp.

Importante - Diferença entre Status e Broadcast:

Status: Refere-se ao recado personalizado que aparece embaixo do nome do usuário (ex: "Disponível", "Ocupado", texto personalizado)
Broadcast: Refere-se ao envio de "stories/reels" (fotos/vídeos temporários)

Limitação: As configurações de privacidade do broadcast (stories/reels) não estão disponíveis para alteração via API.

Retorna todas as configurações de privacidade como quem pode:

Adicionar aos grupos
Ver visto por último
Ver status (recado embaixo do nome)
Ver foto de perfil
Receber confirmação de leitura
Ver status online
Fazer chamadas
Responses
200
Configurações de privacidade obtidas com sucesso
401
Token de autenticação inválido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/instance/privacy
```

---

## Atualizar Privacidade

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~privacy](https://docs.uazapi.com/endpoint/post/instance~privacy)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/privacy
Alterar configurações de privacidade

Altera uma ou múltiplas configurações de privacidade da instância do WhatsApp de forma otimizada.

Importante - Diferença entre Status e Broadcast:

Status: Refere-se ao recado personalizado que aparece embaixo do nome do usuário (ex: "Disponível", "Ocupado", texto personalizado)
Broadcast: Refere-se ao envio de "stories/reels" (fotos/vídeos temporários)

Limitação: As configurações de privacidade do broadcast (stories/reels) não estão disponíveis para alteração via API.

Características:

✅ Eficiência: Altera apenas configurações que realmente mudaram
✅ Flexibilidade: Pode alterar uma ou múltiplas configurações na mesma requisição
✅ Feedback completo: Retorna todas as configurações atualizadas

Formato de entrada:

{
  "groupadd": "contacts",
  "last": "none",
  "status": "contacts"
}


Tipos de privacidade disponíveis:

groupadd: Quem pode adicionar aos grupos
last: Quem pode ver visto por último
status: Quem pode ver status (recado embaixo do nome)
profile: Quem pode ver foto de perfil
readreceipts: Confirmação de leitura
online: Quem pode ver status online
calladd: Quem pode fazer chamadas

Valores possíveis:

all: Todos
contacts: Apenas contatos
contact_blacklist: Contatos exceto bloqueados
none: Ninguém
match_last_seen: Corresponder ao visto por último (apenas para online)
known: Números conhecidos (apenas para calladd)
Request
Body
groupadd
string

Quem pode adicionar aos grupos. Valores - all, contacts, contact_blacklist, none

last
string

Quem pode ver visto por último. Valores - all, contacts, contact_blacklist, none

status
string

Quem pode ver status (recado embaixo do nome). Valores - all, contacts, contact_blacklist, none

profile
string

Quem pode ver foto de perfil. Valores - all, contacts, contact_blacklist, none

readreceipts
string

Confirmação de leitura. Valores - all, none

online
string

Quem pode ver status online. Valores - all, match_last_seen

calladd
string

Quem pode fazer chamadas. Valores - all, known

Responses
200
Configuração de privacidade alterada com sucesso
400
Dados de entrada inválidos
401
Token de autenticação inválido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/instance/privacy
```

#### Código 2

```
{
  "groupadd": "contacts",
  "last": "none",
  "status": "contacts"
}

```

#### Código 3

```
{
  "groupadd": "contacts",
  "last": "none",
  "status": "contacts"
}

```

#### Código 4

```
groupadd
```

#### Código 5

```
last
```

#### Código 6

```
status
```

#### Código 7

```
profile
```

#### Código 8

```
readreceipts
```

#### Código 9

```
online
```

#### Código 10

```
calladd
```

#### Código 11

```
all
```

#### Código 12

```
contacts
```

#### Código 13

```
contact_blacklist
```

#### Código 14

```
none
```

#### Código 15

```
match_last_seen
```

#### Código 16

```
known
```

---

## Atualizar Presença

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/instance~presence](https://docs.uazapi.com/endpoint/post/instance~presence)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Conectar instância ao WhatsApp
POST
Desconectar instância
POST
Verificar status da instância
GET
Atualizar nome da instância
POST
Deletar instância
DELETE
Buscar configurações de privacidade
GET
Alterar configurações de privacidade
POST
Atualizar status de presença da instância
POST
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/instance/presence
Atualizar status de presença da instância

Atualiza o status de presença global da instância do WhatsApp. Este endpoint permite:

Definir se a instância está disponível (Aparece "online") ou indisponível
Controlar o status de presença para todos os contatos
Salvar o estado atual da presença na instância

Tipos de presença suportados:

available: Marca a instância como disponível/online
unavailable: Marca a instância como indisponível/offline

Atenção:

O status de presença pode ser temporariamente alterado para "available" (online) em algumas situações internas da API, e com isso o visto por último também pode ser atualizado.
Caso isso for um problema, considere alterar suas configurações de privacidade no WhatsApp para não mostrar o visto por último e/ou quem pode ver seu status "online".

⚠️ Importante - Limitação do Presence "unavailable":

Quando a API é o único dispositivo ativo: Confirmações de entrega/leitura (ticks cinzas/azuis) não são enviadas nem recebidas
Impacto: Eventos message_update com status de entrega podem não ser recebidos
Solução: Se precisar das confirmações, mantenha WhatsApp Web ou aplicativo móvel ativo ou use presence "available"

Exemplo de requisição:

{
  "presence": "available"
}


Exemplo de resposta:

{
  "response": "Presence updated successfully"
}


Erros comuns:

401: Token inválido ou expirado
400: Valor de presença inválido
500: Erro ao atualizar presença
Request
Body
presence
string
required

Status de presença da instância

Example: "available"

Responses
200
Presença atualizada com sucesso
400
Requisição inválida
401
Token inválido ou expirado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/instance/presence
```

#### Código 2

```
message_update
```

#### Código 3

```
{
  "presence": "available"
}

```

#### Código 4

```
{
  "presence": "available"
}

```

#### Código 5

```
{
  "response": "Presence updated successfully"
}

```

#### Código 6

```
{
  "response": "Presence updated successfully"
}

```

---

# Webhooks Globais

## Obter Webhook Global

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/globalwebhook](https://docs.uazapi.com/endpoint/get/globalwebhook)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Criar Instancia
POST
Listar todas as instâncias
GET
Atualizar campos administrativos
POST
Ver Webhook Global
GET
Configurar Webhook Global
POST
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/globalwebhook
Ver Webhook Global

Retorna a configuração atual do webhook global, incluindo:

URL configurada
Eventos ativos
Filtros aplicados
Configurações adicionais

Exemplo de resposta:

{
  "enabled": true,
  "url": "https://example.com/webhook",
  "events": ["messages", "messages_update"],
  "excludeMessages": ["wasSentByApi", "isGroupNo"],
  "addUrlEvents": true,
  "addUrlTypesMessages": true
}

Responses
200
Configuração atual do webhook global
401
Token de administrador não fornecido
403
Token de administrador inválido ou servidor demo
404
Webhook global não encontrado
```

### Blocos de Código

#### Código 1

```
/globalwebhook
```

#### Código 2

```
{
  "enabled": true,
  "url": "https://example.com/webhook",
  "events": ["messages", "messages_update"],
  "excludeMessages": ["wasSentByApi", "isGroupNo"],
  "addUrlEvents": true,
  "addUrlTypesMessages": true
}

```

#### Código 3

```
{
  "enabled": true,
  "url": "https://example.com/webhook",
  "events": ["messages", "messages_update"],
  "excludeMessages": ["wasSentByApi", "isGroupNo"],
  "addUrlEvents": true,
  "addUrlTypesMessages": true
}

```

---

## Configurar Webhook Global

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/globalwebhook](https://docs.uazapi.com/endpoint/post/globalwebhook)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Criar Instancia
POST
Listar todas as instâncias
GET
Atualizar campos administrativos
POST
Ver Webhook Global
GET
Configurar Webhook Global
POST
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/globalwebhook
Configurar Webhook Global

Configura um webhook global que receberá eventos de todas as instâncias.

🚀 Configuração Simples (Recomendada)

Para a maioria dos casos de uso:

Configure apenas URL e eventos desejados
Modo simples por padrão (sem complexidade)
Recomendado: Sempre use "excludeMessages": ["wasSentByApi"] para evitar loops
Exemplo: {"url": "https://webhook.cool/global", "events": ["messages", "connection"], "excludeMessages": ["wasSentByApi"]}
🧪 Sites para Testes (ordenados por qualidade)

Para testar webhooks durante desenvolvimento:

https://webhook.cool/ - ⭐ Melhor opção (sem rate limit, interface limpa)
https://rbaskets.in/ - ⭐ Boa alternativa (confiável, baixo rate limit)
https://webhook.site/ - ⚠️ Evitar se possível (rate limit agressivo)
Funcionalidades Principais:
Configuração de URL para recebimento de eventos
Seleção granular de tipos de eventos
Filtragem avançada de mensagens
Parâmetros adicionais na URL

Eventos Disponíveis:

connection: Alterações no estado da conexão
history: Recebimento de histórico de mensagens
messages: Novas mensagens recebidas
messages_update: Atualizações em mensagens existentes
call: Eventos de chamadas VoIP
contacts: Atualizações na agenda de contatos
presence: Alterações no status de presença
groups: Modificações em grupos
labels: Gerenciamento de etiquetas
chats: Eventos de conversas
chat_labels: Alterações em etiquetas de conversas
blocks: Bloqueios/desbloqueios
leads: Atualizações de leads
sender: Atualizações de campanhas, quando inicia, e quando completa

Remover mensagens com base nos filtros:

wasSentByApi: Mensagens originadas pela API ⚠️ IMPORTANTE: Use sempre este filtro para evitar loops em automações
wasNotSentByApi: Mensagens não originadas pela API
fromMeYes: Mensagens enviadas pelo usuário
fromMeNo: Mensagens recebidas de terceiros
isGroupYes: Mensagens em grupos
isGroupNo: Mensagens em conversas individuais

💡 Prevenção de Loops Globais: O webhook global recebe eventos de TODAS as instâncias. Se você tem automações que enviam mensagens via API, sempre inclua "excludeMessages": ["wasSentByApi"]. Caso prefira receber esses eventos, certifique-se de que sua automação detecta mensagens enviadas pela própria API para não criar loops infinitos em múltiplas instâncias.

Parâmetros de URL:

addUrlEvents (boolean): Quando ativo, adiciona o tipo do evento como path parameter na URL. Exemplo: https://api.example.com/webhook/{evento}
addUrlTypesMessages (boolean): Quando ativo, adiciona o tipo da mensagem como path parameter na URL. Exemplo: https://api.example.com/webhook/{tipo_mensagem}

Combinações de Parâmetros:

Ambos ativos: https://api.example.com/webhook/{evento}/{tipo_mensagem} Exemplo real: https://api.example.com/webhook/message/conversation
Apenas eventos: https://api.example.com/webhook/message
Apenas tipos: https://api.example.com/webhook/conversation

Notas Técnicas:

Os parâmetros são adicionados na ordem: evento → tipo mensagem
A URL deve ser configurada para aceitar esses parâmetros dinâmicos
Funciona com qualquer combinação de eventos/mensagens
Request
Body
url
string
required

URL para receber os eventos

Example: "https://webhook.cool/global"

events
array
required

Lista de eventos monitorados

Example: ["messages","connection"]

excludeMessages
array

Filtros para excluir tipos de mensagens

Example: ["wasSentByApi"]

addUrlEvents
boolean

Adiciona o tipo do evento como parâmetro na URL.

false (padrão): URL normal
true: Adiciona evento na URL (ex: /webhook/message)
addUrlTypesMessages
boolean

Adiciona o tipo da mensagem como parâmetro na URL.

false (padrão): URL normal
true: Adiciona tipo da mensagem (ex: /webhook/conversation)
Responses
200
Webhook global configurado com sucesso
400
Payload inválido
401
Token de administrador não fornecido
403
Token de administrador inválido ou servidor demo
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/globalwebhook
```

#### Código 2

```
"excludeMessages": ["wasSentByApi"]
```

#### Código 3

```
{"url": "https://webhook.cool/global", "events": ["messages", "connection"], "excludeMessages": ["wasSentByApi"]}
```

#### Código 4

```
connection
```

#### Código 5

```
history
```

#### Código 6

```
messages
```

#### Código 7

```
messages_update
```

#### Código 8

```
call
```

#### Código 9

```
contacts
```

#### Código 10

```
presence
```

#### Código 11

```
groups
```

#### Código 12

```
labels
```

#### Código 13

```
chats
```

#### Código 14

```
chat_labels
```

#### Código 15

```
blocks
```

#### Código 16

```
leads
```

#### Código 17

```
sender
```

#### Código 18

```
wasSentByApi
```

#### Código 19

```
wasNotSentByApi
```

#### Código 20

```
fromMeYes
```

#### Código 21

```
fromMeNo
```

#### Código 22

```
isGroupYes
```

#### Código 23

```
isGroupNo
```

#### Código 24

```
"excludeMessages": ["wasSentByApi"]
```

#### Código 25

```
addUrlEvents
```

#### Código 26

```
https://api.example.com/webhook/{evento}
```

#### Código 27

```
addUrlTypesMessages
```

#### Código 28

```
https://api.example.com/webhook/{tipo_mensagem}
```

#### Código 29

```
https://api.example.com/webhook/{evento}/{tipo_mensagem}
```

#### Código 30

```
https://api.example.com/webhook/message/conversation
```

#### Código 31

```
https://api.example.com/webhook/message
```

#### Código 32

```
https://api.example.com/webhook/conversation
```

#### Código 33

```
false
```

#### Código 34

```
true
```

#### Código 35

```
/webhook/message
```

#### Código 36

```
false
```

#### Código 37

```
true
```

#### Código 38

```
/webhook/conversation
```

---

# Perfil

## Atualizar Nome Perfil

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/profile~name](https://docs.uazapi.com/endpoint/post/profile~name)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Altera o nome do perfil do WhatsApp
POST
Altera a imagem do perfil do WhatsApp
POST
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/profile/name
Altera o nome do perfil do WhatsApp

Altera o nome de exibição do perfil da instância do WhatsApp.

O endpoint realiza:

Atualiza o nome do perfil usando o WhatsApp AppState
Sincroniza a mudança com o servidor do WhatsApp
Retorna confirmação da alteração

Importante:

A instância deve estar conectada ao WhatsApp
O nome será visível para todos os contatos
Pode haver um limite de alterações por período (conforme WhatsApp)
Request
Body
name
string
required

Novo nome do perfil do WhatsApp

Example: "Minha Empresa - Atendimento"

Responses
200
Nome do perfil alterado com sucesso
400
Dados inválidos na requisição
401
Sem sessão ativa
403
Ação não permitida
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/profile/name
```

---

## Atualizar Foto Perfil

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/profile~image](https://docs.uazapi.com/endpoint/post/profile~image)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Altera o nome do perfil do WhatsApp
POST
Altera a imagem do perfil do WhatsApp
POST
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/profile/image
Altera a imagem do perfil do WhatsApp

Altera a imagem de perfil da instância do WhatsApp.

O endpoint realiza:

Atualiza a imagem do perfil usando
Processa a imagem (URL, base64 ou comando de remoção)
Sincroniza a mudança com o servidor do WhatsApp
Retorna confirmação da alteração

Importante:

A instância deve estar conectada ao WhatsApp
A imagem será visível para todos os contatos
A imagem deve estar em formato JPEG e tamanho 640x640 pixels
Request
Body
image
string
required

Imagem do perfil. Pode ser:

URL da imagem (http/https)
String base64 da imagem
"remove" ou "delete" para remover a imagem atual

Example: "https://picsum.photos/640/640.jpg"

Responses
200
Imagem do perfil alterada com sucesso
400
Dados inválidos na requisição
401
Sem sessão ativa
403
Ação não permitida
413
Imagem muito grande
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/profile/image
```

---

# Chamadas

## Fazer Chamada

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/call~make](https://docs.uazapi.com/endpoint/post/call~make)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Iniciar chamada de voz
POST
Rejeitar chamada recebida
POST
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/call/make
Iniciar chamada de voz

Inicia uma chamada de voz para um contato específico. Este endpoint permite:

Iniciar chamadas de voz para contatos
Funciona apenas com números válidos do WhatsApp
O contato receberá uma chamada de voz

Nota: O telefone do contato tocará normalmente, mas ao contato atender, ele não ouvirá nada, e você também não ouvirá nada. Este endpoint apenas inicia a chamada, não estabelece uma comunicação de voz real.

Exemplo de requisição:

{
  "number": "5511999999999"
}


Exemplo de resposta:

{
  "response": "Call successful"
}


Erros comuns:

401: Token inválido ou expirado
400: Número inválido ou ausente
500: Erro ao iniciar chamada
Request
Body
number
string
required

Número do contato no formato internacional (ex: 5511999999999)

Example: "5511999999999"

Responses
200
Chamada iniciada com sucesso
400
Requisição inválida
401
Token inválido ou expirado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/call/make
```

#### Código 2

```
{
  "number": "5511999999999"
}

```

#### Código 3

```
{
  "number": "5511999999999"
}

```

#### Código 4

```
{
  "response": "Call successful"
}

```

#### Código 5

```
{
  "response": "Call successful"
}

```

---

## Rejeitar Chamada

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/call~reject](https://docs.uazapi.com/endpoint/post/call~reject)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Iniciar chamada de voz
POST
Rejeitar chamada recebida
POST
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/call/reject
Rejeitar chamada recebida

Rejeita uma chamada recebida do WhatsApp. Este endpoint permite:

Rejeitar chamadas de voz ou vídeo recebidas
Necessita do número do contato que está ligando
Necessita do ID da chamada para identificação

Exemplo de requisição:

{
  "number": "5511999999999",
  "id": "ABEiGmo8oqkAcAKrBYQAAAAA_1"
}


Exemplo de resposta:

{
  "response": "Call rejected"
}


Erros comuns:

401: Token inválido ou expirado
400: Número inválido ou ID da chamada ausente
500: Erro ao rejeitar chamada
Request
Body
number
string
required

Número do contato no formato internacional (ex: 5511999999999)

Example: "5511999999999"

id
string
required

ID único da chamada a ser rejeitada

Example: "ABEiGmo8oqkAcAKrBYQAAAAA_1"

Responses
200
Chamada rejeitada com sucesso
400
Requisição inválida
401
Token inválido ou expirado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/call/reject
```

#### Código 2

```
{
  "number": "5511999999999",
  "id": "ABEiGmo8oqkAcAKrBYQAAAAA_1"
}

```

#### Código 3

```
{
  "number": "5511999999999",
  "id": "ABEiGmo8oqkAcAKrBYQAAAAA_1"
}

```

#### Código 4

```
{
  "response": "Call rejected"
}

```

#### Código 5

```
{
  "response": "Call rejected"
}

```

---

# Webhooks e SSE

## Obter Webhook Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/webhook](https://docs.uazapi.com/endpoint/get/webhook)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Ver Webhook da Instância
GET
Configurar Webhook da Instância
POST
Server-Sent Events (SSE)
GET
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/webhook
Ver Webhook da Instância

Retorna a configuração atual do webhook da instância, incluindo:

URL configurada
Eventos ativos
Filtros aplicados
Configurações adicionais

Exemplo de resposta:

[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "enabled": true,
    "url": "https://example.com/webhook",
    "events": ["messages", "messages_update"],
    "excludeMessages": ["wasSentByApi", "isGroupNo"],
    "addUrlEvents": true,
    "addUrlTypesMessages": true
  },
  {
    "id": "987fcdeb-51k3-09j8-x543-864297539100",
    "enabled": true,
    "url": "https://outro-endpoint.com/webhook",
    "events": ["connection", "presence"],
    "excludeMessages": [],
    "addUrlEvents": false,
    "addUrlTypesMessages": false
  }
]


A resposta é sempre um array, mesmo quando há apenas um webhook configurado.

Responses
200
Configuração do webhook retornada com sucesso
401
Token inválido ou não fornecido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/webhook
```

#### Código 2

```
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "enabled": true,
    "url": "https://example.com/webhook",
    "events": ["messages", "messages_update"],
    "excludeMessages": ["wasSentByApi", "isGroupNo"],
    "addUrlEvents": true,
    "addUrlTypesMessages": true
  },
  {
    "id": "987fcdeb-51k3-09j8-x543-864297539100",
    "enabled": true,
    "url": "https://outro-endpoint.com/webhook",
    "events": ["connection", "presence"],
    "excludeMessages": [],
    "addUrlEvents": false,
    "addUrlTypesMessages": false
  }
]

```

#### Código 3

```
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "enabled": true,
    "url": "https://example.com/webhook",
    "events": ["messages", "messages_update"],
    "excludeMessages": ["wasSentByApi", "isGroupNo"],
    "addUrlEvents": true,
    "addUrlTypesMessages": true
  },
  {
    "id": "987fcdeb-51k3-09j8-x543-864297539100",
    "enabled": true,
    "url": "https://outro-endpoint.com/webhook",
    "events": ["connection", "presence"],
    "excludeMessages": [],
    "addUrlEvents": false,
    "addUrlTypesMessages": false
  }
]

```

---

## Configurar Webhook Instância

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/webhook](https://docs.uazapi.com/endpoint/post/webhook)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Ver Webhook da Instância
GET
Configurar Webhook da Instância
POST
Server-Sent Events (SSE)
GET
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/webhook
Configurar Webhook da Instância

Gerencia a configuração de webhooks para receber eventos em tempo real da instância. Permite gerenciar múltiplos webhooks por instância através do campo ID e action.

🚀 Modo Simples (Recomendado)

Uso mais fácil - sem complexidade de IDs:

Não inclua action nem id no payload
Gerencia automaticamente um único webhook por instância
Cria novo ou atualiza o existente automaticamente
Recomendado: Sempre use "excludeMessages": ["wasSentByApi"] para evitar loops
Exemplo: {"url": "https://meusite.com/webhook", "events": ["messages"], "excludeMessages": ["wasSentByApi"]}
🧪 Sites para Testes (ordenados por qualidade)

Para testar webhooks durante desenvolvimento:

https://webhook.cool/ - ⭐ Melhor opção (sem rate limit, interface limpa)
https://rbaskets.in/ - ⭐ Boa alternativa (confiável, baixo rate limit)
https://webhook.site/ - ⚠️ Evitar se possível (rate limit agressivo)
⚙️ Modo Avançado (Para múltiplos webhooks)

Para usuários que precisam de múltiplos webhooks por instância:

💡 Dica: Mesmo precisando de múltiplos webhooks, considere usar addUrlEvents no modo simples. Um único webhook pode receber diferentes tipos de eventos em URLs específicas (ex: /webhook/message, /webhook/connection), eliminando a necessidade de múltiplos webhooks.

Criar Novo Webhook:

Use action: "add"
Não inclua id no payload
O sistema gera ID automaticamente

Atualizar Webhook Existente:

Use action: "update"
Inclua o id do webhook no payload
Todos os campos serão atualizados

Remover Webhook:

Use action: "delete"
Inclua apenas o id do webhook
Outros campos são ignorados
Eventos Disponíveis
connection: Alterações no estado da conexão
history: Recebimento de histórico de mensagens
messages: Novas mensagens recebidas
messages_update: Atualizações em mensagens existentes
call: Eventos de chamadas VoIP
contacts: Atualizações na agenda de contatos
presence: Alterações no status de presença
groups: Modificações em grupos
labels: Gerenciamento de etiquetas
chats: Eventos de conversas
chat_labels: Alterações em etiquetas de conversas
blocks: Bloqueios/desbloqueios
leads: Atualizações de leads
sender: Atualizações de campanhas, quando inicia, e quando completa

Remover mensagens com base nos filtros:

wasSentByApi: Mensagens originadas pela API ⚠️ IMPORTANTE: Use sempre este filtro para evitar loops em automações
wasNotSentByApi: Mensagens não originadas pela API
fromMeYes: Mensagens enviadas pelo usuário
fromMeNo: Mensagens recebidas de terceiros
isGroupYes: Mensagens em grupos
isGroupNo: Mensagens em conversas individuais

💡 Prevenção de Loops: Se você tem automações que enviam mensagens via API, sempre inclua "excludeMessages": ["wasSentByApi"] no seu webhook. Caso prefira receber esses eventos, certifique-se de que sua automação detecta mensagens enviadas pela própria API para não criar loops infinitos.

Ações Suportadas:

add: Registrar novo webhook
delete: Remover webhook existente

Parâmetros de URL:

addUrlEvents (boolean): Quando ativo, adiciona o tipo do evento como path parameter na URL. Exemplo: https://api.example.com/webhook/{evento}
addUrlTypesMessages (boolean): Quando ativo, adiciona o tipo da mensagem como path parameter na URL. Exemplo: https://api.example.com/webhook/{tipo_mensagem}

Combinações de Parâmetros:

Ambos ativos: https://api.example.com/webhook/{evento}/{tipo_mensagem} Exemplo real: https://api.example.com/webhook/message/conversation
Apenas eventos: https://api.example.com/webhook/message
Apenas tipos: https://api.example.com/webhook/conversation

Notas Técnicas:

Os parâmetros são adicionados na ordem: evento → tipo mensagem
A URL deve ser configurada para aceitar esses parâmetros dinâmicos
Funciona com qualquer combinação de eventos/mensagens
Request
Body
id
string

ID único do webhook (necessário para update/delete)

Example: "123e4567-e89b-12d3-a456-426614174000"

enabled
boolean

Habilita/desabilita o webhook

Example: true

url
string
required

URL para receber os eventos

Example: "https://example.com/webhook"

events
array

Lista de eventos monitorados

excludeMessages
array

Filtros para excluir tipos de mensagens

addUrlEvents
boolean

Adiciona o tipo do evento como parâmetro na URL.

false (padrão): URL normal
true: Adiciona evento na URL (ex: /webhook/message)
addUrlTypesMessages
boolean

Adiciona o tipo da mensagem como parâmetro na URL.

false (padrão): URL normal
true: Adiciona tipo da mensagem (ex: /webhook/conversation)
action
string

Ação a ser executada:

add: criar novo webhook
update: atualizar webhook existente (requer id)
delete: remover webhook (requer apenas id) Se não informado, opera no modo simples (único webhook)
Responses
200
Webhook configurado ou atualizado com sucesso
400
Requisição inválida
401
Token inválido ou não fornecido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/webhook
```

#### Código 2

```
action
```

#### Código 3

```
id
```

#### Código 4

```
"excludeMessages": ["wasSentByApi"]
```

#### Código 5

```
{"url": "https://meusite.com/webhook", "events": ["messages"], "excludeMessages": ["wasSentByApi"]}
```

#### Código 6

```
addUrlEvents
```

#### Código 7

```
/webhook/message
```

#### Código 8

```
/webhook/connection
```

#### Código 9

```
action: "add"
```

#### Código 10

```
id
```

#### Código 11

```
action: "update"
```

#### Código 12

```
id
```

#### Código 13

```
action: "delete"
```

#### Código 14

```
id
```

#### Código 15

```
connection
```

#### Código 16

```
history
```

#### Código 17

```
messages
```

#### Código 18

```
messages_update
```

#### Código 19

```
call
```

#### Código 20

```
contacts
```

#### Código 21

```
presence
```

#### Código 22

```
groups
```

#### Código 23

```
labels
```

#### Código 24

```
chats
```

#### Código 25

```
chat_labels
```

#### Código 26

```
blocks
```

#### Código 27

```
leads
```

#### Código 28

```
sender
```

#### Código 29

```
wasSentByApi
```

#### Código 30

```
wasNotSentByApi
```

#### Código 31

```
fromMeYes
```

#### Código 32

```
fromMeNo
```

#### Código 33

```
isGroupYes
```

#### Código 34

```
isGroupNo
```

#### Código 35

```
"excludeMessages": ["wasSentByApi"]
```

#### Código 36

```
add
```

#### Código 37

```
delete
```

#### Código 38

```
addUrlEvents
```

#### Código 39

```
https://api.example.com/webhook/{evento}
```

#### Código 40

```
addUrlTypesMessages
```

#### Código 41

```
https://api.example.com/webhook/{tipo_mensagem}
```

#### Código 42

```
https://api.example.com/webhook/{evento}/{tipo_mensagem}
```

#### Código 43

```
https://api.example.com/webhook/message/conversation
```

#### Código 44

```
https://api.example.com/webhook/message
```

#### Código 45

```
https://api.example.com/webhook/conversation
```

#### Código 46

```
false
```

#### Código 47

```
true
```

#### Código 48

```
/webhook/message
```

#### Código 49

```
false
```

#### Código 50

```
true
```

#### Código 51

```
/webhook/conversation
```

---

## Server-Sent Events

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/sse](https://docs.uazapi.com/endpoint/get/sse)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Ver Webhook da Instância
GET
Configurar Webhook da Instância
POST
Server-Sent Events (SSE)
GET
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/sse
Server-Sent Events (SSE)

Receber eventos em tempo real via Server-Sent Events (SSE)

Funcionalidades Principais:
Configuração de URL para recebimento de eventos
Seleção granular de tipos de eventos
Filtragem avançada de mensagens
Parâmetros adicionais na URL
Gerenciamento múltiplo de webhooks

Eventos Disponíveis:

connection: Alterações no estado da conexão
history: Recebimento de histórico de mensagens
messages: Novas mensagens recebidas
messages_update: Atualizações em mensagens existentes
call: Eventos de chamadas VoIP
contacts: Atualizações na agenda de contatos
presence: Alterações no status de presença
groups: Modificações em grupos
labels: Gerenciamento de etiquetas
chats: Eventos de conversas
chat_labels: Alterações em etiquetas de conversas
blocks: Bloqueios/desbloqueios
leads: Atualizações de leads

Estabelece uma conexão persistente para receber eventos em tempo real. Este endpoint:

Requer autenticação via token

Mantém uma conexão HTTP aberta com o cliente

Envia eventos conforme ocorrem no servidor

Suporta diferentes tipos de eventos

Exemplo de uso:


const eventSource = new
EventSource('/sse?token=SEU_TOKEN&events=chats,messages');


eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Novo evento:', data);
};


eventSource.onerror = function(error) {
  console.error('Erro na conexão SSE:', error);
};



Estrutura de um evento:


{
  "type": "message",
  "data": {
    "id": "3EB0538DA65A59F6D8A251",
    "from": "5511999999999@s.whatsapp.net",
    "to": "5511888888888@s.whatsapp.net",
    "text": "Olá!",
    "timestamp": 1672531200000
  }
}


Parameters
Query Parameters
token
string
required

Token de autenticação da instância

events
string
required

Tipos de eventos a serem recebidos (separados por vírgula)
```

### Blocos de Código

#### Código 1

```
/sse
```

#### Código 2

```
connection
```

#### Código 3

```
history
```

#### Código 4

```
messages
```

#### Código 5

```
messages_update
```

#### Código 6

```
call
```

#### Código 7

```
contacts
```

#### Código 8

```
presence
```

#### Código 9

```
groups
```

#### Código 10

```
labels
```

#### Código 11

```
chats
```

#### Código 12

```
chat_labels
```

#### Código 13

```
blocks
```

#### Código 14

```
leads
```

#### Código 15

```

const eventSource = new
EventSource('/sse?token=SEU_TOKEN&events=chats,messages');


eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Novo evento:', data);
};


eventSource.onerror = function(error) {
  console.error('Erro na conexão SSE:', error);
};


```

#### Código 16

```

const eventSource = new
EventSource('/sse?token=SEU_TOKEN&events=chats,messages');


eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Novo evento:', data);
};


eventSource.onerror = function(error) {
  console.error('Erro na conexão SSE:', error);
};


```

#### Código 17

```

{
  "type": "message",
  "data": {
    "id": "3EB0538DA65A59F6D8A251",
    "from": "5511999999999@s.whatsapp.net",
    "to": "5511888888888@s.whatsapp.net",
    "text": "Olá!",
    "timestamp": 1672531200000
  }
}


```

#### Código 18

```

{
  "type": "message",
  "data": {
    "id": "3EB0538DA65A59F6D8A251",
    "from": "5511999999999@s.whatsapp.net",
    "to": "5511888888888@s.whatsapp.net",
    "text": "Olá!",
    "timestamp": 1672531200000
  }
}


```

#### Código 19

```
token
```

#### Código 20

```
events
```

---

# Envio de Mensagens

## Enviar Texto

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~text](https://docs.uazapi.com/endpoint/post/send~text)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/text
Enviar mensagem de texto

Envia uma mensagem de texto para um contato ou grupo.

Recursos Específicos
Preview de links com suporte a personalização automática ou customizada
Formatação básica do texto
Substituição automática de placeholders dinâmicos
Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Preview de Links
Preview Automático
{
  "number": "5511999999999",
  "text": "Confira: https://exemplo.com",
  "linkPreview": true
}

Preview Personalizado
{
  "number": "5511999999999",
  "text": "Confira nosso site! https://exemplo.com",
  "linkPreview": true,
  "linkPreviewTitle": "Título Personalizado",
  "linkPreviewDescription": "Uma descrição personalizada do link",
  "linkPreviewImage": "https://exemplo.com/imagem.jpg",
  "linkPreviewLarge": true
}

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

text
string
required

Texto da mensagem (aceita placeholders)

Example: "Olá {{name}}! Como posso ajudar?"

linkPreview
boolean

Ativa/desativa preview de links. Se true, procura automaticamente um link no texto para gerar preview.

Comportamento:

Se apenas linkPreview=true: gera preview automático do primeiro link encontrado no texto
Se fornecidos campos personalizados (title, description, image): usa os valores fornecidos
Se campos personalizados parciais: combina com dados automáticos do link como fallback

Example: true

linkPreviewTitle
string

Define um título personalizado para o preview do link

Example: "Título Personalizado"

linkPreviewDescription
string

Define uma descrição personalizada para o preview do link

Example: "Descrição personalizada do link"

linkPreviewImage
string

URL ou Base64 da imagem para usar no preview do link

Example: "https://exemplo.com/imagem.jpg"

linkPreviewLarge
boolean

Se true, gera um preview grande com upload da imagem. Se false, gera um preview pequeno sem upload

Example: true

replyid
string

ID da mensagem para responder

Example: "3EB0538DA65A59F6D8A251"

mentions
string

Números para mencionar (separados por vírgula)

Example: "5511999999999,5511888888888"

readchat
boolean

Marca conversa como lida após envio

Example: true

readmessages
boolean

Marca últimas mensagens recebidas como lidas

Example: true

delay
integer

Atraso em milissegundos antes do envio, durante o atraso apacerá 'Digitando...'

Example: 1000

forward
boolean

Marca a mensagem como encaminhada no WhatsApp

Example: true

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Mensagem enviada com sucesso
400
Requisição inválida
401
Não autorizado
429
Limite de requisições excedido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/text
```

#### Código 2

```
delay
```

#### Código 3

```
readchat
```

#### Código 4

```
readmessages
```

#### Código 5

```
replyid
```

#### Código 6

```
mentions
```

#### Código 7

```
forward
```

#### Código 8

```
track_source
```

#### Código 9

```
track_id
```

#### Código 10

```
{
  "number": "5511999999999",
  "text": "Confira: https://exemplo.com",
  "linkPreview": true
}

```

#### Código 11

```
{
  "number": "5511999999999",
  "text": "Confira: https://exemplo.com",
  "linkPreview": true
}

```

#### Código 12

```
{
  "number": "5511999999999",
  "text": "Confira nosso site! https://exemplo.com",
  "linkPreview": true,
  "linkPreviewTitle": "Título Personalizado",
  "linkPreviewDescription": "Uma descrição personalizada do link",
  "linkPreviewImage": "https://exemplo.com/imagem.jpg",
  "linkPreviewLarge": true
}

```

#### Código 13

```
{
  "number": "5511999999999",
  "text": "Confira nosso site! https://exemplo.com",
  "linkPreview": true,
  "linkPreviewTitle": "Título Personalizado",
  "linkPreviewDescription": "Uma descrição personalizada do link",
  "linkPreviewImage": "https://exemplo.com/imagem.jpg",
  "linkPreviewLarge": true
}

```

---

## Enviar Mídia

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~media](https://docs.uazapi.com/endpoint/post/send~media)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/media
Enviar mídia (imagem, vídeo, áudio ou documento)

Envia diferentes tipos de mídia para um contato ou grupo. Suporta URLs ou arquivos base64.

Tipos de Mídia Suportados
image: Imagens (JPG preferencialmente)
video: Vídeos (apenas MP4)
document: Documentos (PDF, DOCX, XLSX, etc)
audio: Áudio comum (MP3 ou OGG)
myaudio: Mensagem de voz (alternativa ao PTT)
ptt: Mensagem de voz (Push-to-Talk)
sticker: Figurinha/Sticker
Recursos Específicos
Upload por URL ou base64
Caption/legenda opcional com suporte a placeholders
Nome personalizado para documentos (docName)
Geração automática de thumbnails
Compressão otimizada conforme o tipo
Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Exemplos Básicos
Imagem Simples
{
  "number": "5511999999999",
  "type": "image",
  "file": "https://exemplo.com/foto.jpg"
}

Documento com Nome
{
  "number": "5511999999999",
  "type": "document",
  "file": "https://exemplo.com/contrato.pdf",
  "docName": "Contrato.pdf",
  "text": "Segue o documento solicitado"
}

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

type
string
required

Tipo de mídia (image, video, document, audio, myaudio, ptt, sticker)

Example: "image"

file
string
required

URL ou base64 do arquivo

Example: "https://exemplo.com/imagem.jpg"

text
string

Texto descritivo (caption) - aceita placeholders

Example: "Veja esta foto!"

docName
string

Nome do arquivo (apenas para documents)

Example: "relatorio.pdf"

replyid
string

ID da mensagem para responder

Example: "3EB0538DA65A59F6D8A251"

mentions
string

Números para mencionar (separados por vírgula)

Example: "5511999999999,5511888888888"

readchat
boolean

Marca conversa como lida após envio

Example: true

readmessages
boolean

Marca últimas mensagens recebidas como lidas

Example: true

delay
integer

Atraso em milissegundos antes do envio, durante o atraso apacerá 'Digitando...' ou 'Gravando áudio...'

Example: 1000

forward
boolean

Marca a mensagem como encaminhada no WhatsApp

Example: true

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Mídia enviada com sucesso
400
Requisição inválida
401
Não autorizado
413
Arquivo muito grande
415
Formato de mídia não suportado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/media
```

#### Código 2

```
image
```

#### Código 3

```
video
```

#### Código 4

```
document
```

#### Código 5

```
audio
```

#### Código 6

```
myaudio
```

#### Código 7

```
ptt
```

#### Código 8

```
sticker
```

#### Código 9

```
docName
```

#### Código 10

```
delay
```

#### Código 11

```
readchat
```

#### Código 12

```
readmessages
```

#### Código 13

```
replyid
```

#### Código 14

```
mentions
```

#### Código 15

```
forward
```

#### Código 16

```
track_source
```

#### Código 17

```
track_id
```

#### Código 18

```
{
  "number": "5511999999999",
  "type": "image",
  "file": "https://exemplo.com/foto.jpg"
}

```

#### Código 19

```
{
  "number": "5511999999999",
  "type": "image",
  "file": "https://exemplo.com/foto.jpg"
}

```

#### Código 20

```
{
  "number": "5511999999999",
  "type": "document",
  "file": "https://exemplo.com/contrato.pdf",
  "docName": "Contrato.pdf",
  "text": "Segue o documento solicitado"
}

```

#### Código 21

```
{
  "number": "5511999999999",
  "type": "document",
  "file": "https://exemplo.com/contrato.pdf",
  "docName": "Contrato.pdf",
  "text": "Segue o documento solicitado"
}

```

---

## Enviar Contato

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~contact](https://docs.uazapi.com/endpoint/post/send~contact)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/contact
Enviar cartão de contato (vCard)

Envia um cartão de contato (vCard) para um contato ou grupo.

Recursos Específicos
vCard completo com nome, telefones, organização, email e URL
Múltiplos números de telefone (separados por vírgula)
Cartão clicável no WhatsApp para salvar na agenda
Informações profissionais (organização/empresa)
Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Exemplo Básico
{
  "number": "5511999999999",
  "fullName": "João Silva",
  "phoneNumber": "5511999999999,5511888888888",
  "organization": "Empresa XYZ",
  "email": "joao.silva@empresa.com",
  "url": "https://empresa.com/joao"
}

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

fullName
string
required

Nome completo do contato

Example: "João Silva"

phoneNumber
string
required

Números de telefone (separados por vírgula)

Example: "5511999999999,5511888888888"

organization
string

Nome da organização/empresa

Example: "Empresa XYZ"

email
string

Endereço de email

Example: "joao@empresa.com"

url
string

URL pessoal ou da empresa

Example: "https://empresa.com/joao"

replyid
string

ID da mensagem para responder

Example: "3EB0538DA65A59F6D8A251"

mentions
string

Números para mencionar (separados por vírgula)

Example: "5511999999999,5511888888888"

readchat
boolean

Marca conversa como lida após envio

Example: true

readmessages
boolean

Marca últimas mensagens recebidas como lidas

Example: true

delay
integer

Atraso em milissegundos antes do envio, durante o atraso apacerá 'Digitando...'

Example: 1000

forward
boolean

Marca a mensagem como encaminhada no WhatsApp

Example: true

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Cartão de contato enviado com sucesso
400
Requisição inválida
401
Não autorizado
429
Limite de requisições excedido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/contact
```

#### Código 2

```
delay
```

#### Código 3

```
readchat
```

#### Código 4

```
readmessages
```

#### Código 5

```
replyid
```

#### Código 6

```
mentions
```

#### Código 7

```
forward
```

#### Código 8

```
track_source
```

#### Código 9

```
track_id
```

#### Código 10

```
{
  "number": "5511999999999",
  "fullName": "João Silva",
  "phoneNumber": "5511999999999,5511888888888",
  "organization": "Empresa XYZ",
  "email": "joao.silva@empresa.com",
  "url": "https://empresa.com/joao"
}

```

#### Código 11

```
{
  "number": "5511999999999",
  "fullName": "João Silva",
  "phoneNumber": "5511999999999,5511888888888",
  "organization": "Empresa XYZ",
  "email": "joao.silva@empresa.com",
  "url": "https://empresa.com/joao"
}

```

---

## Enviar Localização

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~location](https://docs.uazapi.com/endpoint/post/send~location)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/location
Enviar localização geográfica

Envia uma localização geográfica para um contato ou grupo.

Recursos Específicos
Coordenadas precisas (latitude e longitude obrigatórias)
Nome do local para identificação
Mapa interativo no WhatsApp para navegação
Pin personalizado com nome do local
Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Exemplo Básico
{
  "number": "5511999999999",
  "name": "Maracanã",
  "address": "Av. Pres. Castelo Branco, Portão 3 - Maracanã, Rio de Janeiro - RJ, 20271-130",
  "latitude": -22.912982815767986,
  "longitude": -43.23028153499254
}

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

name
string

Nome do local

Example: "MASP"

address
string

Endereço completo do local

Example: "Av. Paulista, 1578 - Bela Vista"

latitude
number
required

Latitude (-90 a 90)

Example: -23.5616

longitude
number
required

Longitude (-180 a 180)

Example: -46.6562

replyid
string

ID da mensagem para responder

Example: "3EB0538DA65A59F6D8A251"

mentions
string

Números para mencionar (separados por vírgula)

Example: "5511999999999,5511888888888"

readchat
boolean

Marca conversa como lida após envio

Example: true

readmessages
boolean

Marca últimas mensagens recebidas como lidas

Example: true

delay
integer

Atraso em milissegundos antes do envio, durante o atraso apacerá 'Digitando...'

Example: 1000

forward
boolean

Marca a mensagem como encaminhada no WhatsApp

Example: true

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Localização enviada com sucesso
400
Requisição inválida
401
Não autorizado
429
Limite de requisições excedido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/location
```

#### Código 2

```
delay
```

#### Código 3

```
readchat
```

#### Código 4

```
readmessages
```

#### Código 5

```
replyid
```

#### Código 6

```
mentions
```

#### Código 7

```
forward
```

#### Código 8

```
track_source
```

#### Código 9

```
track_id
```

#### Código 10

```
{
  "number": "5511999999999",
  "name": "Maracanã",
  "address": "Av. Pres. Castelo Branco, Portão 3 - Maracanã, Rio de Janeiro - RJ, 20271-130",
  "latitude": -22.912982815767986,
  "longitude": -43.23028153499254
}

```

#### Código 11

```
{
  "number": "5511999999999",
  "name": "Maracanã",
  "address": "Av. Pres. Castelo Branco, Portão 3 - Maracanã, Rio de Janeiro - RJ, 20271-130",
  "latitude": -22.912982815767986,
  "longitude": -43.23028153499254
}

```

---

## Presença de Mensagem

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/message~presence](https://docs.uazapi.com/endpoint/post/message~presence)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/message/presence
Enviar atualização de presença

Envia uma atualização de presença para um contato ou grupo de forma assíncrona.

🔄 Comportamento Assíncrono:
Execução independente: A presença é gerenciada em background, não bloqueia o retorno da API
Limite máximo: 5 minutos de duração (300 segundos)
Tick de atualização: Reenvia a presença a cada 10 segundos
Cancelamento automático: Presença é cancelada automaticamente ao enviar uma mensagem para o mesmo chat
📱 Tipos de presença suportados:
composing: Indica que você está digitando uma mensagem
recording: Indica que você está gravando um áudio
paused: Remove/cancela a indicação de presença atual
⏱️ Controle de duração:
Sem delay: Usa limite padrão de 5 minutos
Com delay: Usa o valor especificado (máximo 5 minutos)
Cancelamento: Envio de mensagem cancela presença automaticamente
📋 Exemplos de uso:
Digitar por 30 segundos:
{
  "number": "5511999999999",
  "presence": "composing",
  "delay": 30000
}

Gravar áudio por 1 minuto:
{
  "number": "5511999999999",
  "presence": "recording",
  "delay": 60000
}

Cancelar presença atual:
{
  "number": "5511999999999",
  "presence": "paused"
}

Usar limite máximo (5 minutos):
{
  "number": "5511999999999",
  "presence": "composing"
}

Request
Body
number
string
required

Número do destinatário no formato internacional (ex: 5511999999999)

Example: "5511999999999"

presence
string
required

Tipo de presença a ser enviada

Example: "composing"

delay
integer

Duração em milissegundos que a presença ficará ativa (máximo 5 minutos = 300000ms). Se não informado ou valor maior que 5 minutos, usa o limite padrão de 5 minutos. A presença é reenviada a cada 10 segundos durante este período.

Example: 30000

Responses
200
Presença atualizada com sucesso
400
Requisição inválida
401
Token inválido ou expirado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/message/presence
```

#### Código 2

```
{
  "number": "5511999999999",
  "presence": "composing",
  "delay": 30000
}

```

#### Código 3

```
{
  "number": "5511999999999",
  "presence": "composing",
  "delay": 30000
}

```

#### Código 4

```
{
  "number": "5511999999999",
  "presence": "recording",
  "delay": 60000
}

```

#### Código 5

```
{
  "number": "5511999999999",
  "presence": "recording",
  "delay": 60000
}

```

#### Código 6

```
{
  "number": "5511999999999",
  "presence": "paused"
}

```

#### Código 7

```
{
  "number": "5511999999999",
  "presence": "paused"
}

```

#### Código 8

```
{
  "number": "5511999999999",
  "presence": "composing"
}

```

#### Código 9

```
{
  "number": "5511999999999",
  "presence": "composing"
}

```

---

## Enviar Status

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~status](https://docs.uazapi.com/endpoint/post/send~status)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/status
Enviar Stories (Status)

Envia um story (status) com suporte para texto, imagem, vídeo e áudio.

Suporte a campos de rastreamento: Este endpoint também suporta track_source e track_id documentados na tag "Enviar Mensagem".

Tipos de Status
text: Texto com estilo e cor de fundo
image: Imagens com legenda opcional
video: Vídeos com thumbnail e legenda
audio: Áudio normal ou mensagem de voz (PTT)
Cores de Fundo
1-3: Tons de amarelo
4-6: Tons de verde
7-9: Tons de azul
10-12: Tons de lilás
13: Magenta
14-15: Tons de rosa
16: Marrom claro
17-19: Tons de cinza (19 é o padrão)
Fontes (para texto)
0: Padrão
1-8: Estilos alternativos
Limites
Texto: Máximo 656 caracteres
Imagem: JPG, PNG, GIF
Vídeo: MP4, MOV
Áudio: MP3, OGG, WAV (convertido para OGG/OPUS)
Exemplo
{
  "type": "text",
  "text": "Novidades chegando!",
  "background_color": 7,
  "font": 1
}

Request
Body
type
string
required

Tipo do status

Example: "text"

text
string

Texto principal ou legenda

Example: "Novidades chegando!"

background_color
integer

Código da cor de fundo

Example: 7

font
integer

Estilo da fonte (apenas para type=text)

Example: 1

file
string

URL ou Base64 do arquivo de mídia

Example: "https://example.com/video.mp4"

thumbnail
string

URL ou Base64 da miniatura (opcional para vídeos)

Example: "https://example.com/thumb.jpg"

mimetype
string

MIME type do arquivo (opcional)

Example: "video/mp4"

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Status enviado com sucesso
400
Requisição inválida
401
Não autorizado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/status
```

#### Código 2

```
track_source
```

#### Código 3

```
track_id
```

#### Código 4

```
{
  "type": "text",
  "text": "Novidades chegando!",
  "background_color": 7,
  "font": 1
}

```

#### Código 5

```
{
  "type": "text",
  "text": "Novidades chegando!",
  "background_color": 7,
  "font": 1
}

```

---

## Enviar Menu

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~menu](https://docs.uazapi.com/endpoint/post/send~menu)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/menu
Enviar menu interativo (botões, carrosel, lista ou enquete)

Este endpoint oferece uma interface unificada para envio de quatro tipos principais de mensagens interativas:

Botões: Para ações rápidas e diretas
Carrosel de Botões: Para uma lista horizontal de botões com imagens
Listas: Para menus organizados em seções
Enquetes: Para coleta de opiniões e votações

Suporte a campos de rastreamento: Este endpoint também suporta track_source e track_id documentados na tag "Enviar Mensagem".

Estrutura Base do Payload

Todas as requisições seguem esta estrutura base:

{
  "number": "5511999999999",
  "type": "button|list|poll|carousel",
  "text": "Texto principal da mensagem",
  "choices": ["opções baseadas no tipo escolhido"],
  "footerText": "Texto do rodapé (opcional para botões e listas)",
  "listButton": "Texto do botão (para listas)",
  "selectableCount": "Número de opções selecionáveis (apenas para enquetes)"
}

Tipos de Mensagens Interativas
1. Botões (type: "button")

Cria botões interativos com diferentes funcionalidades de ação.

Campos Específicos
footerText: Texto opcional exibido abaixo da mensagem principal
choices: Array de opções que serão convertidas em botões
Formatos de Botões

Cada botão pode ser configurado usando | (pipe) ou \n (quebra de linha) como separadores:

Botão de Resposta:

"texto|id" ou
"texto\nid" ou
"texto" (ID será igual ao texto)

Botão de Cópia:

"texto|copy:código" ou
"texto\ncopy:código"

Botão de Chamada:

"texto|call:+5511999999999" ou
"texto\ncall:+5511999999999"

Botão de URL:

"texto|https://exemplo.com" ou
"texto|url:https://exemplo.com"
Botões com Imagem

Para adicionar uma imagem aos botões, use o campo imageButton no payload:

Exemplo com Imagem
{
  "number": "5511999999999",
  "type": "button",
  "text": "Escolha um produto:",
  "imageButton": "https://exemplo.com/produto1.jpg",
  "choices": [
    "Produto A|prod_a",
    "Mais Info|https://exemplo.com/produto-a",
    "Produto B|prod_b",
    "Ligar|call:+5511999999999"
  ],
  "footerText": "Produtos em destaque"
}


Suporte: O campo imageButton aceita URLs ou imagens em base64.

Exemplo Completo
{
  "number": "5511999999999",
  "type": "button",
  "text": "Como podemos ajudar?",
  "choices": [
    "Suporte Técnico|suporte",
    "Fazer Pedido|pedido",
    "Nosso Site|https://exemplo.com",
    "Falar Conosco|call:+5511999999999"
  ],
  "footerText": "Escolha uma das opções abaixo"
}

Limitações e Compatibilidade

Importante: Ao combinar botões de resposta com outros tipos (call, url, copy) na mesma mensagem, será exibido o aviso: "Não é possível exibir esta mensagem no WhatsApp Web. Abra o WhatsApp no seu celular para visualizá-la."

2. Listas (type: "list")

Cria menus organizados em seções com itens selecionáveis.

Campos Específicos
listButton: Texto do botão que abre a lista
footerText: Texto opcional do rodapé
choices: Array com seções e itens da lista
Formato das Choices
"[Título da Seção]": Inicia uma nova seção
"texto|id|descrição": Item da lista com:
texto: Label do item
id: Identificador único, opcional
descrição: Texto descritivo adicional e opcional
Exemplo Completo
{
  "number": "5511999999999",
  "type": "list",
  "text": "Catálogo de Produtos",
  "choices": [
    "[Eletrônicos]",
    "Smartphones|phones|Últimos lançamentos",
    "Notebooks|notes|Modelos 2024",
    "[Acessórios]",
    "Fones|fones|Bluetooth e com fio",
    "Capas|cases|Proteção para seu device"
  ],
  "listButton": "Ver Catálogo",
  "footerText": "Preços sujeitos a alteração"
}

3. Enquetes (type: "poll")

Cria enquetes interativas para votação.

Campos Específicos
selectableCount: Número de opções que podem ser selecionadas (padrão: 1)
choices: Array simples com as opções de voto
Exemplo Completo
{
  "number": "5511999999999",
  "type": "poll",
  "text": "Qual horário prefere para atendimento?",
  "choices": [
    "Manhã (8h-12h)",
    "Tarde (13h-17h)",
    "Noite (18h-22h)"
  ],
  "selectableCount": 1
}

4. Carousel (type: "carousel")

Cria um carrossel de cartões com imagens e botões interativos.

Campos Específicos
choices: Array com elementos do carrossel na seguinte ordem:
[Texto do cartão]: Texto do cartão entre colchetes
{URL ou base64 da imagem}: Imagem entre chaves
Botões do cartão (um por linha):
"texto|copy:código" para botão de copiar
"texto|https://url" para botão de link
"texto|call:+número" para botão de ligação
Exemplo Completo
{
  "number": "5511999999999",
  "type": "carousel",
  "text": "Conheça nossos produtos",
  "choices": [
    "[Smartphone XYZ\nO mais avançado smartphone da linha]",
    "{https://exemplo.com/produto1.jpg}",
    "Copiar Código|copy:PROD123",
    "Ver no Site|https://exemplo.com/xyz",
    "Fale Conosco|call:+5511999999999",
    "[Notebook ABC\nO notebook ideal para profissionais]",
    "{https://exemplo.com/produto2.jpg}",
    "Copiar Código|copy:NOTE456",
    "Comprar Online|https://exemplo.com/abc",
    "Suporte|call:+5511988888888"
  ]
}


Nota: Criamos outro endpoint para carrossel: /send/carousel, funciona da mesma forma, mas com outro formato de payload. Veja o que é mais fácil para você.

Termos de uso

Os recursos de botões interativos e listas podem ser descontinuados a qualquer momento sem aviso prévio. Não nos responsabilizamos por quaisquer alterações ou indisponibilidade destes recursos.

Alternativas e Compatibilidade

Considerando a natureza dinâmica destes recursos, nosso endpoint foi projetado para facilitar a migração entre diferentes tipos de mensagens (botões, listas e enquetes).

Recomendamos criar seus fluxos de forma flexível, preparados para alternar entre os diferentes tipos.

Em caso de descontinuidade de algum recurso, você poderá facilmente migrar para outro tipo de mensagem apenas alterando o campo "type" no payload, mantendo a mesma estrutura de choices.

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

type
string
required

Tipo do menu (button, list, poll, carousel)

Example: "list"

text
string
required

Texto principal (aceita placeholders)

Example: "Escolha uma opção:"

footerText
string

Texto do rodapé (opcional)

Example: "Menu de serviços"

listButton
string

Texto do botão principal

Example: "Ver opções"

selectableCount
integer

Número máximo de opções selecionáveis (para enquetes)

Example: 1

choices
array
required

Lista de opções. Use [Título] para seções em listas

Example: ["[Eletrônicos]","Smartphones|phones|Últimos lançamentos","Notebooks|notes|Modelos 2024","[Acessórios]","Fones|fones|Bluetooth e com fio","Capas|cases|Proteção para seu device"]

imageButton
string

URL da imagem para botões (recomendado para type: button)

Example: "https://exemplo.com/imagem-botao.jpg"

replyid
string

ID da mensagem para responder

Example: "3EB0538DA65A59F6D8A251"

mentions
string

Números para mencionar (separados por vírgula)

Example: "5511999999999,5511888888888"

readchat
boolean

Marca conversa como lida após envio

Example: true

readmessages
boolean

Marca últimas mensagens recebidas como lidas

Example: true

delay
integer

Atraso em milissegundos antes do envio, durante o atraso apacerá 'Digitando...'

Example: 1000

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Menu enviado com sucesso
400
Requisição inválida
401
Não autorizado
429
Limite de requisições excedido
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/menu
```

#### Código 2

```
track_source
```

#### Código 3

```
track_id
```

#### Código 4

```
{
  "number": "5511999999999",
  "type": "button|list|poll|carousel",
  "text": "Texto principal da mensagem",
  "choices": ["opções baseadas no tipo escolhido"],
  "footerText": "Texto do rodapé (opcional para botões e listas)",
  "listButton": "Texto do botão (para listas)",
  "selectableCount": "Número de opções selecionáveis (apenas para enquetes)"
}

```

#### Código 5

```
{
  "number": "5511999999999",
  "type": "button|list|poll|carousel",
  "text": "Texto principal da mensagem",
  "choices": ["opções baseadas no tipo escolhido"],
  "footerText": "Texto do rodapé (opcional para botões e listas)",
  "listButton": "Texto do botão (para listas)",
  "selectableCount": "Número de opções selecionáveis (apenas para enquetes)"
}

```

#### Código 6

```
footerText
```

#### Código 7

```
choices
```

#### Código 8

```
|
```

#### Código 9

```
\n
```

#### Código 10

```
"texto|id"
```

#### Código 11

```
"texto\nid"
```

#### Código 12

```
"texto"
```

#### Código 13

```
"texto|copy:código"
```

#### Código 14

```
"texto\ncopy:código"
```

#### Código 15

```
"texto|call:+5511999999999"
```

#### Código 16

```
"texto\ncall:+5511999999999"
```

#### Código 17

```
"texto|https://exemplo.com"
```

#### Código 18

```
"texto|url:https://exemplo.com"
```

#### Código 19

```
imageButton
```

#### Código 20

```
{
  "number": "5511999999999",
  "type": "button",
  "text": "Escolha um produto:",
  "imageButton": "https://exemplo.com/produto1.jpg",
  "choices": [
    "Produto A|prod_a",
    "Mais Info|https://exemplo.com/produto-a",
    "Produto B|prod_b",
    "Ligar|call:+5511999999999"
  ],
  "footerText": "Produtos em destaque"
}

```

#### Código 21

```
{
  "number": "5511999999999",
  "type": "button",
  "text": "Escolha um produto:",
  "imageButton": "https://exemplo.com/produto1.jpg",
  "choices": [
    "Produto A|prod_a",
    "Mais Info|https://exemplo.com/produto-a",
    "Produto B|prod_b",
    "Ligar|call:+5511999999999"
  ],
  "footerText": "Produtos em destaque"
}

```

#### Código 22

```
imageButton
```

#### Código 23

```
{
  "number": "5511999999999",
  "type": "button",
  "text": "Como podemos ajudar?",
  "choices": [
    "Suporte Técnico|suporte",
    "Fazer Pedido|pedido",
    "Nosso Site|https://exemplo.com",
    "Falar Conosco|call:+5511999999999"
  ],
  "footerText": "Escolha uma das opções abaixo"
}

```

#### Código 24

```
{
  "number": "5511999999999",
  "type": "button",
  "text": "Como podemos ajudar?",
  "choices": [
    "Suporte Técnico|suporte",
    "Fazer Pedido|pedido",
    "Nosso Site|https://exemplo.com",
    "Falar Conosco|call:+5511999999999"
  ],
  "footerText": "Escolha uma das opções abaixo"
}

```

#### Código 25

```
listButton
```

#### Código 26

```
footerText
```

#### Código 27

```
choices
```

#### Código 28

```
"[Título da Seção]"
```

#### Código 29

```
"texto|id|descrição"
```

#### Código 30

```
{
  "number": "5511999999999",
  "type": "list",
  "text": "Catálogo de Produtos",
  "choices": [
    "[Eletrônicos]",
    "Smartphones|phones|Últimos lançamentos",
    "Notebooks|notes|Modelos 2024",
    "[Acessórios]",
    "Fones|fones|Bluetooth e com fio",
    "Capas|cases|Proteção para seu device"
  ],
  "listButton": "Ver Catálogo",
  "footerText": "Preços sujeitos a alteração"
}

```

#### Código 31

```
{
  "number": "5511999999999",
  "type": "list",
  "text": "Catálogo de Produtos",
  "choices": [
    "[Eletrônicos]",
    "Smartphones|phones|Últimos lançamentos",
    "Notebooks|notes|Modelos 2024",
    "[Acessórios]",
    "Fones|fones|Bluetooth e com fio",
    "Capas|cases|Proteção para seu device"
  ],
  "listButton": "Ver Catálogo",
  "footerText": "Preços sujeitos a alteração"
}

```

#### Código 32

```
selectableCount
```

#### Código 33

```
choices
```

#### Código 34

```
{
  "number": "5511999999999",
  "type": "poll",
  "text": "Qual horário prefere para atendimento?",
  "choices": [
    "Manhã (8h-12h)",
    "Tarde (13h-17h)",
    "Noite (18h-22h)"
  ],
  "selectableCount": 1
}

```

#### Código 35

```
{
  "number": "5511999999999",
  "type": "poll",
  "text": "Qual horário prefere para atendimento?",
  "choices": [
    "Manhã (8h-12h)",
    "Tarde (13h-17h)",
    "Noite (18h-22h)"
  ],
  "selectableCount": 1
}

```

#### Código 36

```
choices
```

#### Código 37

```
[Texto do cartão]
```

#### Código 38

```
{URL ou base64 da imagem}
```

#### Código 39

```
"texto|copy:código"
```

#### Código 40

```
"texto|https://url"
```

#### Código 41

```
"texto|call:+número"
```

#### Código 42

```
{
  "number": "5511999999999",
  "type": "carousel",
  "text": "Conheça nossos produtos",
  "choices": [
    "[Smartphone XYZ\nO mais avançado smartphone da linha]",
    "{https://exemplo.com/produto1.jpg}",
    "Copiar Código|copy:PROD123",
    "Ver no Site|https://exemplo.com/xyz",
    "Fale Conosco|call:+5511999999999",
    "[Notebook ABC\nO notebook ideal para profissionais]",
    "{https://exemplo.com/produto2.jpg}",
    "Copiar Código|copy:NOTE456",
    "Comprar Online|https://exemplo.com/abc",
    "Suporte|call:+5511988888888"
  ]
}

```

#### Código 43

```
{
  "number": "5511999999999",
  "type": "carousel",
  "text": "Conheça nossos produtos",
  "choices": [
    "[Smartphone XYZ\nO mais avançado smartphone da linha]",
    "{https://exemplo.com/produto1.jpg}",
    "Copiar Código|copy:PROD123",
    "Ver no Site|https://exemplo.com/xyz",
    "Fale Conosco|call:+5511999999999",
    "[Notebook ABC\nO notebook ideal para profissionais]",
    "{https://exemplo.com/produto2.jpg}",
    "Copiar Código|copy:NOTE456",
    "Comprar Online|https://exemplo.com/abc",
    "Suporte|call:+5511988888888"
  ]
}

```

#### Código 44

```
/send/carousel
```

---

## Enviar Carrossel

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~carousel](https://docs.uazapi.com/endpoint/post/send~carousel)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/carousel
Enviar carrossel de mídia com botões

Este endpoint permite enviar um carrossel com imagens e botões interativos. Funciona de maneira igual ao endpoint /send/menu com type: carousel, porém usando outro formato de payload.

Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Estrutura do Payload
{
  "number": "5511999999999",
  "text": "Texto principal",
  "carousel": [
    {
      "text": "Texto do cartão",
      "image": "URL da imagem",
      "buttons": [
        {
          "id": "resposta1",
          "text": "Texto do botão",
          "type": "REPLY"
        }
      ]
    }
  ],
  "delay": 1000,
  "readchat": true
}

Tipos de Botões

REPLY: Botão de resposta rápida

Quando clicado, envia o valor do id como resposta ao chat
O id será o texto enviado como resposta

URL: Botão com link

Quando clicado, abre a URL especificada
O id deve conter a URL completa (ex: https://exemplo.com)

COPY: Botão para copiar texto

Quando clicado, copia o texto para a área de transferência
O id será o texto que será copiado

CALL: Botão para realizar chamada

Quando clicado, inicia uma chamada telefônica
O id deve conter o número de telefone
Exemplo de Botões
{
  "buttons": [
    {
      "id": "Sim, quero comprar!",
      "text": "Confirmar Compra",
      "type": "REPLY"
    },
    {
      "id": "https://exemplo.com/produto",
      "text": "Ver Produto",
      "type": "URL"
    },
    {
      "id": "CUPOM20",
      "text": "Copiar Cupom",
      "type": "COPY"
    },
    {
      "id": "5511999999999",
      "text": "Falar com Vendedor",
      "type": "CALL"
    }
  ]
}

Exemplo Completo de Carrossel
{
  "number": "5511999999999",
  "text": "Nossos Produtos em Destaque",
  "carousel": [
    {
      "text": "Smartphone XYZ\nO mais avançado smartphone da linha",
      "image": "https://exemplo.com/produto1.jpg",
      "buttons": [
        {
          "id": "SIM_COMPRAR_XYZ",
          "text": "Comprar Agora",
          "type": "REPLY"
        },
        {
          "id": "https://exemplo.com/xyz",
          "text": "Ver Detalhes",
          "type": "URL"
        }
      ]
    },
    {
      "text": "Cupom de Desconto\nGanhe 20% OFF em qualquer produto",
      "image": "https://exemplo.com/cupom.jpg",
      "buttons": [
        {
          "id": "DESCONTO20",
          "text": "Copiar Cupom",
          "type": "COPY"
        },
        {
          "id": "5511999999999",
          "text": "Falar com Vendedor",
          "type": "CALL"
        }
      ]
    }
  ],
  "delay": 0,
  "readchat": true
}

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

text
string
required

Texto principal da mensagem

Example: "Nossos Produtos em Destaque"

carousel
array
required

Array de cartões do carrossel

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Carrossel enviado com sucesso
400
Requisição inválida
401
Não autorizado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/carousel
```

#### Código 2

```
/send/menu
```

#### Código 3

```
delay
```

#### Código 4

```
readchat
```

#### Código 5

```
readmessages
```

#### Código 6

```
replyid
```

#### Código 7

```
mentions
```

#### Código 8

```
forward
```

#### Código 9

```
track_source
```

#### Código 10

```
track_id
```

#### Código 11

```
{
  "number": "5511999999999",
  "text": "Texto principal",
  "carousel": [
    {
      "text": "Texto do cartão",
      "image": "URL da imagem",
      "buttons": [
        {
          "id": "resposta1",
          "text": "Texto do botão",
          "type": "REPLY"
        }
      ]
    }
  ],
  "delay": 1000,
  "readchat": true
}

```

#### Código 12

```
{
  "number": "5511999999999",
  "text": "Texto principal",
  "carousel": [
    {
      "text": "Texto do cartão",
      "image": "URL da imagem",
      "buttons": [
        {
          "id": "resposta1",
          "text": "Texto do botão",
          "type": "REPLY"
        }
      ]
    }
  ],
  "delay": 1000,
  "readchat": true
}

```

#### Código 13

```
REPLY
```

#### Código 14

```
URL
```

#### Código 15

```
COPY
```

#### Código 16

```
CALL
```

#### Código 17

```
{
  "buttons": [
    {
      "id": "Sim, quero comprar!",
      "text": "Confirmar Compra",
      "type": "REPLY"
    },
    {
      "id": "https://exemplo.com/produto",
      "text": "Ver Produto",
      "type": "URL"
    },
    {
      "id": "CUPOM20",
      "text": "Copiar Cupom",
      "type": "COPY"
    },
    {
      "id": "5511999999999",
      "text": "Falar com Vendedor",
      "type": "CALL"
    }
  ]
}

```

#### Código 18

```
{
  "buttons": [
    {
      "id": "Sim, quero comprar!",
      "text": "Confirmar Compra",
      "type": "REPLY"
    },
    {
      "id": "https://exemplo.com/produto",
      "text": "Ver Produto",
      "type": "URL"
    },
    {
      "id": "CUPOM20",
      "text": "Copiar Cupom",
      "type": "COPY"
    },
    {
      "id": "5511999999999",
      "text": "Falar com Vendedor",
      "type": "CALL"
    }
  ]
}

```

#### Código 19

```
{
  "number": "5511999999999",
  "text": "Nossos Produtos em Destaque",
  "carousel": [
    {
      "text": "Smartphone XYZ\nO mais avançado smartphone da linha",
      "image": "https://exemplo.com/produto1.jpg",
      "buttons": [
        {
          "id": "SIM_COMPRAR_XYZ",
          "text": "Comprar Agora",
          "type": "REPLY"
        },
        {
          "id": "https://exemplo.com/xyz",
          "text": "Ver Detalhes",
          "type": "URL"
        }
      ]
    },
    {
      "text": "Cupom de Desconto\nGanhe 20% OFF em qualquer produto",
      "image": "https://exemplo.com/cupom.jpg",
      "buttons": [
        {
          "id": "DESCONTO20",
          "text": "Copiar Cupom",
          "type": "COPY"
        },
        {
          "id": "5511999999999",
          "text": "Falar com Vendedor",
          "type": "CALL"
        }
      ]
    }
  ],
  "delay": 0,
  "readchat": true
}

```

#### Código 20

```
{
  "number": "5511999999999",
  "text": "Nossos Produtos em Destaque",
  "carousel": [
    {
      "text": "Smartphone XYZ\nO mais avançado smartphone da linha",
      "image": "https://exemplo.com/produto1.jpg",
      "buttons": [
        {
          "id": "SIM_COMPRAR_XYZ",
          "text": "Comprar Agora",
          "type": "REPLY"
        },
        {
          "id": "https://exemplo.com/xyz",
          "text": "Ver Detalhes",
          "type": "URL"
        }
      ]
    },
    {
      "text": "Cupom de Desconto\nGanhe 20% OFF em qualquer produto",
      "image": "https://exemplo.com/cupom.jpg",
      "buttons": [
        {
          "id": "DESCONTO20",
          "text": "Copiar Cupom",
          "type": "COPY"
        },
        {
          "id": "5511999999999",
          "text": "Falar com Vendedor",
          "type": "CALL"
        }
      ]
    }
  ],
  "delay": 0,
  "readchat": true
}

```

---

## Enviar Botão Localização

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~location-button](https://docs.uazapi.com/endpoint/post/send~location-button)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/location-button
Solicitar localização do usuário

Este endpoint envia uma mensagem com um botão que solicita a localização do usuário. Quando o usuário clica no botão, o WhatsApp abre a interface para compartilhar a localização atual.

Campos Comuns

Este endpoint suporta todos os campos opcionais comuns documentados na tag "Enviar Mensagem", incluindo: delay, readchat, readmessages, replyid, mentions, forward, track_source, track_id, placeholders e envio para grupos.

Estrutura do Payload
{
  "number": "5511999999999",
  "text": "Por favor, compartilhe sua localização",
  "delay": 0,
  "readchat": true
}

Exemplo de Uso
{
  "number": "5511999999999",
  "text": "Para continuar o atendimento, clique no botão abaixo e compartilhe sua localização"
}


Nota: O botão de localização é adicionado automaticamente à mensagem

Request
Body
number
string
required

Número do destinatário (formato internacional)

Example: "5511999999999"

text
string
required

Texto da mensagem que será exibida

Example: "Por favor, compartilhe sua localização"

delay
integer

Atraso em milissegundos antes do envio

0
readchat
boolean

Se deve marcar a conversa como lida após envio

Example: true

track_source
string

Origem do rastreamento da mensagem

Example: "chatwoot"

track_id
string

ID para rastreamento da mensagem (aceita valores duplicados)

Example: "msg_123456789"

Responses
200
Localização enviada com sucesso
400
Requisição inválida
401
Não autorizado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/location-button
```

#### Código 2

```
delay
```

#### Código 3

```
readchat
```

#### Código 4

```
readmessages
```

#### Código 5

```
replyid
```

#### Código 6

```
mentions
```

#### Código 7

```
forward
```

#### Código 8

```
track_source
```

#### Código 9

```
track_id
```

#### Código 10

```
{
  "number": "5511999999999",
  "text": "Por favor, compartilhe sua localização",
  "delay": 0,
  "readchat": true
}

```

#### Código 11

```
{
  "number": "5511999999999",
  "text": "Por favor, compartilhe sua localização",
  "delay": 0,
  "readchat": true
}

```

#### Código 12

```
{
  "number": "5511999999999",
  "text": "Para continuar o atendimento, clique no botão abaixo e compartilhe sua localização"
}

```

#### Código 13

```
{
  "number": "5511999999999",
  "text": "Para continuar o atendimento, clique no botão abaixo e compartilhe sua localização"
}

```

---

## Enviar Botão PIX

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/send~pix-button](https://docs.uazapi.com/endpoint/post/send~pix-button)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Enviar mensagem de texto
POST
Enviar mídia (imagem, vídeo, áudio ou documento)
POST
Enviar cartão de contato (vCard)
POST
Enviar localização geográfica
POST
Enviar atualização de presença
POST
Enviar Stories (Status)
POST
Enviar menu interativo (botões, carrosel, lista ou enquete)
POST
Enviar carrossel de mídia com botões
POST
Solicitar localização do usuário
POST
Solicitar pagamento
POST
Enviar botão PIX
POST
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/send/pix-button
Enviar botão PIX

Envia um botão nativo do WhatsApp que abre para pagamento PIX com a chave informada. O usuário visualiza o detalhe do recebedor, nome e chave.

Regras principais
pixType aceita: CPF, CNPJ, PHONE, EMAIL, EVP (case insensitive)
pixName padrão: "Pix" quando não informado - nome de quem recebe o pagamento
Campos comuns

Este endpoint herda os campos opcionais padronizados da tag "Enviar Mensagem": delay, readchat, readmessages, replyid, mentions, track_source, track_id e async.

Exemplo de payload
{
  "number": "5511999999999",
  "pixType": "EVP",
  "pixKey": "123e4567-e89b-12d3-a456-426614174000",
  "pixName": "Loja Exemplo"
}

Request
Body
number
string
required

Número do destinatário (DDD + número, formato internacional)

Example: "5511999999999"

pixType
string
required

Tipo da chave PIX. Valores aceitos: CPF, CNPJ, PHONE, EMAIL ou EVP

Example: "EVP"

pixKey
string
required

Valor da chave PIX (CPF/CNPJ/telefone/email/EVP)

Example: "123e4567-e89b-12d3-a456-426614174000"

pixName
string

Nome exibido como recebedor do PIX (padrão "Pix" se vazio)

Example: "Loja Exemplo"

async
boolean

Enfileira o envio para processamento assíncrono

delay
integer

Atraso em milissegundos antes do envio (exibe "digitando..." no WhatsApp)

readchat
boolean

Marca o chat como lido após enviar a mensagem

readmessages
boolean

Marca mensagens recentes como lidas após o envio

replyid
string

ID da mensagem que será respondida

mentions
string

Lista de números mencionados separados por vírgula

track_source
string

Origem de rastreamento (ex.: chatwoot, crm-interno)

track_id
string

Identificador de rastreamento (aceita valores duplicados)

Responses
200
Botão PIX enviado com sucesso
400
Requisição inválida
401
Não autorizado
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/send/pix-button
```

#### Código 2

```
pixType
```

#### Código 3

```
CPF
```

#### Código 4

```
CNPJ
```

#### Código 5

```
PHONE
```

#### Código 6

```
EMAIL
```

#### Código 7

```
EVP
```

#### Código 8

```
pixName
```

#### Código 9

```
"Pix"
```

#### Código 10

```
delay
```

#### Código 11

```
readchat
```

#### Código 12

```
readmessages
```

#### Código 13

```
replyid
```

#### Código 14

```
mentions
```

#### Código 15

```
track_source
```

#### Código 16

```
track_id
```

#### Código 17

```
async
```

#### Código 18

```
{
  "number": "5511999999999",
  "pixType": "EVP",
  "pixKey": "123e4567-e89b-12d3-a456-426614174000",
  "pixName": "Loja Exemplo"
}

```

#### Código 19

```
{
  "number": "5511999999999",
  "pixType": "EVP",
  "pixKey": "123e4567-e89b-12d3-a456-426614174000",
  "pixName": "Loja Exemplo"
}

```

---

# Sender

## Disparo Simples

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/sender~simple](https://docs.uazapi.com/endpoint/post/sender~simple)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/sender/simple
Criar nova campanha (Simples)

Cria uma nova campanha de envio com configurações básicas

Request
Body
numbers
array
required

Lista de números para envio

Example: ["5511999999999@s.whatsapp.net"]

type
string
required

Tipo da mensagem

delayMin
integer
required

Delay mínimo entre mensagens em segundos

Example: 10

delayMax
integer
required

Delay máximo entre mensagens em segundos

Example: 30

scheduled_for
integer
required

Timestamp em milissegundos ou minutos a partir de agora para agendamento

Example: 1706198400000

info
string

Informações adicionais sobre a campanha

delay
integer

Delay fixo entre mensagens (opcional)

mentions
string

Menções na mensagem em formato JSON

text
string

Texto da mensagem

linkPreview
boolean

Habilitar preview de links em mensagens de texto. O preview será gerado automaticamente a partir da URL contida no texto.

linkPreviewTitle
string

Título personalizado para o preview do link (opcional)

linkPreviewDescription
string

Descrição personalizada para o preview do link (opcional)

linkPreviewImage
string

URL ou dados base64 da imagem para o preview do link (opcional)

linkPreviewLarge
boolean

Se deve usar preview grande ou pequeno (opcional, padrão false)

file
string

URL da mídia ou arquivo (quando type é image, video, audio, document, etc.)

docName
string

Nome do arquivo (quando type é document)

fullName
string

Nome completo (quando type é contact)

phoneNumber
string

Número do telefone (quando type é contact)

organization
string

Organização (quando type é contact)

email
string

Email (quando type é contact)

url
string

URL (quando type é contact)

latitude
number

Latitude (quando type é location)

longitude
number

Longitude (quando type é location)

name
string

Nome do local (quando type é location)

address
string

Endereço (quando type é location)

footerText
string

Texto do rodapé (quando type é list, button, poll ou carousel)

buttonText
string

Texto do botão (quando type é list, button, poll ou carousel)

listButton
string

Texto do botão da lista (quando type é list)

selectableCount
integer

Quantidade de opções selecionáveis (quando type é poll)

choices
array

Lista de opções (quando type é list, button, poll ou carousel). Para carousel, use formato específico com [texto], {imagem} e botões

imageButton
string

URL da imagem para o botão (quando type é button)

Responses
200
campanha criada com sucesso
400
Erro nos parâmetros da requisição
401
Erro de autenticação
409
Conflito - campanha já existe
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/sender/simple
```

---

## Disparo Avançado

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/sender~advanced](https://docs.uazapi.com/endpoint/post/sender~advanced)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/sender/advanced
Criar envio em massa avançado

Cria um novo envio em massa com configurações avançadas, permitindo definir múltiplos destinatários e mensagens com delays personalizados.

Request
Body
delayMin
integer

Delay mínimo entre mensagens (segundos)

Example: 3

delayMax
integer

Delay máximo entre mensagens (segundos)

Example: 6

info
string

Descrição ou informação sobre o envio em massa

Example: "Campanha de lançamento"

scheduled_for
integer

Timestamp em milissegundos (date unix) ou minutos a partir de agora para agendamento

Example: 1

messages
array
required

Lista de mensagens a serem enviadas

Responses
200
Mensagens adicionadas à fila com sucesso
400
Erro nos parâmetros da requisição
401
Não autorizado - token inválido ou ausente
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/sender/advanced
```

---

## Editar Disparo

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/sender~edit](https://docs.uazapi.com/endpoint/post/sender~edit)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/sender/edit
Controlar campanha de envio em massa

Permite controlar campanhas de envio de mensagens em massa através de diferentes ações:

Ações Disponíveis:

🛑 stop - Pausar campanha

Pausa uma campanha ativa ou agendada
Altera o status para "paused"
Use quando quiser interromper temporariamente o envio
Mensagens já enviadas não são afetadas

▶️ continue - Continuar campanha

Retoma uma campanha pausada
Altera o status para "scheduled"
Use para continuar o envio após pausar uma campanha
Não funciona em campanhas já concluídas ("done")

🗑️ delete - Deletar campanha

Remove completamente a campanha
Deleta apenas mensagens NÃO ENVIADAS (status "scheduled")
Mensagens já enviadas são preservadas no histórico
Operação é executada de forma assíncrona
Status de Campanhas:
scheduled: Agendada para envio
sending: Enviando mensagens
paused: Pausada pelo usuário
done: Concluída (não pode ser alterada)
deleting: Sendo deletada (operação em andamento)
Request
Body
folder_id
string
required

Identificador único da campanha de envio

Example: "folder_123"

action
string
required

Ação a ser executada na campanha:

stop: Pausa a campanha (muda para status "paused")
continue: Retoma campanha pausada (muda para status "scheduled")
delete: Remove campanha e mensagens não enviadas (assíncrono)

Example: "stop"

Responses
200
Ação realizada com sucesso
400
Requisição inválida
```

### Blocos de Código

#### Código 1

```
/sender/edit
```

---

## Limpar Concluídos

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/sender~cleardone](https://docs.uazapi.com/endpoint/post/sender~cleardone)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/sender/cleardone
Limpar mensagens enviadas

Inicia processo de limpeza de mensagens antigas em lote que já foram enviadas com sucesso. Por padrão, remove mensagens mais antigas que 7 dias.

Request
Body
hours
integer

Quantidade de horas para manter mensagens. Mensagens mais antigas que esse valor serão removidas.

Example: 168

Responses
200
Limpeza iniciada com sucesso
```

### Blocos de Código

#### Código 1

```
/sender/cleardone
```

---

## Limpar Todas

**URL de Referência:** [https://docs.uazapi.com/endpoint/delete/sender~clearall](https://docs.uazapi.com/endpoint/delete/sender~clearall)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
DELETE
/sender/clearall
Limpar toda fila de mensagens

Remove todas as mensagens da fila de envio em massa, incluindo mensagens pendentes e já enviadas. Esta é uma operação irreversível.

Responses
200
Fila de mensagens limpa com sucesso
401
Não autorizado - token inválido ou ausente
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/sender/clearall
```

---

## Listar Pastas

**URL de Referência:** [https://docs.uazapi.com/endpoint/get/sender~listfolders](https://docs.uazapi.com/endpoint/get/sender~listfolders)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
GET
/sender/listfolders
Listar campanhas de envio

Retorna todas as campanhas de mensagens em massa com possibilidade de filtro por status

Parameters
Query Parameters
status
string

Filtrar campanhas por status

Responses
200
Lista de campanhas retornada com sucesso
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/sender/listfolders
```

#### Código 2

```
status
```

---

## Listar Mensagens

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/sender~listmessages](https://docs.uazapi.com/endpoint/post/sender~listmessages)

### Conteúdo Extraído

```
uazapiGO V2

API Documentation

Overview
ENDPOINTS
91
Admininstração
5
Instancia
8
Perfil
2
Chamadas
2
Webhooks e SSE
3
Enviar Mensagem
11
Ações na mensagem e Buscar
6
Chats
6
Contatos
5
Bloqueios
2
Etiquetas
3
Grupos e Comunidades
16
Respostas Rápidas
2
CRM
2
Mensagem em massa
7
Criar nova campanha (Simples)
POST
Criar envio em massa avançado
POST
Controlar campanha de envio em massa
POST
Limpar mensagens enviadas
POST
Limpar toda fila de mensagens
DELETE
Listar campanhas de envio
GET
Listar mensagens de uma campanha
POST
Integração Chatwoot
2
ChatBot
9
SCHEMAS
15
POST
/sender/listmessages
Listar mensagens de uma campanha

Retorna a lista de mensagens de uma campanha específica, com opções de filtro por status e paginação

Request
Body
folder_id
string
required

ID da campanha a ser consultada

messageStatus
string

Status das mensagens para filtrar

page
integer

Número da página para paginação

pageSize
integer

Quantidade de itens por página

Responses
200
Lista de mensagens retornada com sucesso
400
Requisição inválida
500
Erro interno do servidor
```

### Blocos de Código

#### Código 1

```
/sender/listmessages
```

---

# Chats

## Obter Detalhes Completos do Chat {#chats-details}

**URL de Referência:** [https://docs.uazapi.com/endpoint/post/chat~details](https://docs.uazapi.com/endpoint/post/chat~details)

**Endpoint:** `POST /chat/details`

### Descrição

Retorna informações completas sobre um contato ou chat, incluindo todos os campos disponíveis do modelo Chat.

### Funcionalidades

- ✅ **Retorna chat completo**: Todos os campos do modelo Chat (mais de 60 campos)
- ✅ **Busca informações** para contatos individuais e grupos
- ✅ **URLs de imagem** em dois tamanhos: `preview` (menor) ou `full` (original)
- ✅ **Combina informações** de diferentes fontes: WhatsApp, contatos salvos, leads
- ✅ **Atualiza automaticamente** dados desatualizados no banco

### Campos Retornados

#### Informações Básicas
- `id`, `wa_fastid`, `wa_chatid`, `owner`, `name`, `phone`

#### Dados do WhatsApp
- `wa_name`, `wa_contactName`, `wa_archived`, `wa_isBlocked`
- `wa_isPinned`, `wa_unreadCount`, `wa_muteEndTime`
- `image`, `imagePreview` ← **FOTO DE PERFIL!**

#### Dados de Lead/CRM
- `lead_name`, `lead_email`, `lead_status`
- `lead_field01` até `lead_field20`
- `lead_notes`, `lead_tags`

#### Informações de Grupo
- `wa_isGroup`, `wa_isGroup_admin`, `wa_isGroup_announce`
- `wa_isGroup_community`, `wa_isGroup_member`
- `wa_common_groups`

#### Chatbot
- `chatbot_summary`, `chatbot_lastTrigger_id`
- `chatbot_disableUntil`, `chatbot_agentResetMemoryAt`

### Comportamento

**Para contatos individuais:**
- Busca nome verificado do WhatsApp
- Verifica nome salvo nos contatos
- Formata número internacional
- Calcula grupos em comum

**Para grupos:**
- Busca nome do grupo
- Verifica status de comunidade

### Request Body

```json
{
  "number": "5511999999999",
  "preview": false
}
```

#### Parâmetros

**number** (string, required)
- Número do telefone ou ID do grupo
- Exemplo: `"5511999999999"`

**preview** (boolean, optional)
- Controla o tamanho da imagem de perfil retornada:
  - `true`: Retorna imagem em tamanho preview (menor, otimizada para listagens)
  - `false` (padrão): Retorna imagem em tamanho full (resolução original, maior qualidade)

### Responses

#### 200 - Sucesso

```json
{
  "id": "string",
  "wa_fastid": "string",
  "wa_chatid": "string",
  "wa_archived": false,
  "wa_contactName": "string",
  "wa_name": "string",
  "name": "string",
  "image": "https://...",
  "imagePreview": "https://...",
  "wa_ephemeralExpiration": 0,
  "wa_isBlocked": false,
  "wa_isGroup": false,
  "wa_isGroup_admin": false,
  "wa_isGroup_announce": false,
  "wa_isGroup_community": false,
  "wa_isGroup_member": false,
  "wa_isPinned": false,
  "wa_label": "string",
  "wa_lastMessageTextVote": "string",
  "wa_lastMessageType": "string",
  "wa_lastMsgTimestamp": 0,
  "wa_lastMessageSender": "string",
  "wa_muteEndTime": 0,
  "owner": "string",
  "wa_unreadCount": 0,
  "phone": "string",
  "wa_common_groups": "Grupo Família(120363123456789012@g.us),Trabalho(987654321098765432@g.us)",
  "lead_name": "string",
  "lead_fullName": "string",
  "lead_email": "string",
  "lead_personalid": "string",
  "lead_status": "string",
  "lead_tags": "string",
  "lead_notes": "string",
  "lead_isTicketOpen": false,
  "lead_assignedAttendant_id": "string",
  "lead_kanbanOrder": 0,
  "lead_field01": "string",
  "lead_field02": "string",
  "lead_field03": "string",
  "lead_field04": "string",
  "lead_field05": "string",
  "lead_field06": "string",
  "lead_field07": "string",
  "lead_field08": "string",
  "lead_field09": "string",
  "lead_field10": "string",
  "lead_field11": "string",
  "lead_field12": "string",
  "lead_field13": "string",
  "lead_field14": "string",
  "lead_field15": "string",
  "lead_field16": "string",
  "lead_field17": "string",
  "lead_field18": "string",
  "lead_field19": "string",
  "lead_field20": "string",
  "chatbot_agentResetMemoryAt": 0,
  "chatbot_lastTrigger_id": "string",
  "chatbot_lastTriggerAt": 0,
  "chatbot_disableUntil": 0,
  "created": "string",
  "updated": "string"
}
```

#### 400 - Erro de Validação

```json
{
  "error": "Invalid request payload"
}
```

#### 401 - Não Autorizado

```json
{
  "error": "Unauthorized"
}
```

#### 500 - Erro Interno

```json
{
  "error": "No session"
}
```

### Exemplo de Uso

```typescript
// Buscar detalhes do cliente com foto de perfil
const response = await fetch(`https://cluster.uazapi.lat/instance/${instancia}/chat/details`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    number: "5581997628611@s.whatsapp.net",
    preview: false // full quality
  })
});

const data = await response.json();

console.log('Nome:', data.name);
console.log('Foto:', data.image); // ← URL da foto de perfil!
console.log('Status:', data.wa_isBlocked);
```

### 🎯 Caso de Uso: Sincronizar Foto de Perfil

Use este endpoint para:
1. **Buscar foto de perfil** dos clientes
2. **Atualizar avatarUrl** no Firestore
3. **Sincronizar dados** do WhatsApp com seu sistema
4. **Verificar status** (bloqueado, grupo, etc)

---

