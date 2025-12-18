import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "./Badge"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}