'use client'

import { Crown } from 'lucide-react'

interface OfferResultsProps {
  offers: string[]
}

export default function OfferResults({ offers }: OfferResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500 text-sm">Offer results</span>
      </div>

      <div className="space-y-3">
        {offers.map((offer, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Crown size={16} className="text-blue-500" fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 leading-relaxed">{offer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}