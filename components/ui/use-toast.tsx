"use client"

import * as React from "react"

type ToastVariant = "default" | "destructive"

interface ToastState {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: ToastState[]
  toast: (props: Omit<ToastState, "id">) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const toast = React.useCallback(
    (props: Omit<ToastState, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, ...props }
      
      setToasts((prev) => [...prev, newToast])
      
      if (props.duration !== Infinity) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, props.duration || 5000)
      }
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}