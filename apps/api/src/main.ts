import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { resolve } from "node:path";
import { AppModule } from "./app.module";

loadEnv({ path: resolve(process.cwd(), "../../.env") });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsOrigin =
    process.env.WEB_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://sleepyweareg.com"
      : true);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const uploadRoot = process.env.UPLOAD_PATH
    ? resolve(process.env.UPLOAD_PATH)
    : resolve(process.cwd(), "../../uploads");
  app.useStaticAssets(uploadRoot, { prefix: "/media" });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
