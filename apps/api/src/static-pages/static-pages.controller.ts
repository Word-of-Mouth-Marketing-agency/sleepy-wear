import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { UpdateStaticPageDto } from "./dto/update-static-page.dto";
import { StaticPagesService } from "./static-pages.service";

@Controller("pages")
export class StaticPagesController {
  constructor(private readonly staticPagesService: StaticPagesService) {}

  @UseGuards(AdminGuard)
  @Get("admin/list")
  findAll() {
    return this.staticPagesService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get("admin/:slug")
  findAdminBySlug(@Param("slug") slug: string) {
    return this.staticPagesService.findAdminBySlug(slug);
  }

  @UseGuards(AdminGuard)
  @Patch("admin/:slug")
  update(@Param("slug") slug: string, @Body() dto: UpdateStaticPageDto) {
    return this.staticPagesService.update(slug, dto);
  }

  @Get(":slug")
  findPublicBySlug(@Param("slug") slug: string) {
    return this.staticPagesService.findPublicBySlug(slug);
  }
}
