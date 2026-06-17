import { PartialType } from "@nestjs/mapped-types";
import { CreateShippingCityDto } from "./create-shipping-city.dto";

export class UpdateShippingCityDto extends PartialType(CreateShippingCityDto) {}
