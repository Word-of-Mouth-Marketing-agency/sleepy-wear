FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @sleepywear/database prisma:generate
RUN pnpm --filter @sleepywear/shared build
RUN pnpm --filter @sleepywear/api build

EXPOSE 4000
CMD ["pnpm", "--filter", "@sleepywear/api", "start"]
