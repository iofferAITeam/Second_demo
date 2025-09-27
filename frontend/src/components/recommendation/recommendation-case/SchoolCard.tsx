'use client'

import { MapPin, Clock, DollarSign, FileText, TrendingUp, Share2 } from 'lucide-react'

interface SchoolCardProps {
  university: {
    name: string
    projectName: string
    location: string
    duration: string
    tuition: string
    toeflScore: string
    employmentRate: string
    admissionRate: number
    perfectFit: number
    tag: string
  }
}

export default function SchoolCard({ university }: SchoolCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* University Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚠</span>
              </div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{university.name}</h3>
            </div>
            <p className="text-gray-600 text-sm line-clamp-1 mb-4">{university.projectName}</p>

            {/* University Details */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">{university.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-600">{university.toeflScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-gray-600">{university.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gray-400" />
                <span className="text-blue-600 font-medium">{university.employmentRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-gray-400" />
                <span className="text-gray-600">{university.tuition}</span>
              </div>
            </div>
          </div>

          {/* Tag */}
          <div className="ml-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {university.tag}
            </span>
          </div>
        </div>

        {/* Share Button */}
        <div className="mb-4">
          <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700">
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-end">
          {/* Admission Rate */}
          <div className="text-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center bg-white/20">
                <span className="text-2xl font-bold">{university.admissionRate}%</span>
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium">Admission Rate</p>
          </div>

          {/* Perfect Fit */}
          <div className="text-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 border-4 border-white/30 rounded-full flex items-center justify-center bg-white/20">
                <span className="text-2xl font-bold">{university.perfectFit}</span>
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium">Perfect Fit</p>
          </div>
        </div>
      </div>
    </div>
  )
}