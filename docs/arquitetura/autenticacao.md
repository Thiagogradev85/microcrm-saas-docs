---
sidebar_position: 3
title: Autenticação e Segurança
---

# Autenticação e Segurança

## Stack de autenticação

| Tecnologia | Função |
|-----------|--------|
| **ASP.NET Core Identity** | Gerenciamento de usuários, senhas (hash PBKDF2), roles e claims |
| **JWT Bearer Tokens** | Autenticação stateless — TenantId e Role viajam nos claims |
| **Refresh Tokens** | Armazenados no banco, renovam o JWT sem novo login |

## Por que JWT e não sessão?

O projeto é um **monolito modular**, mas cada módulo roda sem estado compartilhado. JWT é stateless: o token carrega tudo que o servidor precisa para autorizar a requisição, sem consultar banco ou cache para cada chamada.

Alternativas consideradas:

| Opção | Por que não usar |
|-------|----------------|
| Session (cookie) | Requer estado no servidor — dificulta escalabilidade horizontal |
| Auth externo puro (Auth0, Keycloak) | Complexidade e custo desnecessários para o MVP |
| API Key simples | Sem suporte a roles, expiração ou refresh |

## Fluxo completo

```
1. POST /auth/login
   ↓ Identity valida e-mail + senha (PBKDF2)
   ↓ Gera JWT com claims: sub, tenantId, role, exp (15 min)
   ↓ Gera Refresh Token (opaque, 30 dias) → salva no banco
   ↓ Retorna { accessToken, refreshToken }

2. Requisições autenticadas
   Authorization: Bearer <accessToken>
   ↓ Middleware valida assinatura + exp
   ↓ Claims populam ITenantContext e ICurrentUser
   ↓ Handler executa com contexto correto

3. POST /auth/refresh
   ↓ Recebe refreshToken
   ↓ Valida no banco (existe? expirou? foi revogado?)
   ↓ Emite novo accessToken + novo refreshToken (rotação)
   ↓ Invalida o refresh token anterior

4. POST /auth/logout
   ↓ Revoga o refreshToken no banco
   ↓ accessToken expira naturalmente (não pode ser revogado — 15 min é curto o suficiente)
```

## Claims no JWT

```json
{
  "sub": "user-guid",
  "tenantId": "tenant-guid",
  "role": "TenantAdmin",
  "exp": 1714000000
}
```

O middleware de cada requisição lê esses claims e popula:

```csharp
// ITenantContext — lido pelo HasQueryFilter do EF Core
public string CurrentTenantId => _httpContextAccessor.HttpContext
    .User.FindFirstValue("tenantId");

// ICurrentUser — lido pelos handlers para auditoria
public string UserId => _httpContextAccessor.HttpContext
    .User.FindFirstValue(ClaimTypes.NameIdentifier);
```

## Hierarquia de roles

| Role | Escopo | Permissões |
|------|--------|-----------|
| `SuperAdmin` | Global | Cria/gerencia tenants, altera planos, acesso total |
| `TenantAdmin` | Por tenant | Gerencia usuários, vendedores e configurações da empresa |
| `User` | Por tenant | Operação do CRM dentro das permissões definidas pelo TenantAdmin |

## Regras de segurança críticas

- **Refresh Token é rotacionado** a cada uso — se um token vazado for usado, o legítimo é invalidado e a sessão é encerrada.
- **accessToken dura 15 minutos** — janela curta limita o impacto de um token interceptado.
- **Logout revoga o refreshToken** no banco imediatamente.
- **Último TenantAdmin não pode ser removido** — bloqueado no domain layer.
- **Tentativas de login** devem ter rate limiting (Redis via Upstash) para evitar brute force.

**Fonte:** [ASP.NET Core Identity — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) | [JWT Bearer — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwtbearer)
