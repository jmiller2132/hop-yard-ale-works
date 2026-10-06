import { defineType, defineField, defineArrayMember } from "sanity";

export const tapRushBoardSchema = defineType({
  name: "tapRushBoard",
  title: "Tap Rush Leaderboard",
  type: "document",
  fields: [
    defineField({
      name: "month",
      title: "Month",
      type: "string",
      description: "YYYY-MM. A new board is created automatically each month.",
      readOnly: true,
    }),
    defineField({
      name: "entries",
      title: "Top 10",
      type: "array",
      description: "Remove an entry to take it off the board.",
      of: [
        defineArrayMember({
          type: "object",
          name: "tapRushEntry",
          fields: [
            defineField({ name: "name", title: "Initials", type: "string", readOnly: true }),
            defineField({ name: "score", title: "Score", type: "number", readOnly: true }),
            defineField({ name: "submittedAt", title: "Submitted At", type: "datetime", readOnly: true }),
          ],
          preview: {
            select: { title: "name", subtitle: "score" },
          },
        }),
      ],
    }),
  ],
  orderings: [
    { title: "Newest month", name: "monthDesc", by: [{ field: "month", direction: "desc" }] },
  ],
  preview: {
    select: { title: "month" },
    prepare: ({ title }) => ({ title: `Tap Rush ${title ?? ""}` }),
  },
});
