"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  /** Quando não informado, o diálogo é controlado por triggerButton */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton: React.ReactNode;
  confirmButton: {
    label: string;
    variant?:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
    disabled?: boolean;
  };
  cancelButton?: {
    label: string;
    variant?:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
  };
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  description,
  open,
  onOpenChange,
  triggerButton,
  confirmButton,
  cancelButton = {
    label: "Cancelar",
    variant: "outline",
  },
  onConfirm,
}: ConfirmDialogProps) {
  const isControlled = open !== undefined && onOpenChange !== undefined;

  return (
    <AlertDialog
      {...(isControlled ? { open, onOpenChange } : {})}
    >
      {!isControlled && <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={cancelButton.variant}>{cancelButton.label}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={confirmButton.variant}
              disabled={confirmButton.disabled}
              onClick={onConfirm}
            >
              {confirmButton.label}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
