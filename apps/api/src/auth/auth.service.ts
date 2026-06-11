import { Injectable } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  adminLogin(dto: LoginDto) {
    return {
      email: dto.email,
      token: "placeholder-admin-token",
      message: "Authentication is intentionally placeholder-only.",
    };
  }
}
