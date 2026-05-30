import { defineType, defineField } from "sanity";

export const taproomPhotoSchema = defineType({
  name: "taproomPhoto",
  title: "Taproom Photo",
  type: "document",
  fields: [
    defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "location",
      title: "Location (optional)",
      type: "reference",
      to: [{ type: "location" }],
    }),
    defineField({ name: "submittedBy", title: "Submitted By", type: "string" }),
    defineField({
      name: "approvalStatus",
      title: "Approval Status",
      type: "string",
      options: { list: [
        { title: "Pending Review", value: "pending" },
        { title: "Approved", value: "approved" },
        { title: "Rejected", value: "rejected" },
      ]},
      initialValue: "pending",
      validation: (r) => r.required(),
    }),
    defineField({ name: "featured", title: "Featured (show first in strip)", type: "boolean" }),
  ],
  preview: {
    select: { title: "submittedBy", subtitle: "approvalStatus", media: "image" },
  },
});
