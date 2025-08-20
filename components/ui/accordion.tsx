'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-3 border-t border-gray-200">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

