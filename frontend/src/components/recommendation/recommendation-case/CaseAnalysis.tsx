'use client'

import { GraduationCap } from 'lucide-react'

interface CaseAnalysisProps {
  title: string
  content: string
}

export default function CaseAnalysis({ title, content }: CaseAnalysisProps) {
  return (
    <div className="py-8">
      <div className="flex gap-6">
        {/* Illustration */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
            <div className="relative">
              {/* Graduation cap icon with decorative elements */}
              <GraduationCap size={48} className="text-blue-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-60"></div>
              <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-blue-300 rounded-full opacity-40"></div>
              <div className="absolute top-6 -right-4 w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  )
}