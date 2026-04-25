---
sidebar_position: 2
title: Boas Práticas e Decisões Técnicas
---

# Boas Práticas e Decisões Técnicas

> Decisões tomadas com base na documentação oficial da Microsoft e padrões consolidados da indústria.

---

## Retorno de métodos: sem tuplas em APIs públicas

**Por que evitar tuplas?**

Tuplas (`(string Name, int Age)`) são problemáticas em métodos públicos porque:
- Não são autodocumentadas — quem chama o método não sabe o significado de cada campo
- Não podem ter validações ou comportamentos associados
- Difíceis de evoluir sem quebrar código existente
- Em entrevistas técnicas e code reviews, são um sinal negativo

**O que usar no lugar:**

| Situação | Tipo recomendado | Exemplo |
|----------|-----------------|---------|
| Dados de saída (DTO) | `record` | `public record ClientDto(Guid Id, string Name);` |
| Resultado de operação com possível erro | `Result<T>` | `Result<ClientDto>` |
| Método privado simples | Tupla é aceitável | `var (x, y) = GetCoords();` |

**Records para DTOs** (C# 9+, recomendado pela Microsoft):

```csharp
// ✅ CORRETO — Record imutável, autodocumentado
public record CreateClientResponse(Guid Id, string Name, string Email);

// ❌ EVITAR — Tupla em método público
public (Guid, string, string) CreateClient(...) { ... }
```

**Result\<T\> para Commands** — retorna sucesso ou erro sem lançar exceções para fluxos esperados:

```csharp
// ✅ CORRETO
public async Task<Result<CreateClientResponse>> Handle(CreateClientCommand command)
{
    if (await _repository.ExistsAsync(command.Email))
        return Result.Failure<CreateClientResponse>(new DuplicateError("E-mail já cadastrado"));

    // ...
    return Result.Success(new CreateClientResponse(client.Id, client.Name, client.Email));
}
```

**Fonte:** [C# Records — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) | [Best practices for exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions)

---

## ORM: EF Core + Dapper (padrão híbrido)

A Microsoft documenta explicitamente o **padrão híbrido** para projetos CQRS + DDD:

> *"For the command side... you can use a full ORM like EF Core... For the query side, you can use a simpler approach like Dapper."*
>
> — [Microsoft .NET Microservices Architecture Guide](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/eshoponcontainers-cqrs-ddd-microservice)

### EF Core — lado de Commands (escrita)

Usado para todas as operações de escrita e domínio:

```csharp
// HasQueryFilter garante isolamento multitenant em TODAS as queries
builder.HasQueryFilter(x => x.TenantId == _tenantContext.CurrentTenantId);
```

Vantagens para este projeto:
- **HasQueryFilter** — filtro global de tenant (obrigatório no projeto)
- **Change Tracking** — detecta mudanças em agregados automaticamente
- **Migrations** — controle de schema versionado
- **Owned Entities** — mapeia Value Objects como parte da mesma tabela
- **Compiled Queries** — performance muito boa no EF Core 8+/10

### Dapper — lado de Queries (leitura)

Adicionado quando o módulo Reports precisar de queries complexas:

```csharp
// Dapper para projeções de leitura — SQL direto, sem overhead de tracking
var result = await connection.QueryAsync<ClientSummaryDto>(
    "SELECT c.Id, c.Name, COUNT(d.Id) as DealCount FROM Clients c ...",
    new { TenantId = tenantId });
```

**Quando adicionar Dapper:** ao implementar o módulo Reports (queries de dashboard, agregações, relatórios com múltiplos joins).

---

## Naming Conventions — Microsoft Official

Fonte: [Framework Design Guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/general-naming-conventions)

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classes, Records | `PascalCase` substantivo | `ClientAggregate`, `CreateClientResponse` |
| Interfaces | `I` + PascalCase | `IClientRepository`, `ITenantContext` |
| Métodos | `PascalCase` verbo | `CreateClient()`, `GetByIdAsync()` |
| Métodos assíncronos | sufixo `Async` | `CreateClientAsync()` |
| Propriedades booleanas | `Is/Can/Has` + PascalCase | `IsActive`, `CanDelete`, `HasTenant` |
| Variáveis/parâmetros | `camelCase` | `clientId`, `tenantContext` |
| Campos privados | `_camelCase` | `_repository`, `_eventBus` |
| Namespaces | `Produto.Modulo.Camada` | `MicroCrm.Clients.Domain` |

---

## Interfaces — sempre programar para a abstração

```csharp
// ✅ CORRETO — depende da interface, não da implementação
public class CreateClientHandler
{
    private readonly IClientRepository _repository; // interface
    private readonly IEventBus _eventBus;           // interface

    public CreateClientHandler(IClientRepository repository, IEventBus eventBus)
    {
        _repository = repository;
        _eventBus = eventBus;
    }
}

// ❌ EVITAR — depende da implementação concreta
public class CreateClientHandler
{
    private readonly ClientRepository _repository; // classe concreta
}
```

**Por quê:** facilita testes (mock da interface), permite trocar implementação sem mudar o código, é o princípio D do SOLID (Dependency Inversion).

**Fonte:** [Dependency inversion principle — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles#dependency-inversion)
