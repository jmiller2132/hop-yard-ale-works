import { defineType, defineField } from "sanity";

export const contactSubmissionSchema = defineType({
  name: "contactSubmission",
  title: "Contact Submission",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "subject", title: "Subject", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "submittedAt", title: "Submitted At", type: "datetime" }),
  ],
  preview: {
    select: { title: "name", subtitle: "submittedAt" },
  },
});
