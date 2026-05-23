# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# On copie les manifestes en premier pour profiter du cache des layers Docker.
# Si package.json ne change pas, npm ci ne tourne pas à chaque build.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : Production ─────────────────────────────────────────────────────
# Image minimale : uniquement dist/ + server.js + dépendances runtime.
# Pas de node_modules de dev, pas de sources, pas d'outillage de build.
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
