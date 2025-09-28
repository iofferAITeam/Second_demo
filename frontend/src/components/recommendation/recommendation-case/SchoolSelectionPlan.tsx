'use client'

import { Target } from 'lucide-react'

interface SchoolSelectionPlanProps {
  plan: {
    targetSchools: number
    fitSchools: number
    safetySchools: number
    description: string
  }
}

export default function SchoolSelectionPlan({ plan }: SchoolSelectionPlanProps) {
  return (
    <div className="py-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Her School Selection Plan</h3>

      {/* Statistics */}
      <div className="flex gap-4 mb-8">
        <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium">
          Target Schools: {plan.targetSchools}
        </div>
        <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full text-sm font-medium">
          Fit Schools: {plan.fitSchools}
        </div>
        <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full text-sm font-medium">
          Safety Schools: {plan.safetySchools}
        </div>
      </div>

      {/* Target Schools Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <Target size={16} className="text-pink-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">{plan.targetSchools} Target Schools</h4>
        </div>
        <p className="text-gray-700 leading-relaxed ml-11">
          {plan.description}
        </p>
      </div>
    </div>
  )
}