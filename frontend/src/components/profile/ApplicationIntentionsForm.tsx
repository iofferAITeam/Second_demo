'use client'

import React from 'react'
import { ApplicationIntentionsData, FormSectionProps } from '@/types/profile-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CustomDropdown from '@/components/ui/custom-dropdown'
import { Plus } from 'lucide-react'

interface ApplicationIntentionsFormProps extends FormSectionProps {
  data: ApplicationIntentionsData
  errors?: Partial<Record<keyof ApplicationIntentionsData, string>>
}

export default function ApplicationIntentionsForm({ data, errors, onChange }: ApplicationIntentionsFormProps) {
  const handleInputChange = (field: keyof ApplicationIntentionsData, value: string | boolean | string[]) => {
    onChange(field, value)
  }

  const addIntendedCountry = () => {
    const currentCountries = data.intendedCountries || []
    handleInputChange('intendedCountries', [...currentCountries, ''])
  }

  const removeIntendedCountry = (index: number) => {
    const currentCountries = data.intendedCountries || []
    const newCountries = currentCountries.filter((_, i) => i !== index)
    handleInputChange('intendedCountries', newCountries)
  }

  const updateIntendedCountry = (index: number, value: string) => {
    const currentCountries = data.intendedCountries || []
    const newCountries = [...currentCountries]
    newCountries[index] = value
    handleInputChange('intendedCountries', newCountries)
  }

  return (
    <div className="space-y-[32px]">
      {/* Section Header */}
      <div className="flex gap-[8px] items-center">
        <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
        <h3 className="text-[20px] font-bold text-black font-inter">APPLICATION INTENTIONS</h3>
      </div>

      {/* Intended Degree and Intake Term Row */}
      <div className="flex gap-[16px]">
        <div className="w-[608px] space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Intended Degree</h4>
          <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center ${
            errors?.intendedDegree ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <Select value={data.intendedDegree || ''} onValueChange={(value: string) => handleInputChange('intendedDegree', value)}>
              <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                <SelectValue placeholder="Please Choose" />
              </SelectTrigger>
              <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                <SelectItem value="master">Master&apos;s Degree</SelectItem>
                <SelectItem value="phd">PhD/Doctorate</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors?.intendedDegree && (
            <p className="text-red-500 text-xs mt-1">{errors.intendedDegree}</p>
          )}
        </div>

        <div className="space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Intended Intake Term</h4>
          <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center w-[298px] ${
            errors?.intendedIntakeTerm ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <Select value={data.intendedIntakeTerm || ''} onValueChange={(value: string) => handleInputChange('intendedIntakeTerm', value)}>
              <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                <SelectValue placeholder="Please Choose" />
              </SelectTrigger>
              <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                <SelectItem value="fall-2024">Fall 2024</SelectItem>
                <SelectItem value="spring-2025">Spring 2025</SelectItem>
                <SelectItem value="summer-2025">Summer 2025</SelectItem>
                <SelectItem value="fall-2025">Fall 2025</SelectItem>
                <SelectItem value="spring-2026">Spring 2026</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors?.intendedIntakeTerm && (
            <p className="text-red-500 text-xs mt-1">{errors.intendedIntakeTerm}</p>
          )}
        </div>
      </div>

      {/* Intended Major Section */}
      <div className="space-y-[20px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Intended Major</h4>
        <div className="flex gap-[16px] items-center">
          <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center w-[608px] ${
            errors?.intendedMajor ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <Select value={data.intendedMajor || ''} onValueChange={(value: string) => handleInputChange('intendedMajor', value)}>
              <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                <SelectValue placeholder="Please Choose" />
              </SelectTrigger>
              <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="business">Business Administration</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="law">Law</SelectItem>
                <SelectItem value="arts">Arts & Humanities</SelectItem>
                <SelectItem value="science">Natural Sciences</SelectItem>
                <SelectItem value="social-science">Social Sciences</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {errors?.intendedMajor && (
          <p className="text-red-500 text-xs mt-1">{errors.intendedMajor}</p>
        )}
      </div>

      {/* Intended Countries Section */}
      <div className="space-y-[20px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Intended Countries</h4>
        <div className="space-y-[12px]">
          {(data.intendedCountries || []).map((country, index) => (
            <div key={index} className="flex gap-[8px] items-center">
              <div className="w-[298px]">
                <CustomDropdown
                  value={country}
                  onChange={(value: string) => updateIntendedCountry(index, value)}
                  placeholder="Please Choose"
                  error={!!errors?.intendedCountries}
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeIntendedCountry(index)}
                  className="text-red-500 hover:text-red-700 text-[14px] font-medium px-[12px] py-[8px] rounded-[6px] hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              type="button"
              onClick={addIntendedCountry}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More
            </button>
          </div>
        </div>
        {errors?.intendedCountries && (
          <p className="text-red-500 text-xs mt-1">{errors.intendedCountries}</p>
        )}
      </div>

      {/* Intended Budgets and Scholarship Section */}
      <div className="flex gap-[16px]">
        <div className="space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Intended Budgets</h4>
          <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center w-[298px] ${
            errors?.intendedBudgets ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <div className="flex gap-[4px] items-center">
              <span className="text-[16px] text-black font-normal">$</span>
              <div className="w-4 h-4">
                <svg viewBox="0 0 16 16" className="w-full h-full">
                  <path d="M4 6l4 4 4-4" stroke="#000" strokeWidth="1" fill="none" />
                </svg>
              </div>
            </div>
            <input
              type="text"
              placeholder="Budgets"
              value={data.intendedBudgets || ''}
              onChange={(e) => handleInputChange('intendedBudgets', e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none ml-2"
            />
          </div>
          {errors?.intendedBudgets && (
            <p className="text-red-500 text-xs mt-1">{errors.intendedBudgets}</p>
          )}
        </div>

        <div className="flex-1 space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Scholarship / Financial Aids</h4>
          <div className="flex gap-[16px] items-center">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center w-[298px] ${
              errors?.scholarshipRequirements ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.scholarshipRequirements || ''} onValueChange={(value: string) => handleInputChange('scholarshipRequirements', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Scholarship Requirements" />
                </SelectTrigger>
                <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                  <SelectItem value="merit-based">Merit-based</SelectItem>
                  <SelectItem value="need-based">Need-based</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="academic">Academic Excellence</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-[8px] items-center">
              <input
                type="checkbox"
                checked={data.otherFinancialAidsRequired || false}
                onChange={(e) => handleInputChange('otherFinancialAidsRequired', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-[16px] text-black font-normal font-inter">Other Financial Aids is Required</span>
            </div>
          </div>
          {errors?.scholarshipRequirements && (
            <p className="text-red-500 text-xs mt-1">{errors.scholarshipRequirements}</p>
          )}
        </div>
      </div>

      {/* Other Preference Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Other Preference</h4>
        <div className="space-y-[12px]">
          <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] flex items-center justify-between ${
            errors?.otherPreference ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <input
              type="text"
              placeholder="Other Preference"
              value={data.otherPreference || ''}
              onChange={(e) => handleInputChange('otherPreference', e.target.value)}
              maxLength={50}
              className="flex-1 bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
            />
            <div className="text-[14px] text-[#cdd4e4] font-normal">
              {(data.otherPreference || '').length}/50
            </div>
          </div>
          {errors?.otherPreference && (
            <p className="text-red-500 text-xs mt-1">{errors.otherPreference}</p>
          )}
        </div>
      </div>

      {/* Career Goals Section */}
      <div className="space-y-[32px]">
        {/* Section Header */}
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">CAREER GOALS</h3>
        </div>

        {/* Career Intentions / Development Goals Section */}
        <div className="space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Career Intentions / Development Goals</h4>
          <div className="space-y-[12px]">
            <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] flex items-center justify-between ${
              errors?.careerIntentions ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="text"
                placeholder="Career Intentions / Development Goals"
                value={data.careerIntentions || ''}
                onChange={(e) => handleInputChange('careerIntentions', e.target.value)}
                maxLength={50}
                className="flex-1 bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
              <div className="text-[14px] text-[#cdd4e4] font-normal">
                {(data.careerIntentions || '').length}/50
              </div>
            </div>
            {errors?.careerIntentions && (
              <p className="text-red-500 text-xs mt-1">{errors.careerIntentions}</p>
            )}
          </div>
        </div>

        {/* Internship Experience Section */}
        <div className="space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Internship Experience</h4>
          <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] ${
            errors?.internshipExperience ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <textarea
              placeholder="Related Experience"
              value={data.internshipExperience || ''}
              onChange={(e) => handleInputChange('internshipExperience', e.target.value)}
              maxLength={200}
              className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
              rows={4}
            />
            <div className="text-right text-[14px] text-[#cdd4e4] font-inter mt-2">
              {(data.internshipExperience || '').length}/200
            </div>
          </div>
          {errors?.internshipExperience && (
            <p className="text-red-500 text-xs mt-1">{errors.internshipExperience}</p>
          )}
        </div>

        {/* Volunteer Experience Section */}
        <div className="space-y-[16px]">
          <h4 className="text-[16px] font-semibold text-black font-inter">Volunteer Experience</h4>
          <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] ${
            errors?.volunteerExperience ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <textarea
              placeholder="Related Experience"
              value={data.volunteerExperience || ''}
              onChange={(e) => handleInputChange('volunteerExperience', e.target.value)}
              maxLength={200}
              className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
              rows={4}
            />
            <div className="text-right text-[14px] text-[#cdd4e4] font-inter mt-2">
              {(data.volunteerExperience || '').length}/200
            </div>
          </div>
          {errors?.volunteerExperience && (
            <p className="text-red-500 text-xs mt-1">{errors.volunteerExperience}</p>
          )}
        </div>
      </div>
    </div>
  )
}
