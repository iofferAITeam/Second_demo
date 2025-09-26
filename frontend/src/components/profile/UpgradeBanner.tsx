'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Shell } from 'lucide-react'

interface UpgradeBannerProps {
  onUpgradeClick: () => void
}

export default function UpgradeBanner({ onUpgradeClick }: UpgradeBannerProps) {
  const features = [
    'Unlimited AI Conversations',
    'Personalized School Fit Analysis',
    'Admission Rate Predictions',
    'In-Depth Strategy Guidance to Enhance Competitiveness'
  ]

  return (
    <Card className="w-full shadow-[0px_0px_100px_0px_rgba(28,93,255,0.16)] border-0 bg-[#1c5dff] rounded-[20px] overflow-hidden">
      <CardContent className="p-5 py-[20px]">
        <div className="flex items-center justify-between gap-8">
          {/* Left Side - Text Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <Shell className="w-6 h-6 text-white" />
              <h2 className="text-[20px] font-semibold text-white font-['Inter']">
                Upgrade to Pro-AI
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[16px] text-white font-['Inter'] leading-[1.5]">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Upgrade Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={onUpgradeClick}
              className="bg-white text-[#1c5dff] text-[16px] font-medium font-['Inter'] rounded-[1000px] px-9 py-3 h-auto hover:bg-gray-100 tracking-[0.32px]"
            >
              UPGRADE NOW
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
