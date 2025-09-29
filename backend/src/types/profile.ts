// Backend Profile Types - Matches Frontend ProfileFormData Structure

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
  graduatedInstitution?: string
  graduationYear?: string
  majorSubjects?: string[]
  majorSubjectsData?: any[]
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  languageTestsData?: any[]
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  standardizedTestsData?: any[]
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

// Database update structure
export interface UserUpdateData {
  name?: string
}

export interface ProfileUpdateData {
  // Basic Information
  phone?: string
  wechat?: string
  birthDate?: Date
  nationality?: string
  visaRequired?: boolean
  mbti?: string
  extracurricular?: string
  personalStrengths?: string
  hobbies?: string
  
  // Academic Performance
  currentEducation?: string
  gpa?: number
  lastTwoYearsGpa?: number
  major?: string
  graduationDate?: Date
  undergraduateUniversity?: string
  universityRank?: number
  universityType?: string
  highSchoolName?: string
  graduationYear?: string
  majorSubjects?: any
  majorSubjectsData?: any
  researchExperience?: string
  publications?: string
  
  // Test Scores
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  satScore?: number
  actScore?: number
  
  // Language and Standardized Tests
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  languageTestsData?: any
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  standardizedTestsData?: any
  
  // Application Intentions
  targetDegreeType?: string
  targetMajors?: any
  targetCountries?: any
  applicationYear?: string
  applicationTerm?: string
  intendedDegree?: string
  intendedIntakeTerm?: string
  intendedMajor?: string
  intendedCountries?: any
  intendedBudgets?: string
  scholarshipRequirements?: string
  otherPreference?: string
  internshipExperience?: string
  volunteerExperience?: string
  goals?: string
  careerGoals?: string
  personalStatement?: string
  budgetRange?: string
  scholarshipNeeds?: boolean
  preferredCityType?: string
  climatePreference?: string
  campusSize?: string
}

// Response types
export interface ProfileResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: Date
    language: string
    notifications: boolean
    theme: string
  }
  profile: {
    id: string
    userId: string
    phone?: string
    wechat?: string
    birthDate?: Date
    nationality?: string
    currentEducation?: string
    gpa?: number
    major?: string
    graduationDate?: Date
    toefl?: number
    ielts?: number
    gre?: number
    gmat?: number
    goals?: string
    createdAt: Date
    updatedAt: Date
  }
}

// Structured response for frontend form preloading
export interface StructuredProfileResponse {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: Date
    language: string
    notifications: boolean
    theme: string
  }
  profileData: ProfileFormData
}
