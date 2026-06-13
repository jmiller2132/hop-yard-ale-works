import { defineType, defineField } from "sanity";

export const taproomPhotoSchema = defineType({
  name: "taproomPhoto",
  title: "Taproom Photo",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "location",
      title: "Location (optional)",
      type: "reference",
      to: [{ type: "location" }],
    }),
    defineField({
      name: "featured",
      title: "Featured (show first)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first. Leave blank to sort by upload date.",
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "location.name", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title: title ?? "Untitled photo", subtitle, media };
    },
  },
});
