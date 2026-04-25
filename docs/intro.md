---
sidebar_position: 1
title: Introdução
---

# Micro CRM SaaS

CRM B2B multitenant construído com .NET 10 e React 18.

## O que é

Sistema de gestão de relacionamento com clientes (CRM) vendido para empresas no modelo **SaaS multitenant** — uma única instância do sistema atende múltiplas empresas clientes com isolamento total de dados.

## Stack

| Camada | Tecnologias |
|--------|------------|
| Backend | .NET 10 · ASP.NET Core · EF Core · MediatR · MassTransit · FluentValidation |
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS · dnd-kit · TanStack Query |
| Banco | PostgreSQL (Neon) |
| Mensageria | RabbitMQ (CloudAMQP) via MassTransit |
| Cache | Redis (Upstash) |
| Deploy | Render · GitHub Actions |

## Arquitetura

Monolito Modular com DDD — um único deploy, internamente dividido em Bounded Contexts que se comunicam via Domain Events no RabbitMQ.

## Módulos do MVP

1. **Tenants** — empresas clientes e planos
2. **Identity** — usuários e permissões
3. **Clients** — leads e clientes
4. **Sellers** — vendedores e territórios por UF
5. **Pipeline** — Kanban visual com drag-and-drop
6. **ActivityLog** — linha do tempo automática
7. **Reports** — dashboard básico
