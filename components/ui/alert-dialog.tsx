'use client'

import { ReactNode, useState } from 'react'

interface AlertDialogProps {
  children: ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

export default function AlertDialog({
  children,
  title,
  description,
  confirmText = 'Patvirtinti',
  cancelText = 'Atšaukti',
  onConfirm,
  onCancel
}: AlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    setIsOpen(false)
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{description}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

