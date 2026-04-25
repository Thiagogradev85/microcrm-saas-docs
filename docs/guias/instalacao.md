---
sidebar_position: 1
title: Instalação
---

# Instalação e execução

## Pré-requisitos

| Ferramenta | Versão |
|-----------|--------|
| .NET SDK | **10.0.202** (travado via `global.json`) |
| Git | qualquer recente |
| Node.js | 20 LTS (só para o frontend — fase futura) |

## Passos

```bash
# 1. Clone o repositório
git clone https://github.com/Thiagogradev85/microcrm-saas.git
cd microcrm-saas

# 2. Verifique o SDK (deve retornar 10.x)
dotnet --version

# 3. Build
dotnet build

# 4. Testes
dotnet test
```

## Variáveis de ambiente

Ainda não necessárias — nenhum banco ou serviço externo conectado nessa fase.

Quando os módulos forem implementados, um `.env.example` será adicionado com:

```
DATABASE_URL=   # PostgreSQL (Neon)
RABBITMQ_URL=   # RabbitMQ (CloudAMQP)
REDIS_URL=      # Redis (Upstash)
```
