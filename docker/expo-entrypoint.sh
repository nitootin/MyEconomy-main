#!/bin/sh
set -eu

EXPO_PORT="${EXPO_PORT:-8081}"
EXPO_HOST="${EXPO_HOST:-lan}"
HOST_IP="${REACT_NATIVE_PACKAGER_HOSTNAME:-auto}"

if [ "$EXPO_HOST" = "lan" ] && [ "$HOST_IP" = "auto" ]; then
  HOST_IP="10.0.2.2"
fi

if [ "$EXPO_HOST" = "lan" ] && [ -z "$HOST_IP" ]; then
  echo "Nao foi possivel detectar o IP local."
  echo "Defina REACT_NATIVE_PACKAGER_HOSTNAME e EXPO_PUBLIC_API_URL no .env.docker."
  exit 1
fi

if [ "$EXPO_HOST" = "lan" ]; then
  export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST_IP"
fi

echo "Expo Go: o QR Code sera exibido abaixo pelo Expo."
echo "Navegador: http://localhost:${EXPO_PORT}"
if [ "$EXPO_HOST" = "lan" ]; then
  echo "Expo LAN: exp://${HOST_IP}:${EXPO_PORT}"
else
  echo "Expo Tunnel: o Expo vai gerar uma URL publica temporaria."
fi
echo "API: ${EXPO_PUBLIC_API_URL}"
echo "Iniciando Metro em modo ${EXPO_HOST}."

exec npx expo start --host "$EXPO_HOST" --port "$EXPO_PORT" --web --clear
