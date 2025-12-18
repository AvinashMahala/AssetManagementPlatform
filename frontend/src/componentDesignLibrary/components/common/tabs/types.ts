import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>
export type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
export type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>