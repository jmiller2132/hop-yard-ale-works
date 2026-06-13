import { defineType, defineField } from "sanity";

export const seasonalThemeSchema = defineType({
  name: "seasonalTheme",
  title: "Seasonal Theme",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Theme Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "badgeText", title: "Badge Text (shown on heroes)", type: "string" }),
    defineField({ name: "bannerMessage", title: "Global Banner Message", type: "string" }),
    defineField({ name: "bannerLinkUrl", title: "Banner Link URL (optional)", type: "url" }),
    defineField({
      name: "heroImages",
      title: "Hero Image Overrides",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "logoOverride",
      title: "Logo Override Image",
      type: "image",
      description: "When uploaded, replaces the standard GlobalHeader logo during this theme window.",
    }),
    defineField({
      name: "accentPalette",
      title: "Accent Color Palette",
      type: "string",
      options: { list: [
        { title: "Default (Brand)", value: "default" },
        { title: "St. Patrick's Day", value: "stPatricks" },
        { title: "Summer Bright", value: "summerBright" },
        { title: "4th of July", value: "fourthOfJuly" },
        { title: "Oktoberfest", value: "oktoberfest" },
        { title: "Halloween", value: "halloween" },
        { title: "Christmas / Holiday", value: "christmas" },
      ]},
      initialValue: "default",
    }),
    defineField({ name: "startDate", title: "Start Date", type: "date" }),
    defineField({ name: "endDate", title: "End Date", type: "date" }),
    defineField({
      name: "isActive",
      title: "Active Now",
      type: "boolean",
      initialValue: false,
      description: "Only one theme should be active at a time. Flip this to activate/deactivate.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "isActive" },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? "🟢 Active" : "⚪ Inactive" };
    },
  },
});
