FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY packages packages

ARG NEXT_PUBLIC_API_URL
ARG API_INTERNAL_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN pnpm --filter @sleepywear/shared build
RUN pnpm --filter @sleepywear/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@sleepywear/web", "start"]
