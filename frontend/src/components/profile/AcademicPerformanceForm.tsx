'use client'

import React, { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { AcademicPerformanceData, MajorSubjectData, LanguageTestData, StandardizedTestData, FormSectionProps } from '@/types/profile-form'

interface AcademicPerformanceFormProps extends FormSectionProps {
  data: AcademicPerformanceData
  errors?: Partial<Record<keyof AcademicPerformanceData, string>>
}


export default function AcademicPerformanceForm({ data, errors, onChange }: AcademicPerformanceFormProps) {
  const handleInputChange = (field: keyof AcademicPerformanceData, value: any) => {
    onChange(field, value)
  }

  // Initialize arrays when there's no existing data
  useEffect(() => {
    // Initialize languageTestsData if not present
    if (!data.languageTestsData) {
      const defaultLanguageTest = [{
        testType: data.languageTestType || '',
        score: data.languageTestScore || '',
        date: data.languageTestDate || ''
      }]
      handleInputChange('languageTestsData', defaultLanguageTest)
    }

    // Initialize standardizedTestsData if not present
    if (!data.standardizedTestsData) {
      const defaultStandardizedTest = [{
        testType: data.standardizedTestType || '',
        score: data.standardizedTestScore || '',
        date: data.standardizedTestDate || ''
      }]
      handleInputChange('standardizedTestsData', defaultStandardizedTest)
    }

    // Initialize majorSubjectsData if not present
    if (!data.majorSubjectsData && data.majorSubjects) {
      const defaultMajorSubjects = (data.majorSubjects || []).map(subject => ({ subject, gpa: '', majorGpa: '' }))
      handleInputChange('majorSubjectsData', defaultMajorSubjects)
    }
  }, []) // Only run once on mount

  // Get major subjects data for UI (use majorSubjectsData if available, otherwise initialize from majorSubjects)
  const getMajorSubjectsData = (): MajorSubjectData[] => {
    if (data.majorSubjectsData) {
      return data.majorSubjectsData
    }
    // Initialize from existing majorSubjects (string array) for backward compatibility
    return (data.majorSubjects || []).map(subject => ({ subject, gpa: '', majorGpa: '' }))
  }

  const addMajorSubject = () => {
    const currentSubjects = getMajorSubjectsData()
    const newSubjects = [...currentSubjects, { subject: '', gpa: '', majorGpa: '' }]
    handleInputChange('majorSubjectsData', newSubjects)
    // Also update the backend-compatible format
    handleInputChange('majorSubjects', newSubjects.map(s => s.subject))
  }

  const removeMajorSubject = (index: number) => {
    const currentSubjects = getMajorSubjectsData()
    const newSubjects = currentSubjects.filter((_, i) => i !== index)
    handleInputChange('majorSubjectsData', newSubjects)
    // Also update the backend-compatible format
    handleInputChange('majorSubjects', newSubjects.map(s => s.subject))
  }

  const updateMajorSubject = (index: number, field: keyof MajorSubjectData, value: string) => {
    const currentSubjects = getMajorSubjectsData()
    const newSubjects = [...currentSubjects]
    newSubjects[index] = { ...newSubjects[index], [field]: value }
    handleInputChange('majorSubjectsData', newSubjects)
    // Also update the backend-compatible format when subject changes
    if (field === 'subject') {
      handleInputChange('majorSubjects', newSubjects.map(s => s.subject))
    }
  }

  // Language Tests functions
  const getLanguageTestsData = (): LanguageTestData[] => {
    if (data.languageTestsData && data.languageTestsData.length > 0) {
      return data.languageTestsData
    }
    // Return at least one empty record for new users
    return [{ testType: '', score: '', date: '' }]
  }

  const addLanguageTest = () => {
    const currentTests = getLanguageTestsData()
    const newTests = [...currentTests, { testType: '', score: '', date: '' }]
    handleInputChange('languageTestsData', newTests)
  }

  const removeLanguageTest = (index: number) => {
    const currentTests = getLanguageTestsData()
    const newTests = currentTests.filter((_, i) => i !== index)
    handleInputChange('languageTestsData', newTests)
  }

  const updateLanguageTest = (index: number, field: keyof LanguageTestData, value: string) => {
    const currentTests = getLanguageTestsData()
    const newTests = [...currentTests]
    newTests[index] = { ...newTests[index], [field]: value }
    handleInputChange('languageTestsData', newTests)
  }

  // Standardized Tests functions
  const getStandardizedTestsData = (): StandardizedTestData[] => {
    if (data.standardizedTestsData && data.standardizedTestsData.length > 0) {
      return data.standardizedTestsData
    }
    // Return at least one empty record for new users
    return [{ testType: '', score: '', date: '' }]
  }

  const addStandardizedTest = () => {
    const currentTests = getStandardizedTestsData()
    const newTests = [...currentTests, { testType: '', score: '', date: '' }]
    handleInputChange('standardizedTestsData', newTests)
  }

  const removeStandardizedTest = (index: number) => {
    const currentTests = getStandardizedTestsData()
    const newTests = currentTests.filter((_, i) => i !== index)
    handleInputChange('standardizedTestsData', newTests)
  }

  const updateStandardizedTest = (index: number, field: keyof StandardizedTestData, value: string) => {
    const currentTests = getStandardizedTestsData()
    const newTests = [...currentTests]
    newTests[index] = { ...newTests[index], [field]: value }
    handleInputChange('standardizedTestsData', newTests)
  }

  return (
    <div className="space-y-[32px]">
      {/* Section Header */}
      <div className="flex gap-[8px] items-center">
        <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
        <h3 className="text-[20px] font-bold text-black font-inter">EDUCATIONAL BACKGROUND</h3>
      </div>

      {/* Highest Degree Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Highest Degree</h4>
        <div className="flex gap-[16px]">
          <div className="w-[250px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.highestDegree ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.highestDegree || ''} onValueChange={(value: string) => handleInputChange('highestDegree', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Please Choose" />
            </SelectTrigger>
            <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
              <SelectItem value="high-school">High School Diploma</SelectItem>
              <SelectItem value="associate">Associate Degree</SelectItem>
              <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
              <SelectItem value="master">Master&apos;s Degree</SelectItem>
              <SelectItem value="phd">PhD/Doctorate</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
            </div>
          {errors?.highestDegree && (
            <p className="text-red-500 text-xs mt-1">{errors.highestDegree}</p>
          )}
          </div>
        </div>
        </div>

      {/* Graduated Institution Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Graduated Institution</h4>
        <div className="w-[400px]">
          <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
            errors?.graduatedInstitution ? 'border-red-500' : 'border-[#e8efff]'
          }`}>
            <input
              type="text"
              placeholder="Name of Institution"
              value={data.graduatedInstitution}
              onChange={(e) => handleInputChange('graduatedInstitution', e.target.value)}
              className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
            />
          </div>
          {errors?.graduatedInstitution && (
            <p className="text-red-500 text-xs mt-1">{errors.graduatedInstitution}</p>
          )}
        </div>
      </div>

      {/* Major & GPA Section */}
      <div className="space-y-[16px]">
        <div className="space-y-[24px]">
          {getMajorSubjectsData().map((majorSubject, index) => (
            <div key={index} className="space-y-[16px]">
              <div className="flex gap-[16px] items-start">
                <div className="flex-1">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Major Subject {index + 1}</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                    errors?.majorSubjects ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <input
                      type="text"
                      placeholder="Name of Major Subject"
                      value={majorSubject.subject || ''}
                      onChange={(e) => updateMajorSubject(index, 'subject', e.target.value)}
                      className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">GPA</h4>
                  <div className="flex gap-[16px] items-center">
                    <div className="w-[140px]">
                      <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                        errors?.gpa ? 'border-red-500' : 'border-[#e8efff]'
                      }`}>
                        <input
                          type="text"
                          placeholder="Overall GPA"
                          value={majorSubject.gpa || ''}
                          onChange={(e) => updateMajorSubject(index, 'gpa', e.target.value)}
                          className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                        />
                      </div>
                      {errors?.gpa && (
                        <p className="text-red-500 text-xs mt-1">{errors.gpa}</p>
                      )}
                    </div>
                    <div className="w-[140px]">
                      <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                        errors?.majorGpa ? 'border-red-500' : 'border-[#e8efff]'
                      }`}>
                        <input
                          type="text"
                          placeholder="Major GPA"
                          value={majorSubject.majorGpa || ''}
                          onChange={(e) => updateMajorSubject(index, 'majorGpa', e.target.value)}
                          className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                        />
                      </div>
                      {errors?.majorGpa && (
                        <p className="text-red-500 text-xs mt-1">{errors.majorGpa}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMajorSubject(index)}
                      className="text-red-500 hover:text-red-700 text-[14px] font-medium px-[12px] py-[8px] rounded-[6px] hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              type="button"
              onClick={addMajorSubject}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More Major Subject
            </button>
          </div>
        </div>
        {errors?.majorSubjects && (
          <p className="text-red-500 text-xs mt-1">{errors.majorSubjects}</p>
        )}
      </div>


      {/* Language Proficiency Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">LANGUAGE PROFICIENCY</h3>
        </div>
        
        <div className="space-y-[24px]">
          {getLanguageTestsData().map((languageTest, index) => (
            <div key={index} className="space-y-[16px]">
              <div className="flex gap-[16px] items-center">
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Language Test Type</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center ${
                    errors?.languageTestType ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <Select value={languageTest.testType || ''} onValueChange={(value: string) => updateLanguageTest(index, 'testType', value)}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                        <SelectValue placeholder="Choose types" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                        <SelectItem value="toefl">TOEFL</SelectItem>
                        <SelectItem value="ielts">IELTS</SelectItem>
                        <SelectItem value="duolingo">Duolingo English Test</SelectItem>
                        <SelectItem value="pte">PTE Academic</SelectItem>
                        <SelectItem value="cambridge">Cambridge English</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors?.languageTestType && (
                    <p className="text-red-500 text-xs mt-1">{errors?.languageTestType}</p>
                  )}
                </div>
                
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Test Scores</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                    errors?.languageTestScore ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <input
                      type="text"
                      placeholder="Highest Records"
                      value={languageTest.score || ''}
                      onChange={(e) => updateLanguageTest(index, 'score', e.target.value)}
                      className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                    />
                  </div>
                  {errors?.languageTestScore && (
                    <p className="text-red-500 text-xs mt-1">{errors?.languageTestScore}</p>
                  )}
                </div>
                
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Test Date</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                    errors?.languageTestDate ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <input
                      type="date"
                      placeholder="Choose Date"
                      value={languageTest.date || ''}
                      onChange={(e) => updateLanguageTest(index, 'date', e.target.value)}
                      className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                    />
                  </div>
                  {errors?.languageTestDate && (
                    <p className="text-red-500 text-xs mt-1">{errors?.languageTestDate}</p>
                  )}
                </div>
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeLanguageTest(index)}
                    className="text-red-500 hover:text-red-700 text-[14px] font-medium px-[12px] py-[8px] rounded-[6px] hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              type="button"
              onClick={addLanguageTest}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More Language Test
            </button>
          </div>
        </div>
      </div>

      {/* Standardized Tests Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">STANDARDIZED TESTS</h3>
        </div>
        
        <div className="space-y-[24px]">
          {getStandardizedTestsData().map((standardizedTest, index) => (
            <div key={index} className="space-y-[16px]">
              <div className="flex gap-[16px] items-center">
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Standardized Test Type</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center ${
                    errors?.standardizedTestType ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <Select value={standardizedTest.testType || ''} onValueChange={(value: string) => updateStandardizedTest(index, 'testType', value)}>
                      <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-black [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                        <SelectValue placeholder="Choose types" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                        <SelectItem value="sat">SAT</SelectItem>
                        <SelectItem value="act">ACT</SelectItem>
                        <SelectItem value="gre">GRE</SelectItem>
                        <SelectItem value="gmat">GMAT</SelectItem>
                        <SelectItem value="lsat">LSAT</SelectItem>
                        <SelectItem value="mcat">MCAT</SelectItem>
                        <SelectItem value="ap">AP Exams</SelectItem>
                        <SelectItem value="ib">IB Exams</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors?.standardizedTestType && (
                    <p className="text-red-500 text-xs mt-1">{errors?.standardizedTestType}</p>
                  )}
                </div>
                
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Test Scores</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                    errors?.standardizedTestScore ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <input
                      type="text"
                      placeholder="Highest Records"
                      value={standardizedTest.score || ''}
                      onChange={(e) => updateStandardizedTest(index, 'score', e.target.value)}
                      className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                    />
                  </div>
                  {errors?.standardizedTestScore && (
                    <p className="text-red-500 text-xs mt-1">{errors?.standardizedTestScore}</p>
                  )}
                </div>
                
                <div className="w-[250px]">
                  <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Test Date</h4>
                  <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                    errors?.standardizedTestDate ? 'border-red-500' : 'border-[#e8efff]'
                  }`}>
                    <input
                      type="date"
                      placeholder="Choose Date"
                      value={standardizedTest.date || ''}
                      onChange={(e) => updateStandardizedTest(index, 'date', e.target.value)}
                      className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                    />
                  </div>
                  {errors?.standardizedTestDate && (
                    <p className="text-red-500 text-xs mt-1">{errors?.standardizedTestDate}</p>
                  )}
                </div>
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeStandardizedTest(index)}
                    className="text-red-500 hover:text-red-700 text-[14px] font-medium px-[12px] py-[8px] rounded-[6px] hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              type="button"
              onClick={addStandardizedTest}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More Standardized Test
            </button>
          </div>
        </div>
      </div>

      {/* Research Experience Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">RESEARCH EXPERIENCE</h3>
        </div>
        
        <div className="space-y-[16px]">
          <div className="space-y-[16px]">
            <h4 className="text-[16px] font-semibold text-black font-inter">Research Experience</h4>
            <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] ${
              errors?.researchExperience ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <textarea
                placeholder="Related Experience"
                value={data.researchExperience || ''}
                onChange={(e) => handleInputChange('researchExperience', e.target.value)}
                maxLength={200}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
                rows={4}
              />
              <div className="text-right text-[14px] text-[#cdd4e4] font-inter mt-2">
                {(data.researchExperience || '').length}/200
              </div>
            </div>
            {errors?.researchExperience && (
              <p className="text-red-500 text-xs mt-1">{errors?.researchExperience}</p>
            )}
          </div>
          
          <div className="space-y-[16px]">
            <h4 className="text-[16px] font-semibold text-black font-inter">Publications</h4>
            <div className={`bg-white border rounded-[16px] px-[20px] py-[16px] ${
              errors?.publications ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <textarea
                placeholder="Publications"
                value={data.publications || ''}
                onChange={(e) => handleInputChange('publications', e.target.value)}
                maxLength={200}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
                rows={4}
              />
              <div className="text-right text-[14px] text-[#cdd4e4] font-inter mt-2">
                {(data.publications || '').length}/200
              </div>
            </div>
            {errors?.publications && (
              <p className="text-red-500 text-xs mt-1">{errors?.publications}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
