import { Injectable } from "@nestjs/common";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponsService {
  findAll() {
    return [];
  }

  findOne(code: string) {
    return { code };
  }

  create(dto: CreateCouponDto) {
    return { id: "new-coupon", ...dto };
  }

  update(id: string, dto: UpdateCouponDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, deleted: true };
  }
}
