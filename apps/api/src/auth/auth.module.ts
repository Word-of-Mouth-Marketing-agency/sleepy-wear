import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const jwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret ?? "dev-secret-change-me",
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
