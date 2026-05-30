import { defineType, defineField } from "sanity";

export const menuItemSchema = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "price", title: "Price", type: "string" }),
    defineField({
      name: "location",
      title: "Location",
      type: "reference",
      to: [{ type: "location" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "menuType",
      title: "Menu Type",
      type: "string",
      options: { list: [
        { title: "Food", value: "food" },
        { title: "Wine", value: "wine" },
        { title: "Cider / Seltzer", value: "cider" },
        { title: "Non-Alcoholic / Soda", value: "na" },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({ name: "section", title: "Section (e.g. Pizzas, Sharables)", type: "string" }),
    defineField({
      name: "tags",
      title: "Dietary Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { list: [
        { title: "Vegetarian", value: "vegetarian" },
        { title: "Vegan", value: "vegan" },
        { title: "Gluten Free", value: "glutenFree" },
      ]},
    }),
    defineField({ name: "isFanFavorite", title: "Fan Favorite", type: "boolean" }),
    defineField({ name: "isStaffPick", title: "Staff Pick", type: "boolean" }),
    defineField({ name: "isActive", title: "Active (show on menu)", type: "boolean", initialValue: true }),
    defineField({ name: "displayOrder", title: "Display Order", type: "number" }),
  ],
  preview: {
    select: { title: "name", subtitle: "section", media: "image" },
  },
});
