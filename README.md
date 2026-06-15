# MYeconomy

O **MYeconomy** é um aplicativo de controle financeiro pessoal desenvolvido com React Native e Expo. Usuários podem definir limites mensais, registrar despesas e acompanhar o resultado de cada mês.

O projeto possui um aplicativo mobile e uma API REST com autenticação JWT e persistência em PostgreSQL.

## Funcionalidades

- Cadastro e login de usuários;
- Senhas protegidas com hash `bcrypt`;
- Autenticação e autorização com token JWT;
- Persistência de usuários, despesas e limites no PostgreSQL;
- Cadastro, edição e exclusão de despesas;
- Definição de limites mensais;
- Repetição de limites para meses futuros;
- Resumo mensal de gastos, saldo e progresso;
- Histórico por mês;
- Sessão persistida no dispositivo.

## Tecnologias

### Aplicativo

- React Native;
- Expo;
- TypeScript;
- React Navigation;
- Zustand;
- AsyncStorage;
- NativeWind e Tailwind CSS.

### API

- Node.js;
- Express;
- TypeScript;
- PostgreSQL;
- `pg`;
- JSON Web Token;
- `bcryptjs`;
- Zod.

## Estrutura

```text
MyEconomy/
├── server/                 # API REST e camada de banco de dados
│   ├── src/
│   │   ├── database/       # Conexão, migration e esquema SQL
│   │   ├── middleware/     # Autenticação JWT e erros
│   │   ├── routes/         # Rotas de autenticação e finanças
│   │   └── server.ts       # Entrada da API
│   └── package.json
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── navigation/         # Navegação do aplicativo
│   ├── screens/            # Telas
│   ├── services/           # Cliente HTTP da API
│   ├── stores/             # Estado e operações assíncronas
│   └── types/              # Tipos TypeScript
├── Dockerfile              # Imagem do aplicativo Expo
├── docker-compose.yml      # Orquestra aplicativo, API e PostgreSQL
├── DOCKER.md               # Guia de execução com Docker
└── App.tsx
```

## Pré-requisitos

- Node.js;
- npm;
- Docker com Docker Compose, ou uma instalação do PostgreSQL;
- Expo Go, emulador ou navegador.

## Execução com Docker

Todo o ambiente pode ser iniciado com Docker Compose. Consulte [DOCKER.md](./DOCKER.md) para configuração de navegador, emulador Android ou Expo Go.

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

## Execução local sem Docker

### 1. Banco de dados

Opcionalmente, personalize as credenciais e a porta:

```bash
cp .env.docker.example .env.docker
```

Inicie o PostgreSQL usando o arquivo de configuração:

```bash
docker compose --env-file .env.docker up -d postgres
```

Ou use diretamente os valores padrão do `docker-compose.yml`:

```bash
docker compose up -d postgres
```

O container cria automaticamente o banco, as tabelas, os índices, os relacionamentos e a extensão `pgcrypto`. Os dados ficam persistidos no volume `myeconomy_postgres_data`.

O `schema.sql` é executado automaticamente apenas quando o volume é criado pela primeira vez. Para verificar o banco, use:

```bash
docker compose ps
docker compose logs postgres
```

Para parar sem apagar os dados, execute `docker compose down`. Para recriar o banco do zero, apagando os dados, execute `docker compose down -v` antes de subir o serviço novamente.

### 2. API

Instale as dependências:

```bash
cd server
npm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

Troque `JWT_SECRET` no arquivo `.env` por uma chave longa e aleatória. Em volumes novos do Docker, as tabelas já são criadas automaticamente. Para aplicar o esquema manualmente em outro PostgreSQL, use:

```bash
npm run db:migrate
```

Inicie a API:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`. O endpoint `GET /health` pode ser usado para verificar o serviço.

### 3. Aplicativo

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Crie a configuração do aplicativo:

```bash
cp .env.example .env
```

Inicie o Expo:

```bash
npm start
```

## Endereço da API

Configure `EXPO_PUBLIC_API_URL` no `.env` da raiz:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333
```

- Navegador ou simulador iOS: normalmente `http://localhost:3333`;
- Emulador Android: `http://10.0.2.2:3333`;
- Celular físico: use o IP local do computador, como `http://192.168.1.10:3333`.

O celular e o computador devem estar na mesma rede, e a porta `3333` precisa estar acessível.

## Scripts

### Aplicativo

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o Expo |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Abre no navegador |

### API

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API com recarga automática |
| `npm run db:migrate` | Cria ou atualiza as tabelas |
| `npm run typecheck` | Verifica os tipos |
| `npm run build` | Compila a API |
| `npm start` | Executa a API compilada |

## Persistência e segurança

Usuários, despesas e limites são persistidos no PostgreSQL. As senhas nunca são retornadas pela API e são armazenadas somente como hash.

O aplicativo guarda no AsyncStorage apenas o JWT e os dados básicos da sessão. Todas as rotas financeiras exigem um token válido e usam o identificador contido nele para impedir acesso aos dados de outro usuário.

Para produção, utilize HTTPS, uma chave JWT forte, regras restritivas de CORS e um serviço seguro para os segredos de ambiente.

## Licença

Projeto desenvolvido para fins acadêmicos e de aprendizado.
