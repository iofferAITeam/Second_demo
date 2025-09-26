'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { AcademicPerformanceData, FormSectionProps } from '@/types/profile-form'

interface AcademicPerformanceFormProps extends FormSectionProps {
  data: AcademicPerformanceData
  errors?: Partial<Record<keyof AcademicPerformanceData, string>>
}

interface GraduateSchool {
  id: string
  schoolName: string
  degreeType: string
  graduationYear: string
  gpa: string
}

interface Minor {
  id: string
  name: string
}

interface Course {
  id: string
  name: string
  grade: string
}

export default function AcademicPerformanceForm({ data, errors, onChange }: AcademicPerformanceFormProps) {
  const [graduateSchools, setGraduateSchools] = useState<GraduateSchool[]>([])
  const [minors, setMinors] = useState<Minor[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  const handleInputChange = (field: keyof AcademicPerformanceData, value: string | string[]) => {
    onChange(field, value)
  }

  const addGraduateSchool = () => {
    const newSchool: GraduateSchool = {
      id: Date.now().toString(),
      schoolName: '',
      degreeType: '',
      graduationYear: '',
      gpa: ''
    }
    setGraduateSchools([...graduateSchools, newSchool])
  }

  const removeGraduateSchool = (id: string) => {
    setGraduateSchools(graduateSchools.filter(school => school.id !== id))
  }

  const updateGraduateSchool = (id: string, field: keyof GraduateSchool, value: string) => {
    setGraduateSchools(graduateSchools.map(school => 
      school.id === id ? { ...school, [field]: value } : school
    ))
  }

  const addMinor = () => {
    const newMinor: Minor = {
      id: Date.now().toString(),
      name: ''
    }
    setMinors([...minors, newMinor])
  }

  const removeMinor = (id: string) => {
    setMinors(minors.filter(minor => minor.id !== id))
  }

  const updateMinor = (id: string, value: string) => {
    setMinors(minors.map(minor => 
      minor.id === id ? { ...minor, name: value } : minor
    ))
  }

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: '',
      grade: ''
    }
    setCourses([...courses, newCourse])
  }

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id))
  }

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ))
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
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Please Choose" />
            </SelectTrigger>
            <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
              <SelectItem value="high-school">High School Diploma</SelectItem>
              <SelectItem value="associate">Associate Degree</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
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
        <div className="flex gap-[16px]">
          <div className="w-[300px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.highSchoolName ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.highSchoolName || ''} onValueChange={(value: string) => handleInputChange('highSchoolName', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Name of High School" />
                </SelectTrigger>
                <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                  <SelectItem value="example-hs-1">Example High School 1</SelectItem>
                  <SelectItem value="example-hs-2">Example High School 2</SelectItem>
                  <SelectItem value="example-hs-3">Example High School 3</SelectItem>
                  <SelectItem value="other-hs">Other High School</SelectItem>
                </SelectContent>
              </Select>
            </div>
              {errors?.highSchoolName && (
                <p className="text-red-500 text-xs mt-1">{errors.highSchoolName}</p>
              )}
            </div>
          <div className="w-[300px]">
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.universityName ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.universityName || ''} onValueChange={(value: string) => handleInputChange('universityName', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
                  <SelectValue placeholder="Name of University" />
                </SelectTrigger>
                <SelectContent className="!bg-white !z-[9999] !border !border-[#e8efff] !rounded-[12px] !shadow-lg">
                  <SelectItem value="harvard">Harvard University</SelectItem>
                  <SelectItem value="stanford">Stanford University</SelectItem>
                  <SelectItem value="mit">MIT</SelectItem>
                  <SelectItem value="berkeley">UC Berkeley</SelectItem>
                  <SelectItem value="yale">Yale University</SelectItem>
                  <SelectItem value="princeton">Princeton University</SelectItem>
                  <SelectItem value="other-uni">Other University</SelectItem>
                </SelectContent>
              </Select>
            </div>
              {errors?.universityName && (
                <p className="text-red-500 text-xs mt-1">{errors.universityName}</p>
              )}
            </div>
          </div>
        <div className="flex gap-[8px] items-center">
          <Plus className="h-4 w-4 text-[#1c5dff]" />
          <button 
            onClick={addGraduateSchool}
            className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
          >
            Graduate School
          </button>
          </div>
        </div>

      {/* Major & GPA Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[16px]">
          <div className="w-[300px]">
            <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Major</h4>
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
              errors?.majorSubjects ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <input
                type="text"
                placeholder="Name of Major"
                value={data.majorSubjects?.join(', ') || ''}
                onChange={(e) => {
                  const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  handleInputChange('majorSubjects', subjects);
                }}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.majorSubjects && (
              <p className="text-red-500 text-xs mt-1">{errors.majorSubjects}</p>
            )}
          </div>
          <div className="w-[300px]">
            <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">GPA</h4>
            <div className="flex gap-[16px]">
              <div className="w-[140px]">
              <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] ${
                  errors?.gpa ? 'border-red-500' : 'border-[#e8efff]'
              }`}>
                <input
                  type="text"
                    placeholder="Overall GPA"
                    value={data.gpa || ''}
                    onChange={(e) => handleInputChange('gpa', e.target.value)}
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
                    value={data.majorGpa || ''}
                    onChange={(e) => handleInputChange('majorGpa', e.target.value)}
                    className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
                  />
                </div>
                {errors?.majorGpa && (
                  <p className="text-red-500 text-xs mt-1">{errors.majorGpa}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minor Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Minor</h4>
        <div className="flex gap-[16px] items-center">
          <div className="w-[300px]">
            <div className="bg-white border border-[#e8efff] rounded-[30px] px-[20px] py-[16px]">
              <input
                type="text"
                placeholder="Name of Minor"
                value={minors.map(m => m.name).join(', ') || ''}
                onChange={(e) => {
                  const minorNames = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  const newMinors = minorNames.map((name, index) => ({
                    id: minors[index]?.id || Date.now().toString() + index,
                    name
                  }));
                  setMinors(newMinors);
                }}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              onClick={addMinor}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More Minor
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="space-y-[16px]">
        <h4 className="text-[16px] font-semibold text-black font-inter">Transcript</h4>
        <div className="flex gap-[16px] items-center">
          <div className="w-[500px]">
            <div className="bg-white border border-[#e8efff] rounded-[30px] px-[20px] py-[16px]">
            <textarea
                placeholder="Name of the Course / Detailed Grades"
                value={courses.map(c => `${c.name}: ${c.grade}`).join(', ') || ''}
              onChange={(e) => {
                  const courseEntries = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  const newCourses = courseEntries.map((entry, index) => {
                    const [name, grade] = entry.split(':').map(s => s.trim());
                    return {
                      id: courses[index]?.id || Date.now().toString() + index,
                      name: name || '',
                      grade: grade || ''
                    };
                  });
                  setCourses(newCourses);
              }}
              className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none resize-none min-h-[80px]"
              rows={3}
            />
          </div>
          </div>
          <div className="flex gap-[8px] items-center">
            <Plus className="h-4 w-4 text-[#1c5dff]" />
            <button 
              onClick={addCourse}
              className="text-[#1c5dff] text-[16px] font-inter bg-transparent border-none cursor-pointer hover:underline"
            >
              Add More Courses
            </button>
          </div>
        </div>
      </div>

      {/* Language Proficiency Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">LANGUAGE PROFICIENCY</h3>
        </div>
        
        <div className="flex gap-[16px]">
          <div className="w-[250px]">
            <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Language Test Type</h4>
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center ${
              errors?.languageTestType ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.languageTestType || ''} onValueChange={(value: string) => handleInputChange('languageTestType', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
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
              <p className="text-red-500 text-xs mt-1">{errors.languageTestType}</p>
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
                value={data.languageTestScore || ''}
                onChange={(e) => handleInputChange('languageTestScore', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.languageTestScore && (
              <p className="text-red-500 text-xs mt-1">{errors.languageTestScore}</p>
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
                value={data.languageTestDate || ''}
                onChange={(e) => handleInputChange('languageTestDate', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.languageTestDate && (
              <p className="text-red-500 text-xs mt-1">{errors.languageTestDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Standardized Tests Section */}
      <div className="space-y-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="bg-[#1c5dff] h-[20px] w-[4px] rounded-[4px]" />
          <h3 className="text-[20px] font-bold text-black font-inter">STANDARDIZED TESTS</h3>
        </div>
        
        <div className="flex gap-[16px]">
          <div className="w-[250px]">
            <h4 className="text-[16px] font-semibold text-black font-inter mb-[16px]">Standardized Test Type</h4>
            <div className={`bg-white border rounded-[30px] px-[20px] py-[16px] h-[56px] flex items-center ${
              errors?.standardizedTestType ? 'border-red-500' : 'border-[#e8efff]'
            }`}>
              <Select value={data.standardizedTestType || ''} onValueChange={(value: string) => handleInputChange('standardizedTestType', value)}>
                <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 [&>span]:text-[#cdd4e4] [&>span[data-placeholder]]:text-[#cdd4e4] flex items-center justify-between w-full">
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
              <p className="text-red-500 text-xs mt-1">{errors.standardizedTestType}</p>
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
                value={data.standardizedTestScore || ''}
                onChange={(e) => handleInputChange('standardizedTestScore', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.standardizedTestScore && (
              <p className="text-red-500 text-xs mt-1">{errors.standardizedTestScore}</p>
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
                value={data.standardizedTestDate || ''}
                onChange={(e) => handleInputChange('standardizedTestDate', e.target.value)}
                className="w-full bg-transparent text-[14px] text-black font-light font-inter placeholder-[#cdd4e4] outline-none"
              />
            </div>
            {errors?.standardizedTestDate && (
              <p className="text-red-500 text-xs mt-1">{errors.standardizedTestDate}</p>
            )}
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
              <p className="text-red-500 text-xs mt-1">{errors.researchExperience}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.publications}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
