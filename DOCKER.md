# Execucao com Docker

O ambiente Docker contem tres servicos:

- `postgres`: banco PostgreSQL com volume persistente;
- `api`: API Express com autenticacao JWT;
- `app`: servidor de desenvolvimento Expo/Metro.

## Configuracao

Crie o arquivo de ambiente:

```bash
cp .env.docker.example .env.docker
```

Troque o valor de `JWT_SECRET` por uma chave longa.

## Expo Go e navegador

Para Android Emulator, o Docker usa `10.0.2.2`, que e o endereco padrao do emulador para acessar o host Windows:

```env
EXPO_PUBLIC_API_URL=auto
REACT_NATIVE_PACKAGER_HOSTNAME=10.0.2.2
```

Com isso, nao e necessario editar manualmente o IP da maquina no `.env.docker`.

O celular e o computador precisam estar na mesma rede. O Expo inicia em modo LAN, sem abrir navegador automaticamente e sem exigir ADB ou Android SDK.

Ao executar o Compose em primeiro plano, o log do servico `app` mostra:

- o QR Code para abrir no Expo Go;
- o link do navegador em `http://localhost:8081`;
- o endereco da API usado pelo app.

```bash
docker compose --env-file .env.docker up --build
```

Se iniciar os containers em segundo plano, acompanhe o QR Code nos logs:

```bash
docker compose --env-file .env.docker logs -f app
```

## Comandos

Subir todo o ambiente:

```bash
docker compose --env-file .env.docker up --build
```

Subir em segundo plano:

```bash
docker compose --env-file .env.docker up --build -d
```

Ver o estado:

```bash
docker compose --env-file .env.docker ps
```

Ver logs:

```bash
docker compose --env-file .env.docker logs -f
```

Parar os servicos:

```bash
docker compose --env-file .env.docker down
```

Parar e apagar todos os dados do PostgreSQL:

```bash
docker compose --env-file .env.docker down -v
```

## Enderecos

- API: `http://localhost:3333`;
- Healthcheck da API: `http://localhost:3333/health`;
- Expo/Metro e navegador: `http://localhost:8081`;
- PostgreSQL: `localhost:5433`.

O schema do PostgreSQL e criado na inicializacao do volume e a API tambem executa a migration antes de iniciar.
