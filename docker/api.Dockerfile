FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY .npmrc .env package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api apps/api
COPY packages packages
RUN pnpm install --frozen-lockfile

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm --filter @sleepywear/database prisma:generate
RUN pnpm --filter @sleepywear/shared build
RUN pnpm --filter @sleepywear/api build

EXPOSE 4000
CMD ["pnpm", "--filter", "@sleepywear/api", "start"]
