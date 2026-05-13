import { defineField } from "sanity";

export const sectionAnchorIdField = defineField({
  name: "id",
  title: "ID",
  type: "string",
  description:
    "Used for in-page jump links (e.g. contact-form). Use only lowercase letters, numbers, and hyphens between words.",
});
