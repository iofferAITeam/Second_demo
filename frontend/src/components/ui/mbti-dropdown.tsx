'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { mbtiGrid, MBTIType } from '@/data/mbti'

interface MBTIDropdownProps {
  value?: string
  placeholder?: string
  onChange: (value: string) => void
  error?: boolean
  className?: string
}

export default function MBTIDropdown({ 
  value, 
  placeholder = "Please Choose", 
  onChange, 
  error = false,
  className = ""
}: MBTIDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find selected MBTI type
  const selectedType = mbtiGrid.flat().find(type => type.code === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTypeSelect = (type: MBTIType) => {
    onChange(type.code)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-[30px] px-[20px] py-[16px] flex items-center justify-between transition-colors ${
          error ? 'border-red-500' : 'border-[#e8efff] hover:border-[#1c5dff]'
        } ${isOpen ? 'border-[#1c5dff]' : ''}`}
      >
        <span className={`text-[16px] font-light font-inter ${
          selectedType ? 'text-black' : 'text-[#cdd4e4]'
        }`}>
          {selectedType ? selectedType.name : placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-black transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e8efff] rounded-[12px] shadow-[0px_0px_20px_0px_rgba(28,93,255,0.12)] z-[9999] p-[16px] w-[320px]">
          {/* MBTI Grid */}
          <div className="space-y-[12px]">
            {mbtiGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-[12px] justify-center">
                {row.map((type) => (
                  <button
                    key={type.code}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`w-[50px] h-[28px] flex items-center justify-center px-[8px] py-[8px] rounded-[90px] border border-[#e8efff] transition-colors ${
                      value === type.code 
                        ? 'bg-[#1c5dff] text-white border-[#1c5dff]' 
                        : 'bg-white text-[#96a3c2] hover:bg-[#f5f9ff] hover:text-[#1c5dff]'
                    }`}
                  >
                    <span className="text-[12px] font-normal whitespace-nowrap">
                      {type.name}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
