// Profile Form Data Types - Backend Ready
export interface BasicInfoData {
  firstName: string
  middleName?: string
  lastName: string
  phone: string
  email: string
  nationality: string
  visaRequired: boolean
  mbti?: string
  extracurricular?: string
  personalStrengths?: string
  hobbies?: string
}

export interface AcademicPerformanceData {
  gpa?: string
  majorGpa?: string
  satScore?: string
  actScore?: string
  toeflScore?: string
  ieltsScore?: string
  greScore?: string
  gmatScore?: string
  highestDegree?: string
  highSchoolName?: string
  universityName?: string
  graduationYear?: string
  majorSubjects?: string[]
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  researchExperience?: string
  publications?: string
}

export interface ApplicationIntentionsData {
  intendedDegree: string
  intendedIntakeTerm: string
  intendedMajor: string
  intendedCountries: string[]
  intendedBudgets: string
  scholarshipRequirements: string
  otherFinancialAidsRequired: boolean
  otherPreference: string
  careerIntentions: string
  internshipExperience: string
  volunteerExperience: string
}

export interface ProfileFormData {
  basicInfo: BasicInfoData
  academicPerformance: AcademicPerformanceData
  applicationIntentions: ApplicationIntentionsData
}

// Form Validation Types
export interface FormErrors {
  basicInfo?: Partial<Record<keyof BasicInfoData, string>>
  academicPerformance?: Partial<Record<keyof AcademicPerformanceData, string>>
  applicationIntentions?: Partial<Record<keyof ApplicationIntentionsData, string>>
}

// Component Props Types
export interface ProfileFormProps {
  data: ProfileFormData
  errors?: FormErrors
  onChange: (section: keyof ProfileFormData, field: string, value: string | boolean) => void
  onSave: (data: ProfileFormData) => void
  isLoading?: boolean
}

export interface TabComponentProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export interface FormSectionProps {
  data: any
  errors?: any
  onChange: (field: string, value: string | boolean | string[]) => void
}
