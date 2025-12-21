import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import type { VariantProps } from "class-variance-authority"
import { labelVariants } from "./Label"

export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>