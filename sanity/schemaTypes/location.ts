import { defineType, defineField } from "sanity";

export const locationSchema = defineType({
  name: "location",
  title: "Location",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "address", title: "Address", type: "text", rows: 3 }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "googleMapsUrl", title: "Google Maps URL", type: "url" }),
    defineField({ name: "orderOnlineUrl", title: "Order Online URL (Toast)", type: "url" }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "hours",
      title: "Regular Hours",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "day", title: "Day", type: "string", options: { list: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] } },
          { name: "open", title: "Opens At", type: "string" },
          { name: "close", title: "Closes At", type: "string" },
          { name: "isClosed", title: "Closed This Day", type: "boolean" },
        ],
      }],
    }),
    defineField({
      name: "sundayHours",
      title: "Sunday Hours (override — used for open/closed badge)",
      type: "object",
      fields: [
        { name: "open", title: "Opens At", type: "string" },
        { name: "close", title: "Closes At", type: "string" },
        { name: "isClosed", title: "Closed Sundays", type: "boolean" },
      ],
    }),
    defineField({
      name: "holidayOverrides",
      title: "Holiday Overrides",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "date", title: "Date (YYYY-MM-DD)", type: "string" },
          { name: "label", title: "Label (e.g. Christmas Day)", type: "string" },
          { name: "hoursNote", title: "Hours Note", type: "string" },
        ],
      }],
    }),
    defineField({
      name: "visitFAQs",
      title: "Visit FAQs",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "question", type: "string" },
          { name: "answer", type: "text" },
        ],
      }],
    }),
    defineField({
      name: "privateEvents",
      title: "Private Events Block (The Falls only)",
      type: "object",
      fields: [
        { name: "isActive", title: "Show Private Events Section", type: "boolean" },
        { name: "headline", title: "Headline", type: "string" },
        { name: "description", title: "Description", type: "text", rows: 3 },
        {
          name: "highlights",
          title: "Highlights",
          type: "array",
          of: [{ type: "object", fields: [{ name: "text", type: "string" }] }],
        },
        { name: "photo", title: "Event Space Photo", type: "image", options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "address" },
  },
});
