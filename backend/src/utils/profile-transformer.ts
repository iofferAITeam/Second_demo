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
  wechat?: string | null
  birthDate?: Date | null
  nationality?: string | null
  visaRequired?: boolean | null
  mbti?: string | null
  extracurricular?: string | null
  personalStrengths?: string | null
  hobbies?: string | null
  currentEducation?: string | null
  gpa?: number | null
  lastTwoYearsGpa?: number | null
  major?: string | null
  graduationDate?: Date | null
  undergraduateUniversity?: string | null
  universityRank?: number | null
  universityType?: string | null
  highSchoolName?: string | null
  graduationYear?: string | null
  majorSubjects?: any | null
  majorSubjectsData?: any | null
  researchExperience?: string | null
  publications?: string | null
  toefl?: number | null
  ielts?: number | null
  gre?: number | null
  gmat?: number | null
  satScore?: number | null
  actScore?: number | null
  languageTestType?: string | null
  languageTestScore?: string | null
  languageTestDate?: string | null
  languageTestsData?: any | null
  standardizedTestType?: string | null
  standardizedTestScore?: string | null
  standardizedTestDate?: string | null
  standardizedTestsData?: any | null
  targetDegreeType?: string | null
  targetMajors?: any | null
  targetCountries?: any | null
  applicationYear?: string | null
  applicationTerm?: string | null
  intendedDegree?: string | null
  intendedIntakeTerm?: string | null
  intendedMajor?: string | null
  intendedCountries?: any | null
  intendedBudgets?: string | null
  scholarshipRequirements?: string | null
  otherPreference?: string | null
  internshipExperience?: string | null
  volunteerExperience?: string | null
  goals?: string | null
  careerGoals?: string | null
  personalStatement?: string | null
  budgetRange?: string | null
  scholarshipNeeds?: boolean | null
  preferredCityType?: string | null
  climatePreference?: string | null
  campusSize?: string | null
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
    major: academicPerformance.universityName || undefined,
    graduationDate: academicPerformance.graduationYear ? new Date(academicPerformance.graduationYear) : undefined,
    undergraduateUniversity: academicPerformance.graduatedInstitution || undefined,
    highSchoolName: academicPerformance.highSchoolName || undefined,
    graduationYear: academicPerformance.graduationYear || undefined,
    majorSubjects: academicPerformance.majorSubjects || undefined,
    majorSubjectsData: academicPerformance.majorSubjectsData || undefined,
    researchExperience: academicPerformance.researchExperience || undefined,
    publications: academicPerformance.publications || undefined,
    
    // Test Scores
    toefl: academicPerformance.toeflScore ? parseInt(academicPerformance.toeflScore) : undefined,
    ielts: academicPerformance.ieltsScore ? parseFloat(academicPerformance.ieltsScore) : undefined,
    gre: academicPerformance.greScore ? parseInt(academicPerformance.greScore) : undefined,
    gmat: academicPerformance.gmatScore ? parseInt(academicPerformance.gmatScore) : undefined,
    satScore: academicPerformance.satScore ? parseInt(academicPerformance.satScore) : undefined,
    actScore: academicPerformance.actScore ? parseInt(academicPerformance.actScore) : undefined,
    
    // Language and Standardized Tests (arrays of test records)
    languageTestsData: academicPerformance.languageTestsData || undefined,
    standardizedTestsData: academicPerformance.standardizedTestsData || undefined,
    
    // Application Intentions
    targetDegreeType: applicationIntentions.intendedDegree || undefined,
    applicationTerm: applicationIntentions.intendedIntakeTerm || undefined,
    targetMajors: applicationIntentions.intendedMajor ? [applicationIntentions.intendedMajor] : undefined,
    targetCountries: applicationIntentions.intendedCountries || undefined,
    budgetRange: applicationIntentions.intendedBudgets || undefined,
    scholarshipNeeds: applicationIntentions.otherFinancialAidsRequired,
    goals: applicationIntentions.careerIntentions || undefined,
    
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
      majorGpa: profile.lastTwoYearsGpa?.toString() || '',
      satScore: profile.satScore?.toString() || '',
      actScore: profile.actScore?.toString() || '',
      toeflScore: profile.toefl?.toString() || '',
      ieltsScore: profile.ielts?.toString() || '',
      greScore: profile.gre?.toString() || '',
      gmatScore: profile.gmat?.toString() || '',
      highestDegree: profile.currentEducation || '',
      highSchoolName: profile.highSchoolName || '',
      universityName: profile.undergraduateUniversity || '',
      graduatedInstitution: profile.undergraduateUniversity || '',
      graduationYear: profile.graduationYear || profile.graduationDate?.getFullYear().toString() || '',
      majorSubjects: Array.isArray(profile.majorSubjects) ? profile.majorSubjects : [],
    majorSubjectsData: profile.majorSubjectsData || [],
      languageTestType: profile.languageTestType || '',
      languageTestScore: profile.languageTestScore || '',
      languageTestDate: profile.languageTestDate || '',
      languageTestsData: profile.languageTestsData || [],
      standardizedTestType: profile.standardizedTestType || '',
      standardizedTestScore: profile.standardizedTestScore || '',
      standardizedTestDate: profile.standardizedTestDate || '',
      standardizedTestsData: profile.standardizedTestsData || [],
      researchExperience: profile.researchExperience || '',
      publications: profile.publications || ''
    },
    applicationIntentions: {
      intendedDegree: profile.targetDegreeType || profile.intendedDegree || '',
      intendedIntakeTerm: profile.applicationTerm || profile.intendedIntakeTerm || '',
      intendedMajor: profile.intendedMajor || (Array.isArray(profile.targetMajors) ? profile.targetMajors[0] || '' : ''),
      intendedCountries: profile.intendedCountries || (Array.isArray(profile.targetCountries) ? profile.targetCountries : []),
      intendedBudgets: profile.intendedBudgets || profile.budgetRange || '',
      scholarshipRequirements: profile.scholarshipRequirements || '',
      otherFinancialAidsRequired: profile.scholarshipNeeds || false,
      otherPreference: profile.otherPreference || '',
      careerIntentions: profile.goals || '',
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
