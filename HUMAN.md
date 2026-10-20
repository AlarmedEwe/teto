# Melhores Práticas para Spec-Driven Development (SDD) com Antigravity
# A. No Spec-Driven Development, o agente nunca implementa código "por adivinhação". Ele opera sob um funil de três camadas bem definidas:

```mermaid
[ GEMINI.md ]              -> Nível 1: Constituição Global (regras de negócio perenes)
      ↓
[ specs/nome-da-feature ]  -> Nível 2: Especificação Técnica da Feature (critérios de aceite)
      ↓
[ TODO.md ]                -> Nível 3: Tasks Atômicas de Execução
```

Aqui estão as recomendações práticas para esse fluxo no Teto:

A. Estrutura de Diretório para Specs (`specs/`)
Crie uma pasta `specs/` na raiz para guardar as especificações detalhadas de cada grande funcionalidade. Exemplo:

```
teto/
├── specs/
│   ├── 01-monorepo-e-types.md
│   ├── 02-orcamento-e-tetos.md
│   └── 03-parser-csv-e-parcelamento.md
├── TODO.md
├── DONE.md
├── GEMINI.md
```

* O que vai numa spec?
    * O que a feature faz (escopo).
    * Casos de borda (ex: no CSV, o que fazer se a parcela for "02/05" vs "2 de 5"? O que fazer se o valor for negativo?).
    * Contrato de dados esperado (quais DTOs em `@teto/types`).
    * Critérios de aceite (o que precisa passar para considerar pronto).

## B. Use o Slash Command `/grill-me` e `/plan`

O Antigravity possui comandos nativos pensados especificamente para SDD:

1. **`/grill-me` (Antes de escrever a spec ou o código):**

    * Quando você tiver uma ideia de feature, peça: `/grill-me vamos desenhar a spec do módulo de importação de CSV.`
    * O Antigravity fará uma "entrevista técnica" com perguntas cirúrgicas sobre decisões de design, validações e falhas que você talvez não tenha antecipado.

2. **`/plan` (Ao quebrar a spec em tarefas do TODO.md):**

    * Transforma a spec em um plano passo a passo com etapas atômicas e rastreáveis antes da primeira linha de código ser escrita.

## C. Fluxo "Contract-First" com `@teto/types`

No Teto, toda task do TODO.md deve seguir esta ordem obrigatória de execução:

1. **Tipagem primeiro:** Criar/atualizar a interface ou DTO em `packages/types`.
2. **Validação:** Garantir que o schema faz sentido para a request do front e o response do back.
3. **Backend:** Implementar endpoint consumindo os tipos do pacote compartilhado.
4. **Frontend:** Implementar componente consumindo os mesmos tipos.

## D. Modularização de Regras em `.agents/rules/`

Quando o projeto avançar e surgirem especificidades técnicas que poluiriam o `GEMINI.md`, crie regras dedicadas que o Antigravity carrega automaticamente:

`.agents/rules/backend.md`:
> "Todo endpoint do Fastify deve validar parâmetros usando Zod inferido de @teto/types e retornar erros padronizados em JSON."

`.agents/rules/frontend.md`:
> "Layout obrigatoriamente mobile-first (viewport 375px padrão). Nunca crie estilos inline; use os tokens do Tailwind baseados no tema escuro/âmbar definido no GEMINI.md."
