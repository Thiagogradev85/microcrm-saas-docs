---
sidebar_position: 1
title: Visão Geral
---

# Arquitetura — Visão Geral

## Padrão: Monolito Modular + DDD

Um único executável e deploy, porém dividido internamente em **Bounded Contexts** com isolamento forte. Módulos só se comunicam via **Domain Events** publicados no RabbitMQ (MassTransit). Chamada direta entre módulos é proibida.

## Estrutura de projetos

```
src/
├── SharedKernel/           # Abstrações puras (sem dependências externas)
└── Modules/
    ├── Tenants/
    │   ├── Tenants.Domain/
    │   ├── Tenants.Application/
    │   ├── Tenants.Infrastructure/
    │   └── Tenants.Api/
    ├── Identity/           # mesma estrutura
    ├── Clients/
    ├── Sellers/
    ├── Pipeline/
    ├── ActivityLog/
    └── Reports/
```

## Multitenant

Isolamento por tenant garantido via `HasQueryFilter` no EF Core:

```csharp
builder.HasQueryFilter(x => x.TenantId == _tenantContext.CurrentTenantId);
```

Nenhuma query que toca tabela tenant-owned passa sem esse filtro.

## Comunicação entre módulos

```
Módulo A  →  publica Domain Event no RabbitMQ
                          ↓
Módulo B  →  consome o evento via MassTransit handler
```

Nunca: `moduloA.Service.FazAlgo()` chamado de dentro do módulo B.
