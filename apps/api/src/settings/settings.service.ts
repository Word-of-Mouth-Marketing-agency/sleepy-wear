import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingDto } from "./dto/update-setting.dto";

const PUBLIC_KEYS = [
  "homepage_mid_banner",
  "homepage_why_sleepywear",
  "homepage_marquee",
  "homepage_best_sellers",
  "site_notice",
  "site_footer_text",
  "site_social_links",
  "checkout_notice",
  "marketing_pixel",
];

const DEFAULT_SETTINGS: Record<string, unknown> = {
  homepage_mid_banner: {
    title: "عرض خاص",
    subtitle: "خصم 10% على أول طلب",
    description: "+ توصيل مجاني للطلبات فوق 999 جنيه",
    buttonText: "تسوق الآن",
    buttonUrl: "/products",
    enabled: true,
  },
  homepage_why_sleepywear: {
    title: "ليه SleepyWear؟",
    subtitle: "كل اللي تحتاجيه لراحة البيت وأناقة كل يوم",
    enabled: true,
    reasons: [
      {
        title: "أسعار المصنع مباشرة",
        description: "اختيارات حقيقية بسعر قريب من المصنع من غير طبقات زيادة.",
        icon: "factory",
        enabled: true,
      },
      {
        title: "خامات مريحة وجودة عالية",
        description: "ملابس بيت ولانچيري بخامات ناعمة ومناسبة للاستخدام اليومي.",
        icon: "refresh",
        enabled: true,
      },
      {
        title: "تشكيلات متنوعة لكل الأذواق",
        description: "بيچامات، ساتان، كيرفي، لانچيري وكوليكشنات تتجدد باستمرار.",
        icon: "chat",
        enabled: true,
      },
      {
        title: "توصيل سريع لكل المحافظات",
        description: "نوصل طلبك لباب البيت مع متابعة واضحة لحد الاستلام.",
        icon: "truck",
        enabled: true,
      },
    ],
  },
  homepage_marquee: {
    messages: ["توصيل مجاني", "خصم 10%", "جودة من المصنع"],
  },
  homepage_best_sellers: {
    productIds: [],
  },
  site_notice: {
    text: "عروض و خصومات الشتاء .. اي اوردر يبدأ من 999 جنيه خصم 10% بأكواد خصم BF10 - S10",
    enabled: true,
  },
  site_footer_text: {
    description: "ملابس منزلية ولانجري بأفضل الأسعار من المصنع مباشرة.",
  },
  site_social_links: {
    facebook: "https://www.facebook.com/Sleepy.lingerie.HomeWear/",
    instagram: "https://www.instagram.com/sleepy.lingerie2?igsh=MTE2aTd3Y2N1aDM0OA==",
    tiktok: "https://www.tiktok.com/@sleepy.lingerie?_r=1&_t=ZS-97I0xGD5E61",
    telegram: "https://t.me/sleepylingerie",
  },
  name: "SleepyWear",
  domain: "sleepyweareg.com",
  currency: "EGP",
  marketing_pixel: { enabled: false, pixelId: "" },
  checkout_notice: {
    enabled: true,
    text: "يتم دفع ديبوزت قبل الشحن: 50 ج.م داخل القاهرة، و100 ج.م لباقي المحافظات.",
  },
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });

    const result: Record<string, unknown> = {
      name: DEFAULT_SETTINGS.name,
      domain: DEFAULT_SETTINGS.domain,
      currency: DEFAULT_SETTINGS.currency,
    };

    for (const key of PUBLIC_KEYS) {
      const row = settings.find((s) => s.key === key);
      result[key] = row?.value ?? DEFAULT_SETTINGS[key];
    }

    return result;
  }

  async findOne(key: string) {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    if (!row) throw new NotFoundException("Setting not found");
    return { key: row.key, value: row.value };
  }

  async update(key: string, dto: UpdateSettingDto) {
    const value = dto.value as Prisma.InputJsonValue;
    const row = await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { key: row.key, value: row.value as Record<string, unknown> };
  }
}
