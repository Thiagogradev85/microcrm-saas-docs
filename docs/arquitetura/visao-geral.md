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

## Comunicação entre módulos — RabbitMQ.Client direto

**Stack de mensageria:** RabbitMQ (hospedado no CloudAMQP, free tier 1M msgs/mês) com **RabbitMQ.Client** oficial — sem camada de abstração (MassTransit foi descartado).

```
Módulo A  →  publica Domain Event no RabbitMQ (RabbitMQ.Client direto)
                          ↓
Módulo B  →  consome o evento via consumer próprio (ack/nack manual)
```

Por que RabbitMQ.Client direto e não MassTransit:
- Objetivo é aprender RabbitMQ de verdade: exchanges, queues, bindings, routing keys, ack/nack, dead-letter queues
- MassTransit esconde toda essa camada atrás de uma API de alto nível
- O `IEventBus` no SharedKernel protege a decisão futura — se na Fase 2 o Saga ficar pesado demais, troca só a implementação sem mexer no domínio

Nunca: `moduloA.Service.FazAlgo()` chamado de dentro do módulo B.
