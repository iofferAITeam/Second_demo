'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/recommendation-case.css'
import {
  UserProfile,
  OfferResults,
  BackgroundTags,
  PersonalTags,
  CaseAnalysis,
  SchoolSelectionPlan,
  SchoolCard
} from '@/components/recommendation/recommendation-case'

// Mock data for demonstration
const mockData = {
  user: {
    name: 'Nickyouth',
    avatar: '' // Use fallback avatar instead
  },
  offers: [
    'California College of the Arts – MA Interaction Text Text TextTextText Design',
    'California College of the Arts – MA Interaction Text Text TextTextText Design TextTextTextTextTextText',
    'University name – Major name'
  ],
  background: {
    gpa: '3.80',
    ielts: '6.5',
    intendedMajor: 'Interaction Design',
    targetCountry: 'U.S'
  },
  personalTags: [
    'Unique Personal Profile tag',
    'Unique Personal Profile tag',
    'Unique Personal tag',
    'Unique Personal Profile tag',
    'Unique Personal tag'
  ],
  caseAnalysis: {
    title: 'Case Analysis:',
    content: 'Long sentence occupied Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.amet, consectet'
  },
  schoolPlan: {
    targetSchools: 3,
    fitSchools: 4,
    safetySchools: 3,
    description: 'Introduction content enhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strengthenhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strengthenhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strength'
  },
  university: {
    name: 'University name text text text text text text text text text text...',
    projectName: 'Project name text text text text text text text text text text text...',
    location: 'Cambridge, USA',
    duration: '15 months',
    tuition: 'Annual tuition $12,615',
    toeflScore: 'TOEFL 110',
    employmentRate: 'High employment rate',
    admissionRate: 89,
    perfectFit: 4.8,
    tag: 'OFFER合格'
  }
}

export default function RecommendationCase() {
  const router = useRouter()
  const [currentCase, setCurrentCase] = useState(0)

  const handleClose = () => {
    router.back()
  }

  const handlePrevious = () => {
    // Handle navigation to previous case
    setCurrentCase(Math.max(0, currentCase - 1))
  }

  const handleNext = () => {
    // Handle navigation to next case
    setCurrentCase(currentCase + 1)
  }

  return (
    <div className="recommendation-case-page">
      <div className="recommendation-case-container">
        {/* Header */}
        <div className="recommendation-case-header">
          <h1 className="recommendation-case-title">Application Case</h1>
          <button
            onClick={handleClose}
            className="recommendation-case-close"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="recommendation-case-content">
          {/* Navigation Arrow - Left */}
          <button
            onClick={handlePrevious}
            className="recommendation-case-nav recommendation-case-nav-button"
            disabled={currentCase === 0}
          >
            <ChevronLeft size={24} className={currentCase === 0 ? 'text-gray-300' : 'text-gray-600'} />
          </button>

          {/* Main Content */}
          <div className="recommendation-case-main">
            {/* User Profile */}
            <UserProfile user={mockData.user} />

            {/* Offer Results */}
            <OfferResults offers={mockData.offers} />

            {/* Background Tags */}
            <BackgroundTags background={mockData.background} />

            {/* Personal Tags */}
            <PersonalTags tags={mockData.personalTags} />

            {/* Case Analysis */}
            <CaseAnalysis
              title={mockData.caseAnalysis.title}
              content={mockData.caseAnalysis.content}
            />

            {/* School Selection Plan */}
            <SchoolSelectionPlan
              plan={mockData.schoolPlan}
            />

            {/* University Card */}
            <SchoolCard university={mockData.university} />
          </div>

          {/* Navigation Arrow - Right */}
          <button
            onClick={handleNext}
            className="recommendation-case-nav recommendation-case-nav-button"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}