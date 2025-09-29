'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'
import { countries, countriesByLetter, alphabetLetters, searchCountries, Country } from '@/data/countries'

interface CustomDropdownProps {
  value?: string
  placeholder?: string
  onChange: (value: string) => void
  error?: boolean
  className?: string
}

export default function CustomDropdown({ 
  value, 
  placeholder = "Please Choose", 
  onChange, 
  error = false,
  className = ""
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSection, setCurrentSection] = useState<string>('A')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Get the selected country name
  const selectedCountry = countries.find(country => country.code === value)

  // Filter countries based on search - show all countries when not searching
  const filteredCountries = searchQuery 
    ? searchCountries(searchQuery)
    : countries

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  // Set up intersection observer for better scroll tracking
  useEffect(() => {
    if (!isOpen || searchQuery) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that's most visible
        let mostVisibleEntry = null
        let maxIntersectionRatio = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio
            mostVisibleEntry = entry
          }
        })

        if (mostVisibleEntry) {
          const letter = (mostVisibleEntry.target as Element).getAttribute('data-letter')
          if (letter && letter !== currentSection) {
            setCurrentSection(letter)
          }
        }
      },
      {
        root: scrollRef.current,
        rootMargin: '-20px 0px -80% 0px', // Only trigger when section is near the top
        threshold: [0, 0.1, 0.5, 1.0]
      }
    )

    // Observe all section headers
    Object.values(sectionRefs.current).forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [isOpen, searchQuery, currentSection])

  // Handle scroll to update current section (fallback)
  const handleScroll = () => {
    if (!scrollRef.current || searchQuery) return

    const scrollTop = scrollRef.current.scrollTop
    
    // Find which section is currently at the top of the viewport
    let currentVisibleLetter = 'A'
    
    for (const letter of alphabetLetters) {
      const sectionElement = sectionRefs.current[letter]
      if (sectionElement) {
        const sectionTop = sectionElement.offsetTop
        
        // If we've scrolled past this section, it's the current one
        if (scrollTop >= sectionTop - 10) {
          currentVisibleLetter = letter
        }
      }
    }
    
    if (currentVisibleLetter !== currentSection) {
      setCurrentSection(currentVisibleLetter)
    }
  }

  // Scroll to a specific letter section
  const scrollToLetter = (letter: string) => {
    const sectionElement = sectionRefs.current[letter]
    if (sectionElement && scrollRef.current) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentSection(letter)
    }
  }

  const handleCountrySelect = (country: Country) => {
    onChange(country.code)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleLetterClick = (letter: string) => {
    scrollToLetter(letter)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value) {
      // If searching, show the first letter of the first result
      const results = searchCountries(e.target.value)
      if (results.length > 0) {
        setCurrentSection(results[0].name.charAt(0).toUpperCase())
      }
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center justify-between ${
          error ? 'border-red-500' : 'border-[#e8efff]'
        } hover:border-[#1c5dff] transition-colors`}
      >
        <span className={`text-[16px] font-light font-inter ${
          selectedCountry ? 'text-black' : 'text-[#cdd4e4]'
        }`}>
          {selectedCountry ? selectedCountry.name : placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-black transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-[0px_0px_20px_0px_rgba(28,93,255,0.12)] z-50 max-h-[400px] flex flex-col">
          {/* Search Bar */}
          <div className="p-[20px] pb-[8px]">
            <div className="relative">
              <div className="absolute left-[12px] top-1/2 transform -translate-y-1/2">
                <SearchIcon className="w-3 h-3 text-[#cdd4e4]" />
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Keyword Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-[32px] pr-[12px] py-[8px] border border-[#e8efff] rounded-[1000px] text-[16px] font-light font-inter placeholder-[#cdd4e4] focus:outline-none focus:border-[#1c5dff]"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 min-h-0">
            {/* Countries List */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
              {searchQuery ? (
                // Search results
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredCountries.map((country, index) => (
                    <div key={country.code}>
                      <button
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-[20px] py-[16px] text-left hover:bg-[#f5f9ff] transition-colors"
                      >
                        <span className="text-[16px] font-normal text-black">
                          {country.name}
                        </span>
                      </button>
                      {index < filteredCountries.length - 1 && (
                        <div className="h-px bg-[#e8efff] mx-[20px]" />
                      )}
                    </div>
                  ))}
                  
                  {filteredCountries.length === 0 && (
                    <div className="px-[20px] py-[16px] text-[16px] text-[#96a3c2]">
                      No countries found
                    </div>
                  )}
                </div>
              ) : (
                // Full alphabetical list
                <div className="max-h-[300px] overflow-y-auto">
                  {alphabetLetters.map((letter) => {
                    const letterCountries = countriesByLetter[letter] || []
                    if (letterCountries.length === 0) return null

                    return (
                      <div key={letter}>
                        {/* Section Header */}
                        <div 
                          ref={(el) => (sectionRefs.current[letter] = el)}
                          data-letter={letter}
                          className="bg-[#f5f9ff] px-[20px] py-[2px] sticky top-0 z-10"
                        >
                          <span className="text-[12px] font-medium text-[#96a3c2]">
                            {letter}
                          </span>
                        </div>
                        
                        {/* Countries in this section */}
                        {letterCountries.map((country, index) => (
                          <div key={country.code}>
                            <button
                              type="button"
                              onClick={() => handleCountrySelect(country)}
                              className="w-full px-[20px] py-[16px] text-left hover:bg-[#f5f9ff] transition-colors"
                            >
                              <span className="text-[16px] font-normal text-black">
                                {country.name}
                              </span>
                            </button>
                            {index < letterCountries.length - 1 && (
                              <div className="h-px bg-[#e8efff] mx-[20px]" />
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Alphabet Navigation */}
            {!searchQuery && (
              <div className="w-[20px] flex flex-col items-center py-[8px] border-l border-[#e8efff]">
                {alphabetLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleLetterClick(letter)}
                    className={`w-[12px] h-[12px] text-[8px] font-medium transition-colors ${
                      currentSection === letter 
                        ? 'text-[#1c5dff]' 
                        : 'text-[#96a3c2] hover:text-[#1c5dff]'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
