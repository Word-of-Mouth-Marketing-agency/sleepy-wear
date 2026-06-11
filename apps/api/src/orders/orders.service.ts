import { Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(dto: CreateOrderDto) {
    return { id: "new-order", status: "PENDING", ...dto };
  }

  update(id: string, dto: UpdateOrderDto) {
    return { id, ...dto };
  }
}
