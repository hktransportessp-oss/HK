# Backend Central Real — HK Transportes

Este repositório contém o **Backend Central Real** da HK Transportes. Ele é a camada central de comunicação do ecossistema integrando o aplicativo mobile **HK Connect** (Android), o **ERP Financeiro HK** e o **Painel Operacional HK**.

---

## 🛠️ Arquitetura e Tech Stack

- **Framework**: Node.js v22 + TypeScript + NestJS v10
- **Banco de Dados**: PostgreSQL 16
- **ORM**: Prisma ORM v5
- **Autenticação**: JWT Access Token (15m) + Refresh Token com Rotação e Detecção de Reutilização (30d)
- **Hash de Senha**: Argon2id
- **Documentação**: Swagger / OpenAPI 3.0 (`/api/docs`)
- **Segurança**: Helmet, CORS restritivo, DTOs com `class-validator`, Interceptor de logs estruturados e Filtro global de exceções HTTP
- **Conteinerização**: Docker + Docker Compose

---

## 📁 Estrutura de Pastas

```text
/backend
├── prisma/
│   ├── schema.prisma        # Modelo relacional PostgreSQL completo
│   └── seed.ts              # Seed de desenvolvimento com usuário DRIVER de teste
├── src/
│   ├── auth/                # Login, Refresh, Logout, /me e estratégias JWT/Argon2
│   ├── common/              # Decorators, Guards (JWT e RBAC), Filters e Interceptors
│   ├── drivers/             # Endpoints /api/v1/drivers/me e veículo vinculado
│   ├── finance/             # Fechamentos e pagamentos para integração ERP
│   ├── health/              # Health check GET /health
│   ├── prisma/              # PrismaService e PrismaModule
│   ├── romaneios/           # Cadastro e consulta de romaneios de carga
│   ├── tolls/               # Cadastro e reembolso de comprovantes de pedágio
│   ├── trips/               # Gestão de viagens e entregas
│   ├── app.module.ts        # Módulo raiz NestJS
│   └── main.ts              # Bootstrapping com Swagger, Helmet e Pipes
├── test/                    # Testes de integração e E2E
├── Dockerfile               # Build multi-stage para produção
├── docker-compose.yml       # Orquestração do Backend e PostgreSQL
├── .env.example             # Modelo de variáveis de ambiente
└── package.json             # Dependências e scripts npm
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js >= 20.x e npm >= 10.x
- Docker e Docker Compose (ou instância do PostgreSQL 16 rodando localmente)

### 1. Clonar e Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e ajuste se necessário:
```bash
cp .env.example .env
```

### 3. Iniciar Banco PostgreSQL e Backend via Docker Compose
```bash
docker-compose up -d --build
```

### 4. Executar Migrations e Seed de Desenvolvimento (se rodando fora do Docker)
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

---

## 📚 Documentação Swagger / OpenAPI

Acesse a interface interativa do Swagger no seu navegador para testar todos os endpoints:
👉 **`http://localhost:3000/api/docs`**

---

## 🔑 Credenciais do Usuário DRIVER para Testes (Dev Seed)

- **CPF**: `38920184910`
- **Telefone**: `(11) 98765-4321`
- **Senha**: `senha123`
- **Veículo Vinculado**: Volvo FH 540 (Placa `ABC-1234`)

---

## 🧪 Executando os Testes Automatizados

Para rodar a suíte de testes unitários e de integração:
```bash
npm test
```

Para verificar a cobertura de código:
```bash
npm run test:cov
```

---

## 📱 Conexão com o Aplicativo Android HK Connect

1. Certifique-se de que o backend esteja em execução na porta `3000` (ou hospedado na URL de staging/produção).
2. O aplicativo Android aponta as chamadas Retrofit para a base URL configurada em `ApiClient.kt`:
   - Produção: `https://api.hkconnect.com.br/`
   - Emulador Android Local: `http://10.0.2.2:3000/`
   - Dispositivo Físico Local: `http://<IP_DO_SEU_COMPUTADOR>:3000/`
3. O app armazenará os tokens JWT em `TokenManager` (ou preferencialmente `HKConnectSecurePrefs`) e efetuará o refresh automático quando o Access Token expirar.
