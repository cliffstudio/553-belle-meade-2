import { defineType, defineField } from "sanity";

export default defineType({
  name: "planYourVisitSection",
  title: "Plan Your Visit",
  type: "object",
  fields: [
    defineField({
      name: "planYourVisitHeading",
      title: "Heading",
      type: "string",
      hidden: ({ document }) => document?.pageType !== "carousel",
    }),
    defineField({
      name: "planYourVisitBody",
      title: "Body",
      type: "richPortableText",
      hidden: ({ document }) => document?.pageType !== "carousel",
    }),
    defineField({
      name: "planYourVisitDetails",
      title: "Details",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "subtitle",
                      title: "Subtitle",
                      type: "string",
                    }),
                    defineField({
                      name: "body",
                      title: "Body",
                      type: "richPortableText",
                    }),
                  ],
                  preview: {
                    select: {
                      title: "subtitle",
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: "heading",
            },
          },
        },
      ],
      hidden: ({ document }) => document?.pageType !== "carousel",
    }),
    defineField({
      name: "planYourVisitImages",
      title: "Images",
      type: "array",
      of: [{ type: "image" }],
      hidden: ({ document }) => document?.pageType !== "carousel",
    }),
  ],
  preview: {
    select: {
      heading: "planYourVisitHeading",
      body: "planYourVisitBody",
      details: "planYourVisitDetails",
      images: "planYourVisitImages",
    },
    prepare({ heading, body, details, images }) {
      return {
        title: "Plan Your Visit",
        subtitle: `${heading || "No heading"} & ${body || "No body"} & ${details || "No details"} & ${images || "No images"}`,
      };
    },
  },
});
