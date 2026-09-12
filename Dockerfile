# --- STEP 1: Build stage ---
FROM node:24-slim AS builder

WORKDIR /app

# Enable CI mode to prevent pnpm TTY prompts
ENV CI=true
ENV PNPM_CONFIG_CONFIRM_MODULES_PURGE=false
ENV PNPM_CONFIG_ONLY_BUILT_DEPENDENCIES=esbuild

RUN apt-get update && apt-get install -y ca-certificates && \
    corepack enable && corepack prepare pnpm@latest --activate

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest, lockfile, and optional workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy remaining source code and run build
COPY . .
RUN pnpm run build

# --- STEP 2: Production runtime ---
FROM node:24-slim AS runner

WORKDIR /app

ENV CI=true
ENV PNPM_CONFIG_CONFIRM_MODULES_PURGE=false
ENV PNPM_CONFIG_ONLY_BUILT_DEPENDENCIES=esbuild

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
USER node

CMD ["node", "./dist/server/entry.mjs"]
