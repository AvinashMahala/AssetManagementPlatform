import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

export type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>
export type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>
export type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>
export type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>
export type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>
export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
export type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>