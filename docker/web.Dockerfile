FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY packages/shared packages/shared
RUN pnpm --filter @sleepywear/shared build
RUN pnpm --filter @sleepywear/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@sleepywear/web", "start"]
