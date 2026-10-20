# 🪙 Teto — Gestão Orçamentária Doméstica

> **Seu arcabouço fiscal pessoal.** Controle de orçamento doméstico mobile-first, inspirado na regra do teto de gastos e na metodologia percentual de divisão de renda.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🏛️ O Conceito: Por que "Teto"?

O nome **Teto** faz alusão conceitual à regra do **"teto de gastos"**, adaptando o princípio de disciplina fiscal governamental para a **economia doméstica**:

* **Limites Previsíveis por Categoria:** A partir da sua renda mensal líquida, cada categoria possui um teto financeiro calculado automaticamente.
* **Disciplina e Consciência:** Se um teto for excedido ou flexibilizado em uma categoria (ex: Lazer), o ajuste deve ser consciente e compensado em outra, blindando a reserva de emergência e os investimentos.
* **Sem Fórmulas Mágicas:** Um arcabouço claro para não gastar mais do que ganha e saber com precisão para onde cada centavo está indo.

---

## 📊 Metodologia Orçamentária

O sistema utiliza por padrão a distribuição percentual de renda (estilo AUVP), customizável pelo usuário:

| Categoria | Percentual Padrão | Descrição |
| :--- | :---: | :--- |
| **Custos Fixos** | **30%** | Moradia, condomínio, contas básicas, internet, saúde |
| **Investimentos** | **25%** | Renda fixa, ações, FIIs, liberdade financeira de longo prazo |
| **Metas** | **20%** | Reserva de emergência, projetos de médio prazo, reformas |
| **Conforto** | **10%** | Assinaturas, melhorias no lar, academia |
| **Prazeres** | **10%** | Restaurantes, lazer, passeios pontuais |
| **Conhecimento** | **5%** | Cursos, livros, certificações, treinamentos |

---

## ✨ Funcionalidades Principais

* 📱 **Design Mobile-First:** Projetado desde o primeiro pixel para uso ágil no smartphone no dia a dia, com layout adaptável para desktop (3 colunas com Donut Chart, metas e extrato).
* 🍩 **Visualização em Donut & Barras Semânticas:** Acompanhe em tempo real o percentual utilizado de cada teto (indicadores verde, âmbar e vermelho para estouro).
* 💳 **Importação Inteligente de CSV:** Upload de faturas de cartão de crédito (Nubank, Itaú, Inter, etc.) com detecção automática de parcelamentos futuros (`02/05`) e projeção nos meses seguintes.
* ⚡ **Full-stack TypeScript Monorepo:** Tipos, contratos de API e modelos de domínio compartilhados via `@teto/types`, garantindo sincronia total entre Frontend e Backend.
* 🔒 **Privacidade & Self-Hosted:** Banco de dados PostgreSQL sob seu controle e execução simplificada via Docker.

---

## 🏗️ Arquitetura do Projeto

```
teto/
├── packages/
│   └── types/             # @teto/types (Single Source of Truth para interfaces e DTOs)
├── backend/               # API em Node.js (TypeScript, Fastify/Express, Prisma ORM)
├── frontend/              # Web App em React 18+ (Vite, Tailwind CSS, Recharts, Lucide)
├── specs/                 # Especificações técnicas de features (Spec-Driven Development)
├── docker-compose.yml     # Orquestração local (App + Postgres)
├── GEMINI.md              # Documento mestre de arquitetura e regras de negócio
└── TODO.md                # Backlog técnico ativo por marcos
```

---

## 🚀 Como Executar

### Pré-requisitos
* Node.js 20+
* Docker e Docker Compose (opcional para rodar o banco local)
* Git

```bash
# Clone o repositório
git clone https://github.com/AlarmedEwe/teto.git
cd teto

# Instale as dependências de todos os workspaces
npm install

# Suba os serviços via Docker Compose (PostgreSQL, Backend e Frontend)
docker compose up -d
```

---

## 📄 Licença

Este projeto é distribuído sob a licença [MIT](LICENSE).
