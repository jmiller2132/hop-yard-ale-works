import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "hop-yard-ale-works",
  title: "Hop Yard Ale Works",

  projectId: "huwr3nhe",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Global Config")
              .child(S.document().schemaType("globalConfig").documentId("globalConfig")),
            S.divider(),
            S.listItem()
              .title("Locations")
              .child(S.documentTypeList("location")),
            S.listItem()
              .title("Events")
              .child(S.documentTypeList("event")),
            S.divider(),
            S.listItem()
              .title("Menu Items")
              .child(S.documentTypeList("menuItem")),
            S.listItem()
              .title("Employee Picks")
              .child(S.documentTypeList("employeePick")),
            S.divider(),
            S.listItem()
              .title("Taproom Photos")
              .child(S.documentTypeList("taproomPhoto")),
            S.listItem()
              .title("Seasonal Themes")
              .child(S.documentTypeList("seasonalTheme")),
            S.divider(),
            S.listItem()
              .title("FAQs")
              .child(S.documentTypeList("faq")),
            S.listItem()
              .title("Contact Submissions")
              .child(S.documentTypeList("contactSubmission")),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
