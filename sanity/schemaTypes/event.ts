import { defineType, defineField } from "sanity";

export const eventSchema = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Event Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({ name: "time", title: "Time (e.g. 7:00 PM)", type: "string" }),
    defineField({
      name: "location",
      title: "Location",
      type: "reference",
      to: [{ type: "location" }],
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "isRecurring", title: "Recurring Event", type: "boolean" }),
    defineField({ name: "recurrenceNote", title: "Recurrence Note (e.g. Every Sunday)", type: "string" }),
    defineField({ name: "requiresTicket", title: "Requires Ticket", type: "boolean" }),
    defineField({ name: "ticketUrl", title: "Ticket URL", type: "url" }),
    defineField({ name: "externalUrl", title: "More Info URL (optional)", type: "url" }),
    defineField({
      name: "artistLinks",
      title: "Artist / Performer Links",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label (e.g. Spotify, Instagram)", type: "string" }),
          defineField({ name: "url", title: "URL", type: "url" }),
        ],
      }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: [
        { title: "Live Music", value: "Live Music" },
        { title: "Tap Release", value: "Tap Release" },
        { title: "Out & About", value: "Out & About" },
        { title: "Special", value: "Special" },
        { title: "Closure", value: "Closure" },
      ]},
    }),
    defineField({ name: "isActive", title: "Active (show on site)", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", subtitle: "date" },
  },
});
