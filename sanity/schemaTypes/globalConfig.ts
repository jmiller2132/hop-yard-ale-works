import { defineType, defineField } from "sanity";

export const globalConfigSchema = defineType({
  name: "globalConfig",
  title: "Global Config",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({ name: "siteName", title: "Site Name", type: "string", initialValue: "Hop Yard Ale Works" }),
    defineField({
      name: "quotes",
      title: "Quote Rotation (Home + Location pages)",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "quote", title: "Quote", type: "text", rows: 2 },
          { name: "author", title: "Author", type: "string" },
          { name: "weight", title: "Weight (higher = more frequent)", type: "number", initialValue: 1 },
          { name: "pinFirst", title: "Pin as First-Visit Quote", type: "boolean", initialValue: false, description: "Only one quote should have this set. First-time visitors always see this quote." },
        ],
      }],
    }),
    defineField({
      name: "returningVisitorQuotes",
      title: "Returning Visitor Quotes (shown after 5+ visits)",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "quote", title: "Quote", type: "string" },
          { name: "author", title: "Author (optional)", type: "string" },
        ],
      }],
    }),
    defineField({
      name: "footerMessages",
      title: "Footer Rotating Messages",
      type: "array",
      of: [{ type: "object", fields: [{ name: "text", title: "Message", type: "string" }] }],
    }),
    defineField({
      name: "globalBanner",
      title: "Global Announcement Banner",
      type: "object",
      fields: [
        { name: "text", title: "Banner Text", type: "string" },
        { name: "isActive", title: "Show Banner", type: "boolean", initialValue: false },
        { name: "linkUrl", title: "Optional Link URL", type: "url" },
      ],
    }),
    defineField({ name: "mailchimpListId", title: "Mailchimp List / Audience ID", type: "string" }),
  ],
  preview: {
    prepare() {
      return { title: "Global Config" };
    },
  },
});
