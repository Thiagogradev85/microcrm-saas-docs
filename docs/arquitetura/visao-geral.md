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

## Comunicação entre módulos — RabbitMQ + MassTransit

**Stack de mensageria:** RabbitMQ (hospedado no CloudAMQP, free tier 1M msgs/mês) com **MassTransit 8.x** como abstração.

```
Módulo A  →  publica Domain Event no RabbitMQ (via MassTransit)
                          ↓
Módulo B  →  consome o evento via MassTransit Consumer
```

MassTransit foi escolhido no lugar de usar RabbitMQ direto porque:
- Abstrai o broker (pode trocar por Azure Service Bus ou SQS no futuro sem mudar o código)
- Já oferece suporte nativo a retries, sagas e idempotência
- Integra com MediatR sem conflito

Nunca: `moduloA.Service.FazAlgo()` chamado de dentro do módulo B.
