FROM node:20-alpine

WORKDIR /app

ENV EXPO_NO_TELEMETRY=1

RUN apk add --no-cache iproute2

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN sed -i 's/\r$//' /app/docker/expo-entrypoint.sh
RUN cp /app/docker/expo-entrypoint.sh /usr/local/bin/expo-entrypoint.sh

EXPOSE 8081 19000 19001 19002

CMD ["sh", "/usr/local/bin/expo-entrypoint.sh"]
