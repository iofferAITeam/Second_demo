'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BasicInfoData, FormSectionProps } from '@/types/profile-form'

interface BasicInfoFormProps extends FormSectionProps {
  data: BasicInfoData
  errors?: Partial<Record<keyof BasicInfoData, string>>
}

export default function BasicInfoForm({ data, errors, onChange }: BasicInfoFormProps) {
  const handleInputChange = (field: keyof BasicInfoData, value: string) => {
    onChange(field, value)
  }

  const handleCheckboxChange = (field: keyof BasicInfoData, checked: boolean) => {
    onChange(field, checked)
  }

  return (
    <div className="space-y-[32px]">
      {/* Section Header */}
      <div className="flex gap-[8px] items-center">
        <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
        <h3 className="text-[20px] font-bold text-black font-inter">BASIC INFORMATION</h3>
      </div>

      {/* Name Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Name</h4>
        <div className="flex gap-[16px]">
          <div className="w-[200px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.firstName ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="text"
                placeholder="First Name"
                value={data.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="w-[200px]">
            <div className="bg-white border border-[#e8efff] rounded-[30px] px-[20px] py-[16px]">
              <input
                type="text"
                placeholder="Middle Name（if has）"
                value={data.middleName || ''}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
          </div>
          <div className="w-[200px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.lastName ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="text"
                placeholder="Last Name"
                value={data.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Contact Details</h4>
        <div className="flex gap-[16px]">
          <div className="w-[250px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.phone ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="tel"
                placeholder="Phone Number"
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div className="w-[300px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.email ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="email"
                placeholder="Email Address"
                value={data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nationality Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Nationality</h4>
        <div className="flex gap-[16px] items-center">
          <div className="w-[250px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.nationality ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.nationality} onValueChange={(value: string) => handleInputChange('nationality', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Choose Nationality" />
                </SelectTrigger>
                <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                  <SelectItem value="kr">South Korea</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                  <SelectItem value="in">India</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors?.nationality && (
              <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
            )}
          </div>
          <div className="flex gap-[8px] items-center">
            <input
              type="checkbox"
              checked={data.visaRequired}
              onChange={(e) => handleCheckboxChange('visaRequired', e.target.checked)}
              className="w-4 h-4 border border-[#d2dfff] rounded-[4px] accent-[#1c5dff]"
            />
            <span className="text-[16px] text-black font-inter">Whether a Visa is Required</span>
          </div>
        </div>
      </div>

      {/* Personality & Interests Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h4 className="text-[20px] font-bold text-black font-inter">PERSONALITY & INTERESTS</h4>
        </div>
        
        {/* MBTI Dropdown */}
        <div className="space-y-[8px]">
          <label className="text-[14px] font-medium text-black font-inter">MBTI</label>
          <div className="w-[250px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.mbti ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.mbti || ''} onValueChange={(value: string) => handleInputChange('mbti', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Select MBTI Type" />
                </SelectTrigger>
                <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                  <SelectItem value="INTJ">INTJ - Architect</SelectItem>
                  <SelectItem value="INTP">INTP - Thinker</SelectItem>
                  <SelectItem value="ENTJ">ENTJ - Commander</SelectItem>
                  <SelectItem value="ENTP">ENTP - Debater</SelectItem>
                  <SelectItem value="INFJ">INFJ - Advocate</SelectItem>
                  <SelectItem value="INFP">INFP - Mediator</SelectItem>
                  <SelectItem value="ENFJ">ENFJ - Protagonist</SelectItem>
                  <SelectItem value="ENFP">ENFP - Campaigner</SelectItem>
                  <SelectItem value="ISTJ">ISTJ - Logistician</SelectItem>
                  <SelectItem value="ISFJ">ISFJ - Protector</SelectItem>
                  <SelectItem value="ESTJ">ESTJ - Executive</SelectItem>
                  <SelectItem value="ESFJ">ESFJ - Consul</SelectItem>
                  <SelectItem value="ISTP">ISTP - Virtuoso</SelectItem>
                  <SelectItem value="ISFP">ISFP - Adventurer</SelectItem>
                  <SelectItem value="ESTP">ESTP - Entrepreneur</SelectItem>
                  <SelectItem value="ESFP">ESFP - Entertainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors?.mbti && (
              <p className="text-red-500 text-xs mt-1">{errors.mbti}</p>
            )}
          </div>
        </div>

        {/* Extracurricular Activities */}
        <div className="space-y-[8px]">
          <label className="text-[14px] font-medium text-black font-inter">Extracurricular Activities</label>
          <div className="w-[400px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.extracurricular ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="text"
                placeholder="e.g., Student Council, Debate Team, Sports"
                value={data.extracurricular || ''}
                onChange={(e) => handleInputChange('extracurricular', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.extracurricular && (
              <p className="text-red-500 text-xs mt-1">{errors.extracurricular}</p>
            )}
          </div>
        </div>

        {/* Personal Strengths */}
        <div className="space-y-[8px]">
          <label className="text-[14px] font-medium text-black font-inter">Personal Strengths</label>
          <div className="w-[500px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.personalStrengths ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <textarea
                placeholder="Describe your key strengths and qualities"
                value={data.personalStrengths || ''}
                onChange={(e) => handleInputChange('personalStrengths', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
                rows={3}
              />
            </div>
            {errors?.personalStrengths && (
              <p className="text-red-500 text-xs mt-1">{errors.personalStrengths}</p>
            )}
          </div>
        </div>

        {/* Hobbies & Interests */}
        <div className="space-y-[8px]">
          <label className="text-[14px] font-medium text-black font-inter">Hobbies & Interests</label>
          <div className="w-[500px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.hobbies ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <textarea
                placeholder="Share your hobbies, interests, and activities you enjoy"
                value={data.hobbies || ''}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
                rows={3}
              />
            </div>
            {errors?.hobbies && (
              <p className="text-red-500 text-xs mt-1">{errors.hobbies}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}