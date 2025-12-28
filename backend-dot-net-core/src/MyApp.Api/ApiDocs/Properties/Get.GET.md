---
summary: "Get property (YAML front-matter)"
description: |
  Returns the property with full details. Requires Bearer token.
tags: [Properties, Read]
responses:
  "200":
    description: "Property found via YAML"
    content:
      application/json:
        examples:
          yamlExample:
            summary: "YAML example"
            value:
              id: 1
              name: "YAML Prop"
---

This endpoint returns a single property resource by id.
