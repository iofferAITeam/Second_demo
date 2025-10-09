import { ProfileFormData, UserUpdateData, ProfileUpdateData } from '../types/profile'

// Type definitions for the data we're working with
interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  language: string
  notifications: boolean
  theme: string
}

interface UserProfile {
  id: string
  userId: string
  phone?: string | null
  nationality?: string | null
  visaRequired?: boolean | null
  mbti?: string | null
  extracurricular?: string | null
  personalStrengths?: string | null
  hobbies?: string | null
  currentEducation?: string | null
  gpa?: number | null
  majorGpa?: number | null
  major?: string | null
  researchExperience?: string | null
  publications?: string | null
  languageTestsData?: any | null
  standardizedTestsData?: any | null
  intendedDegree?: string | null
  intendedIntakeTerm?: string | null
  intendedMajor?: string | null
  intendedCountries?: any | null
  intendedBudgets?: string | null
  scholarshipRequirements?: string | null
  otherPreference?: string | null
  internshipExperience?: string | null
  volunteerExperience?: string | null
  careerGoals?: string | null
  scholarshipNeeds?: boolean | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Transform frontend ProfileFormData to database update format
 */
export function transformFormDataToDatabase(formData: ProfileFormData): {
  userUpdates: UserUpdateData
  profileUpdates: ProfileUpdateData
} {
  const { basicInfo, academicPerformance, applicationIntentions } = formData

  // Transform user basic info
  const userUpdates: UserUpdateData = {
    name: `${basicInfo.firstName} ${basicInfo.lastName}`.trim()
  }

  // Transform profile data - now includes all fields that exist in the updated Prisma schema
  const profileUpdates: ProfileUpdateData = {
    // Basic Information
    phone: basicInfo.phone || undefined,
    nationality: basicInfo.nationality || undefined,
    visaRequired: basicInfo.visaRequired,
    mbti: basicInfo.mbti || undefined,
    extracurricular: basicInfo.extracurricular || undefined,
    personalStrengths: basicInfo.personalStrengths || undefined,
    hobbies: basicInfo.hobbies || undefined,
    
    // Academic Performance
    currentEducation: academicPerformance.highestDegree || undefined,
    gpa: academicPerformance.gpa ? parseFloat(academicPerformance.gpa) : undefined,
    majorGpa: academicPerformance.majorGpa ? parseFloat(academicPerformance.majorGpa) : undefined,
    major: academicPerformance.major || undefined,
    graduationDate: academicPerformance.graduationYear ? new Date(academicPerformance.graduationYear) : undefined,
    undergraduateUniversity: academicPerformance.graduatedInstitution || undefined,
    graduationYear: academicPerformance.graduationYear || undefined,
    researchExperience: academicPerformance.researchExperience || undefined,
    publications: academicPerformance.publications || undefined,
    
    // Language and Standardized Tests (arrays of test records)
    languageTestsData: academicPerformance.languageTestsData || undefined,
    standardizedTestsData: academicPerformance.standardizedTestsData || undefined,
    
    // Application Intentions
    scholarshipNeeds: applicationIntentions.otherFinancialAidsRequired,
    careerGoals: applicationIntentions.careerIntentions || undefined,
    
    // Additional fields for direct mapping
    intendedDegree: applicationIntentions.intendedDegree || undefined,
    intendedIntakeTerm: applicationIntentions.intendedIntakeTerm || undefined,
    intendedMajor: applicationIntentions.intendedMajor || undefined,
    intendedCountries: applicationIntentions.intendedCountries || undefined,
    intendedBudgets: applicationIntentions.intendedBudgets || undefined,
    scholarshipRequirements: applicationIntentions.scholarshipRequirements || undefined,
    otherPreference: applicationIntentions.otherPreference || undefined,
    internshipExperience: applicationIntentions.internshipExperience || undefined,
    volunteerExperience: applicationIntentions.volunteerExperience || undefined
  }

  return { userUpdates, profileUpdates }
}

/**
 * Transform database data to frontend ProfileFormData format
 */
export function transformDatabaseToFormData(user: User, profile: UserProfile | null): ProfileFormData {
  // Parse name correctly for different name formats
  const nameParts = user.name?.split(' ').filter(Boolean) || []
  let firstName = ''
  let middleName = ''
  let lastName = ''

  if (nameParts.length === 1) {
    firstName = nameParts[0]
  } else if (nameParts.length === 2) {
    firstName = nameParts[0]
    lastName = nameParts[1]
  } else if (nameParts.length >= 3) {
    firstName = nameParts[0]
    middleName = nameParts[1]
    lastName = nameParts.slice(2).join(' ')
  }

  if (!profile) {
    // Return empty form data for new users
    return {
      basicInfo: {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        phone: '',
        email: user.email,
        nationality: '',
        visaRequired: false
      },
      academicPerformance: {
        gpa: '',
        majorGpa: '',
        major: '',
        languageTestsData: [],
        standardizedTestsData: [],
        graduationYear: ''
      },
      applicationIntentions: {
        intendedDegree: '',
        intendedIntakeTerm: '',
        intendedMajor: '',
        intendedCountries: [],
        intendedBudgets: '',
        scholarshipRequirements: '',
        otherFinancialAidsRequired: false,
        otherPreference: '',
        careerIntentions: '',
        internshipExperience: '',
        volunteerExperience: ''
      }
    }
  }

  return {
    basicInfo: {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phone: profile.phone || '',
      email: user.email,
      nationality: profile.nationality || '',
      visaRequired: profile.visaRequired || false,
      mbti: profile.mbti || undefined,
      extracurricular: profile.extracurricular || undefined,
      personalStrengths: profile.personalStrengths || undefined,
      hobbies: profile.hobbies || undefined
    },
    academicPerformance: {
      gpa: profile.gpa?.toString() || '',
      majorGpa: profile.majorGpa?.toString() || '',
      major: profile.major || '',
      highestDegree: profile.currentEducation || '',
      languageTestsData: profile.languageTestsData || [],
      standardizedTestsData: profile.standardizedTestsData || [],
      researchExperience: profile.researchExperience || '',
      publications: profile.publications || ''
    },
    applicationIntentions: {
      intendedDegree: profile.intendedDegree || '',
      intendedIntakeTerm: profile.intendedIntakeTerm || '',
      intendedMajor: profile.intendedMajor || '',
      intendedCountries: profile.intendedCountries || [],
      intendedBudgets: profile.intendedBudgets || '',
      scholarshipRequirements: profile.scholarshipRequirements || '',
      otherFinancialAidsRequired: profile.scholarshipNeeds || false,
      otherPreference: profile.otherPreference || '',
      careerIntentions: profile.careerGoals || '',
      internshipExperience: profile.internshipExperience || '',
      volunteerExperience: profile.volunteerExperience || ''
    }
  }
}

/**
 * Clean up undefined values from profile update data
 */
export function cleanProfileUpdateData(data: ProfileUpdateData): ProfileUpdateData {
  const cleaned: ProfileUpdateData = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof ProfileUpdateData] = value
    }
  })
  
  return cleaned
}
