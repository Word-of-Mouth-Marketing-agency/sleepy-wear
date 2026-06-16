# Design

## Overview

SleepyWear is an Arabic RTL ecommerce storefront for women’s lingerie and homewear. The visual system should feel feminine, clean, soft, commercial, trustworthy, and accessible to Egyptian shoppers. The public storefront carries the brand; admin screens serve operations and should stay quieter.

## Color Palette

| Role | Value | Usage |
| --- | --- | --- |
| Brand pink | `#F389D4` | Primary brand accent, CTAs, highlights, badges, soft promotional moments. |
| Brand blue | `#00AEEF` | Secondary accent, delivery/trust signals, links, supporting actions, hover states. |
| White | `#FFFFFF` | Main storefront background and clean product surfaces. |
| Black | `#000000` | Strong text and icons when contrast is needed. Use carefully so the site does not become harsh or black-heavy. |
| Light pink | `#FFF5F9` | Soft background tint, subtle section contrast, scrollbar track. |
| Light blue | `#F0F9FF` | Secondary soft background tint and calm utility areas. |
| Line | `#E8E8E8` | Borders and dividers. |
| Muted text | `#8B8B8B` | Secondary text where contrast remains acceptable. |

Color direction:
- Use pink as the emotional brand lead and blue as the functional/trust accent.
- Keep backgrounds mostly light, airy, and product-friendly.
- Avoid random gradients and heavy black sections.
- Use color to guide shopping decisions, not to decorate every container.

## Typography

Primary font: Cairo via `next/font/google`.

Typography should support Arabic RTL first while remaining clean for English fragments such as “VIP” and “Silky Satin”.

Guidelines:
- Use clear hierarchy through size and weight.
- Keep body text readable and avoid tiny gray copy.
- Let product names wrap cleanly, especially long Arabic names.
- Headings can be bold, but avoid oversized hero-scale type inside small cards or admin panels.

## Layout

Public storefront:
- Mobile-first Arabic RTL layouts.
- Clean spacing with normal section rhythm.
- Product images and category navigation should be easy to scan.
- Avoid cluttered marketplace density on public pages.
- Cards are acceptable for repeated product/category items, but avoid nested card stacks.

Admin:
- Quiet, utilitarian, and predictable.
- Prioritize forms, tables, stock data, order status, and repeat workflows.
- Do not import storefront decoration into admin management pages.

## Components

Core storefront components:
- Three-row sticky header with notice, centered logo row, and category navigation.
- Hero slider.
- Category slider/card section.
- Product cards with real images, prices, and status cues.
- Product detail gallery and variant selectors.
- Cart and checkout forms.
- Footer with brand and contact links.

Interaction expectations:
- Buttons should clearly communicate action.
- Cart/search icons should remain simple and legible.
- Loading, empty, and error states should be explicit and Arabic-friendly.
- Variant/stock selection should avoid silent failure.

## Imagery

Use real product imagery wherever available. Placeholders are acceptable only when imported images are unavailable. Product images should be inspectable and not hidden behind dark overlays or decorative crops.

## Motion

Motion should be subtle, purposeful, and optional. Avoid bounce/elastic effects and avoid any motion that makes product browsing feel unstable. Respect reduced-motion preferences.

## Responsive Behavior

The storefront is phone-first. Important navigation, category access, product cards, cart, and checkout must remain usable on narrow screens. Desktop should feel more spacious but not radically different from mobile browsing logic.

## Avoid

- Generic SaaS layouts.
- Harsh black-heavy styling.
- Decorative gradients with no brand reason.
- Cluttered marketplace feel.
- Purely decorative UI that hides products or slows shopping.
- Backend or business logic changes for visual-only work.
