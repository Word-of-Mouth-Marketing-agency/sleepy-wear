import { Injectable } from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(dto: CreateCustomerDto) {
    return { id: "new-customer", ...dto };
  }

  update(id: string, dto: UpdateCustomerDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, deleted: true };
  }
}
