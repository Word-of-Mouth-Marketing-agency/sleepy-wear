import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  findAll() {
    return [];
  }

  findOne(slug: string) {
    return { slug };
  }

  create(dto: CreateCategoryDto) {
    return { id: "new-category", ...dto };
  }

  update(id: string, dto: UpdateCategoryDto) {
    return { id, ...dto };
  }

  remove(id: string) {
    return { id, deleted: true };
  }
}
