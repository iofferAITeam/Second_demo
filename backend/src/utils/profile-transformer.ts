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
  phone?: string
  wechat?: string
  birthDate?: Date
  nationality?: string
  visaRequired?: boolean
  mbti?: string
  extracurricular?: string
  personalStrengths?: string
  hobbies?: string
  currentEducation?: string
  gpa?: number
  majorGpa?: number
  major?: string
  graduationDate?: Date
  highestDegree?: string
  highSchoolName?: string
  universityName?: string
  graduationYear?: string
  majorSubjects?: string[]
  satScore?: number
  actScore?: number
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  researchExperience?: string
  publications?: string
  intendedDegree?: string
  intendedIntakeTerm?: string
  intendedMajor?: string
  intendedCountries?: string[]
  intendedBudgets?: string
  scholarshipRequirements?: string
  otherFinancialAidsRequired?: boolean
  otherPreference?: string
  careerIntentions?: string
  internshipExperience?: string
  volunteerExperience?: string
  experiences?: any
  goals?: string
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

  // Transform profile data
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
    major: academicPerformance.universityName || undefined,
    graduationDate: academicPerformance.graduationYear ? new Date(academicPerformance.graduationYear) : undefined,
    highestDegree: academicPerformance.highestDegree || undefined,
    highSchoolName: academicPerformance.highSchoolName || undefined,
    universityName: academicPerformance.universityName || undefined,
    graduationYear: academicPerformance.graduationYear || undefined,
    majorSubjects: academicPerformance.majorSubjects || [],
    
    // Test Scores
    satScore: academicPerformance.satScore ? parseInt(academicPerformance.satScore) : undefined,
    actScore: academicPerformance.actScore ? parseInt(academicPerformance.actScore) : undefined,
    toefl: academicPerformance.toeflScore ? parseInt(academicPerformance.toeflScore) : undefined,
    ielts: academicPerformance.ieltsScore ? parseFloat(academicPerformance.ieltsScore) : undefined,
    gre: academicPerformance.greScore ? parseInt(academicPerformance.greScore) : undefined,
    gmat: academicPerformance.gmatScore ? parseInt(academicPerformance.gmatScore) : undefined,
    languageTestType: academicPerformance.languageTestType || undefined,
    languageTestScore: academicPerformance.languageTestScore || undefined,
    languageTestDate: academicPerformance.languageTestDate || undefined,
    standardizedTestType: academicPerformance.standardizedTestType || undefined,
    standardizedTestScore: academicPerformance.standardizedTestScore || undefined,
    standardizedTestDate: academicPerformance.standardizedTestDate || undefined,
    
    // Research & Publications
    researchExperience: academicPerformance.researchExperience || undefined,
    publications: academicPerformance.publications || undefined,
    
    // Application Intentions
    intendedDegree: applicationIntentions.intendedDegree || undefined,
    intendedIntakeTerm: applicationIntentions.intendedIntakeTerm || undefined,
    intendedMajor: applicationIntentions.intendedMajor || undefined,
    intendedCountries: applicationIntentions.intendedCountries || [],
    intendedBudgets: applicationIntentions.intendedBudgets || undefined,
    scholarshipRequirements: applicationIntentions.scholarshipRequirements || undefined,
    otherFinancialAidsRequired: applicationIntentions.otherFinancialAidsRequired,
    otherPreference: applicationIntentions.otherPreference || undefined,
    careerIntentions: applicationIntentions.careerIntentions || undefined,
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
        satScore: '',
        actScore: '',
        toeflScore: '',
        ieltsScore: '',
        greScore: '',
        gmatScore: '',
        highSchoolName: '',
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
      satScore: profile.satScore?.toString() || '',
      actScore: profile.actScore?.toString() || '',
      toeflScore: profile.toefl?.toString() || '',
      ieltsScore: profile.ielts?.toString() || '',
      greScore: profile.gre?.toString() || '',
      gmatScore: profile.gmat?.toString() || '',
      highestDegree: profile.highestDegree || '',
      highSchoolName: profile.highSchoolName || '',
      universityName: profile.universityName || '',
      graduationYear: profile.graduationYear || '',
      majorSubjects: profile.majorSubjects || [],
      languageTestType: profile.languageTestType || '',
      languageTestScore: profile.languageTestScore || '',
      languageTestDate: profile.languageTestDate || '',
      standardizedTestType: profile.standardizedTestType || '',
      standardizedTestScore: profile.standardizedTestScore || '',
      standardizedTestDate: profile.standardizedTestDate || '',
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
      otherFinancialAidsRequired: profile.otherFinancialAidsRequired || false,
      otherPreference: profile.otherPreference || '',
      careerIntentions: profile.careerIntentions || '',
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
