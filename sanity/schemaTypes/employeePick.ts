import { defineType, defineField } from "sanity";

export const employeePickSchema = defineType({
  name: "employeePick",
  title: "Employee Pick",
  type: "document",
  fields: [
    defineField({ name: "employeeName", title: "Employee Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "staffBio", title: "Staff Bio (card flip back)", type: "string", description: "Short line shown on card flip: e.g. 'Jeff has been behind the bar since 2019.'" }),
    defineField({
      name: "location",
      title: "Location",
      type: "reference",
      to: [{ type: "location" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "pickType",
      title: "Pick Type",
      type: "string",
      options: { list: [
        { title: "Drinking", value: "drinking" },
        { title: "Eating", value: "eating" },
      ]},
    }),
    defineField({ name: "itemName", title: "Item Name", type: "string" }),
    defineField({ name: "message", title: "Custom Message (optional)", type: "string" }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "employeeName", subtitle: "itemName" },
  },
});
