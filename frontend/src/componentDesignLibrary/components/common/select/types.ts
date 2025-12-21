import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

export type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>
export type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>
export type SelectValueProps = React.ComponentProps<typeof SelectPrimitive.Value>
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: string
  success?: boolean
  loading?: boolean
  helperText?: string
}
export type SelectScrollUpButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
export type SelectScrollDownButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
export type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
export type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
export type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
export type SelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>