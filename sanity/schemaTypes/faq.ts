import { defineType, defineField } from "sanity";

export const faqSchema = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "location",
      title: "Location (leave blank for global)",
      type: "reference",
      to: [{ type: "location" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: [
        { title: "Hours", value: "hours" },
        { title: "Visit Info", value: "visit" },
        { title: "Food", value: "food" },
        { title: "Drinks", value: "drinks" },
        { title: "Events", value: "events" },
        { title: "Contact", value: "contact" },
        { title: "General", value: "general" },
      ]},
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "category" },
  },
});
