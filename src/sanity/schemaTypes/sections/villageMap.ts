/* eslint-disable @typescript-eslint/no-explicit-any */
// sections/villageMap.ts
import { defineType, defineField } from "sanity";
import { MarkerIcon } from "@sanity/icons";

export default defineType({
  name: "villageMap",
  title: "Village Map",
  type: "object",
  icon: MarkerIcon,
  fields: [
    defineField({
      name: "floors",
      title: "Floors",
      type: "array",
      of: [
        {
          type: "object",
          name: "floor",
          title: "Floor",
          fields: [
            {
              name: "label",
              title: "Label (Desktop)",
              type: "string",
              description: 'Full label shown on desktop (e.g., "First Floor")',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "mobileLabel",
              title: "Label (Mobile)",
              type: "string",
              description: 'Shorter label shown on mobile (e.g., "Floor 1")',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "desktopImage",
              title: "Floor Plan Image",
              type: "image",
              options: { hotspot: true },
              fields: [
                {
                  name: "alt",
                  type: "string",
                  title: "Alt Text",
                  description: "Important for accessibility and SEO.",
                },
              ],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "desktopSpacesOverlayImage",
              title: "Spaces Overlay SVG",
              type: "file",
              description: "Upload an SVG file to be embedded inline",
              options: {
                accept: "image/svg+xml,.svg",
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule) =>
                Rule.custom(async (file: any, context) => {
                  if (!file?.asset?._ref) {
                    return true as const;
                  }

                  try {
                    const client = context.getClient({
                      apiVersion: "2025-05-08",
                    });
                    const asset = await client.fetch("*[_id == $id][0]", {
                      id: file.asset._ref,
                    });

                    // Check file extension
                    const filename = asset?.originalFilename || "";
                    if (filename && !filename.toLowerCase().endsWith(".svg")) {
                      return "Only .svg files are allowed";
                    }
                  } catch {
                    // If we can't fetch the asset yet (e.g., during upload), skip validation
                  }

                  return true as const;
                }),
            },
            {
              name: "spots",
              title: "Spaces",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "space",
                  title: "Space",
                  fields: [
                    {
                      name: "id",
                      title: "ID",
                      type: "string",
                      description:
                        "ID should be the name of the layer in the SVG file",
                      validation: (Rule) => Rule.required(),
                    },
                    defineField({
                      name: "brand",
                      title: "Brand",
                      type: "reference",
                      to: [{ type: "brands" }],
                      description:
                        "Popup uses this brand’s title, page content, and thumbnail image.",
                      options: {
                        disableNew: true,
                      },
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      id: "id",
                      brandTitle: "brand.title",
                      media: "brand.thumbnailImage",
                    },
                    prepare(selection) {
                      const { id, brandTitle, media } = selection;
                      return {
                        title: brandTitle || id || "Space",
                        media,
                      };
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              title: "label",
              media: "desktopImage",
            },
            prepare(selection) {
              const { title, media } = selection;
              return {
                title: title || "Untitled Floor",
                media: media,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(10),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Village Map",
      };
    },
  },
});
