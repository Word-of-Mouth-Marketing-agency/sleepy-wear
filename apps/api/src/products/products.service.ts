import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  findAll() {
    return [];
  }

  findOne(slug: string) {
    return { slug };
  }

  create(dto: CreateProductDto) {
    return { id: "new-product", ...dto };
  }

  update(id: string, dto: UpdateProductDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, deleted: true };
  }
}
