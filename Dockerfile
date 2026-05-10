# Install dependencies only when needed
FROM oven/bun:alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image, copy necessary files and run next
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Only copy .env if it exists, but typically you'd use env vars in production
# COPY .env . 

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "start"]
