"use client";

import { useState, useEffect } from "react";
import CompetitivenessChart from "./CompetitivenessChart";
import SchoolRecommendationCard from "./SchoolRecommendationCard";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCompetitiveness } from "@/hooks/useCompetitiveness";
import "../../styles/recommendations.css";

interface SchoolData {
  id: string;
  name: string;
  program: string;
  location: string;
  duration: string;
  tuition: string;
  toefl: string;
  admissionRate: string;
  fitScore: string;
  fitLabel: string;
  category: "target" | "fit" | "safety";
  employment: string;
  schoolType: string;
  analysisContent: {
    matchAnalysis: string;
    academic: string;
    language: string;
    specialization: string;
    professionalExperience: string;
    preferenceAdvice: string;
  };
}

const mockSchoolData: SchoolData[] = [
  {
    id: "1",
    name: "Stanford University",
    program: "Master of Science in Computer Science",
    location: "",
    duration: "",
    tuition: "",
    toefl: "",
    admissionRate: "89%",
    fitScore: "4.8",
    fitLabel: "Perfect Fit",
    category: "target",
    employment: "",
    schoolType: "One Click Apply",
    analysisContent: {
      matchAnalysis:
        "This Stanford University program shows excellent alignment with your academic background and career goals. The program's curriculum and research opportunities match well with your interests and qualifications.",
      academic:
        "Your academic credentials align well with Stanford University's admission standards. The program's rigorous curriculum will challenge you while building upon your existing knowledge base.",
      language:
        "The TOEFL requirement matches your proficiency level. The university offers excellent language support services to help international students succeed.",
      specialization:
        "The Master of Science in Computer Science program offers specialized tracks that align with your career interests and academic background.",
      professionalExperience:
        "Your professional background complements this program well. The university's industry connections will help you leverage your experience for career advancement.",
      preferenceAdvice:
        "Based on your preferences for location and program type, this university offers an ideal environment for your studies and career development.",
    },
  },
  {
    id: "2",
    name: "University of California, Berkeley",
    program: "Master of Engineering in Data Science",
    location: "Berkeley, CA",
    duration: "1.5 years",
    tuition: "$44,007",
    toefl: "90",
    admissionRate: "92%",
    fitScore: "3.9",
    fitLabel: "High Fit",
    category: "fit",
    employment: "High employment rate",
    schoolType: "iOffer Cooperation",
    analysisContent: {
      matchAnalysis:
        "This University of California, Berkeley program shows excellent alignment with your academic background and career goals. The program's curriculum and research opportunities match well with your interests and qualifications.",
      academic:
        "Your academic credentials align well with University of California, Berkeley's admission standards. The program's rigorous curriculum will challenge you while building upon your existing knowledge base.",
      language:
        "The TOEFL requirement of 90 matches your proficiency level. The university offers excellent language support services to help international students succeed.",
      specialization:
        "The Master of Engineering in Data Science program offers specialized tracks that align with your career interests and academic background.",
      professionalExperience:
        "Your professional background complements this program well. The university's industry connections will help you leverage your experience for career advancement.",
      preferenceAdvice:
        "Based on your preferences for location and program type, this university offers an ideal environment for your studies and career development.",
    },
  },
  {
    id: "3",
    name: "Carnegie Mellon University",
    program: "Master of Science in Machine Learning",
    location: "Pittsburgh, PA",
    duration: "2 years",
    tuition: "$52,040",
    toefl: "102",
    admissionRate: "72%",
    fitScore: "2.8",
    fitLabel: "Medium Fit",
    category: "target",
    employment: "High employment rate",
    schoolType: "iOffer Cooperation",
    analysisContent: {
      matchAnalysis:
        "This Carnegie Mellon University program shows excellent alignment with your academic background and career goals. The program's curriculum and research opportunities match well with your interests and qualifications.",
      academic:
        "Your academic credentials align well with Carnegie Mellon University's admission standards. The program's rigorous curriculum will challenge you while building upon your existing knowledge base.",
      language:
        "The TOEFL requirement of 102 matches your proficiency level. The university offers excellent language support services to help international students succeed.",
      specialization:
        "The Master of Science in Machine Learning program offers specialized tracks that align with your career interests and academic background.",
      professionalExperience:
        "Your professional background complements this program well. The university's industry connections will help you leverage your experience for career advancement.",
      preferenceAdvice:
        "Based on your preferences for location and program type, this university offers an ideal environment for your studies and career development.",
    },
  },
  {
    id: "4",
    name: "University of Washington",
    program: "Master of Science in Computer Science",
    location: "Seattle, WA",
    duration: "2 years",
    tuition: "$42,000",
    toefl: "100",
    admissionRate: "89%",
    fitScore: "1.5",
    fitLabel: "Good Fit",
    category: "safety",
    employment: "High employment rate",
    schoolType: "One Click Apply",
    analysisContent: {
      matchAnalysis:
        "This University of Washington program shows excellent alignment with your academic background and career goals. The program's curriculum and research opportunities match well with your interests and qualifications.",
      academic:
        "Your academic credentials align well with University of Washington's admission standards. The program's rigorous curriculum will challenge you while building upon your existing knowledge base.",
      language:
        "The TOEFL requirement of 100 matches your proficiency level. The university offers excellent language support services to help international students succeed.",
      specialization:
        "The Master of Science in Computer Science program offers specialized tracks that align with your career interests and academic background.",
      professionalExperience:
        "Your professional background complements this program well. The university's industry connections will help you leverage your experience for career advancement.",
      preferenceAdvice:
        "Based on your preferences for location and program type, this university offers an ideal environment for your studies and career development.",
    },
  },
];

export default function RecommendationsInterface() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: competitivenessData, isLoading: competitivenessLoading } = useCompetitiveness();
  const [selectedCategory, setSelectedCategory] = useState<string>("target");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [schoolData, setSchoolData] = useState<SchoolData[]>(mockSchoolData);
  const [originalQuery, setOriginalQuery] = useState<string>("");
  const [isAIData, setIsAIData] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [fullAIResponse, setFullAIResponse] = useState<string>("");

  // Load AI recommendations from database on component mount
  useEffect(() => {
    // Wait for auth loading to complete
    if (isLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/auth?redirect=/recommendations');
      return;
    }

    console.log('User authenticated:', user?.email);

    // Load current user profile
    const loadCurrentUserProfile = async () => {
      try {
        const profileResponse = await api.getProfile();
        setCurrentUserProfile(profileResponse);
      } catch (error) {
        console.warn('Failed to load current user profile, using default data:', error);
        // 设置一个默认的用户profile，避免影响推荐功能
        setCurrentUserProfile({
          id: 'test-user-id',
          email: user?.email || 'test@example.com',
          name: user?.name || 'Test User'
        });
      }
    };

    loadCurrentUserProfile();

    const loadRecommendations = async () => {
      try {
        // First try to get the latest AI recommendation from database
        const dbResponse = await api.getLatestRecommendation()

        if (dbResponse.hasRecommendations && dbResponse.recommendation) {
          const recommendation = dbResponse.recommendation

          // Convert database data to SchoolData format
          const convertedData: SchoolData[] = recommendation.schools.map((school: any) => ({
            id: school.id,
            name: school.schoolName || school.name,
            program: school.programName || school.program,
            location: school.location || getLocationForSchool(school.name),
            duration: school.duration || "2 years",
            tuition: school.tuition || getTuitionForSchool(school.name),
            toefl: school.toeflRequirement || school.toefl || getToeflForSchool(school.schoolName || school.name),
            admissionRate: school.admissionRate || `${Math.round(100 - (school.academicScore || school.academic || 0) * 5 - (school.fitScore || school.fit || 0) * 5)}%`,
            fitScore: school.fitScore ? school.fitScore.toString() : "3.0",
            fitLabel: school.fitLabel || (school.fitScore >= 4 ? "High Fit" : school.fitScore >= 3 ? "Medium Fit" : "Good Fit"),
            category: school.category as "target" | "fit" | "safety",
            employment: "High employment rate",
            schoolType: school.schoolType,
            academic: school.academicScore || school.academic,
            practical: school.practicalScore || school.practical,
            language: school.languageScore || school.language,
            fit: school.fitScore || school.fit,
            note: school.strategistNote || school.note,
            analysisContent: {
              matchAnalysis: school.analysisContent || `Match analysis for ${school.schoolName || school.name} program.`,
              academic: `Academic assessment for ${school.schoolName || school.name} program.`,
              language: `Language requirements assessment for ${school.schoolName || school.name} program.`,
              specialization: `Specialization analysis for ${school.schoolName || school.name} program.`,
              professionalExperience: `Professional experience evaluation for ${school.schoolName || school.name} program.`,
              preferenceAdvice: `Preference and advice for ${school.schoolName || school.name} program.`
            }
          }))

          setSchoolData(convertedData)
          setOriginalQuery(recommendation.originalQuery)
          setFullAIResponse(recommendation.aiResponse)
          setUserProfile(dbResponse.userProfile)
          setIsAIData(true)

          console.info(`Loaded AI recommendation from database: ${recommendation.id}`)
          return // Successfully loaded from database, skip localStorage
        }
      } catch (error) {
        console.warn('Failed to load recommendation from database:', error)
      }

      // Fallback to localStorage if database load fails
      const aiRecommendations = localStorage.getItem('aiRecommendations');
      const query = localStorage.getItem('originalQuery');
      const profile = localStorage.getItem('userProfile');
      const aiResponse = localStorage.getItem('fullAIResponse');

      if (aiRecommendations && query) {
      try {
        const parsedData = JSON.parse(aiRecommendations);

        // Convert AI data to SchoolData format
        const convertedData: SchoolData[] = parsedData.map((school: any, index: number) => ({
          id: school.id || (index + 1).toString(),
          name: school.name,
          program: school.program || "Master of Science in Computer Science",
          location: getLocationForSchool(school.name),
          duration: "2 years",
          tuition: getTuitionForSchool(school.name),
          toefl: getToeflForSchool(school.name),
          admissionRate: `${Math.round(100 - (school.academic || 0) * 5 - (school.fit || 0) * 5)}%`,
          fitScore: (school.fit || 0).toString(),
          fitLabel: getFitLabel(school.fit || 0),
          category: getCategoryFromScores(school),
          employment: "High employment rate",
          schoolType: getSchoolType(school.name),
          academic: school.academic,
          practical: school.practical,
          language: school.language,
          fit: school.fit,
          note: school.note
        }));

        setSchoolData(convertedData);
        setOriginalQuery(query);
        setIsAIData(true);

        // Load user profile and AI response if available
        if (profile) {
          try {
            setUserProfile(JSON.parse(profile));
          } catch (error) {
            console.error('Failed to parse user profile:', error);
          }
        }

        if (aiResponse) {
          setFullAIResponse(aiResponse);
        }

          // Clear localStorage after loading
          localStorage.removeItem('aiRecommendations');
          localStorage.removeItem('originalQuery');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('fullAIResponse');
        } catch (error) {
          console.error('Failed to parse AI recommendations:', error);
          setSchoolData(mockSchoolData);
        }
      } else {
        // No data in localStorage either, use mock data
        console.info('No AI recommendations found, using mock data');
        setSchoolData(mockSchoolData);
      }
    }

    loadRecommendations()
  }, [router, isAuthenticated, isLoading, user]);

  // Helper functions to map AI data to display format
  const getLocationForSchool = (name: string): string => {
    const locationMap: { [key: string]: string } = {
      'Carnegie Mellon': 'Pittsburgh, PA',
      'UC Berkeley': 'Berkeley, CA',
      'Stanford': 'Stanford, CA',
      'University of Washington': 'Seattle, WA',
      'Georgia Tech': 'Atlanta, GA',
      'UCLA': 'Los Angeles, CA',
      'Cornell': 'Ithaca, NY',
      'USC': 'Los Angeles, CA',
      'Purdue': 'West Lafayette, IN',
      'UC Irvine': 'Irvine, CA'
    };

    for (const [key, location] of Object.entries(locationMap)) {
      if (name.includes(key)) return location;
    }
    return "USA";
  };

  const getTuitionForSchool = (name: string): string => {
    const tuitionMap: { [key: string]: string } = {
      'Carnegie Mellon': '$58,924',
      'UC Berkeley': '$44,007',
      'Stanford': '$58,416',
      'University of Washington': '$36,898',
      'Georgia Tech': '$29,140',
      'UCLA': '$44,066',
      'Cornell': '$60,286',
      'USC': '$64,726',
      'Purdue': '$29,132',
      'UC Irvine': '$44,007'
    };

    for (const [key, tuition] of Object.entries(tuitionMap)) {
      if (name.includes(key)) return tuition;
    }
    return "$45,000";
  };

  const getToeflForSchool = (name: string): string => {
    const toeflMap: { [key: string]: string } = {
      'Carnegie Mellon': '102',
      'UC Berkeley': '90',
      'Stanford': '100',
      'University of Washington': '92',
      'Georgia Tech': '100',
      'UCLA': '96',
      'Cornell': '100',
      'USC': '90',
      'Purdue': '88',
      'UC Irvine': '80'
    };

    for (const [key, toefl] of Object.entries(toeflMap)) {
      if (name.includes(key)) return toefl;
    }
    return "90";
  };

  const getFitLabel = (fitScore: number): string => {
    if (fitScore >= 5) return "Perfect Fit";
    if (fitScore >= 4) return "High Fit";
    if (fitScore >= 3) return "Good Fit";
    return "Medium Fit";
  };

  const getCategoryFromScores = (school: any): "target" | "fit" | "safety" => {
    const avgScore = ((school.academic || 0) + (school.fit || 0)) / 2;
    if (avgScore >= 4.5) return "target";
    if (avgScore >= 3.5) return "fit";
    return "safety";
  };

  const getSchoolType = (name: string): string => {
    const prestigeSchools = ['Stanford', 'Carnegie Mellon', 'UC Berkeley', 'Cornell'];
    for (const school of prestigeSchools) {
      if (name.includes(school)) return "One Click Apply";
    }
    return "iOffer Cooperation";
  };

  const getCategoryCount = (category: string) => {
    return schoolData.filter((school) => school.category === category).length;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredSchools =
    selectedCategory === "all"
      ? schoolData
      : schoolData.filter((school) => school.category === selectedCategory);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-layout">
      {/* Sidebar */}
      <div
        className={`recommendations-sidebar ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-container">
          {/* Header */}
          <div className="sidebar-header">
            {/* Logo */}
            <div className="sidebar-logo">
              <div className="logo-container">
                <div className="logo-box">
                  <svg
                    width="120"
                    height="40"
                    viewBox="0 0 120 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_215_13030)">
                      <path
                        d="M1.22754 11.7776C3.74711 10.7224 15.3802 11.9997 18.3916 11.7776C18.6834 13.3669 18.7429 14.4839 18.6963 15.3235C18.7663 17.3216 19.0741 21.1007 20.3652 23.179C20.777 23.619 21.1826 23.9805 21.5244 24.2219C23.9227 25.9151 26.5417 27.0567 29.4639 27.8254C36.3644 29.4599 44.902 28.8391 56.9102 28.8391C66.7301 28.8391 74.3276 28.9682 80.8242 28.9983C86.109 28.8888 91.8461 28.7574 97.7051 28.6194C102.176 28.4158 110.832 28.0955 118.927 27.8069C120.059 27.7669 120.201 29.4345 119.077 29.5842C109.119 30.9102 98.031 32.4127 93.9512 33.0598C62.1919 38.0976 52.9743 40.7781 32.5654 39.5559C20.0542 38.8066 5.35405 36.5554 1.78516 21.0002C1.19196 18.4146 0.903147 16.193 0.902344 16.1868L0.90332 16.1858C0.70083 14.7564 0.721987 13.2499 1.22754 11.7776Z"
                        fill="#1C5DFF"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.78809 18.1111C7.80667 27.2222 16.0288 28.1396 21.5241 29.7777C35.6877 33.9999 33.7254 35.8888 68.967 29.7777C43.2611 29.1325 34.4358 28.0881 29.0329 26.6666C25.7694 25.808 18.1659 22.5785 18.0163 14.0086C18.0131 13.8208 17.9554 18.9999 11.5985 19.5555C5.24162 20.1111 3.68028 18.1111 2.78809 18.1111Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.685 13.9767C18.6854 13.9864 18.6855 13.9945 18.6856 13.9972C18.7564 18.0589 20.5833 20.8383 22.7923 22.7231C25.0188 24.6228 27.6327 25.6088 29.204 26.0222C34.5194 27.4207 43.2674 28.4659 68.9841 29.1114C69.328 29.12 69.6093 29.387 69.6345 29.7288C69.6598 30.0707 69.4209 30.3759 69.0819 30.4346C51.4791 33.4871 43.0843 34.5586 37.3136 34.3189C32.9618 34.1382 30.0781 33.2042 25.9515 31.8676C24.5818 31.424 23.0752 30.936 21.3325 30.4165C20.603 30.1991 19.8147 29.9932 18.9841 29.7762C13.6918 28.3938 6.68004 26.5623 2.20167 18.4319C2.0879 18.2254 2.092 17.9743 2.21245 17.7716C2.3329 17.5689 2.55181 17.4445 2.78829 17.4445C3.01944 17.4445 3.23054 17.5082 3.40158 17.5735C3.57359 17.6391 3.75926 17.7284 3.93868 17.8148L3.96259 17.8263C4.32802 18.0024 4.76528 18.2132 5.35584 18.4093C6.55422 18.8073 8.44051 19.1624 11.5402 18.8915C14.5047 18.6324 15.9173 17.3185 16.6168 16.1598C16.9759 15.5651 17.1597 14.9888 17.2533 14.5724C17.3 14.365 17.3237 14.1997 17.3357 14.0947C17.3417 14.0425 17.3449 14.0047 17.3466 13.9826L17.3468 13.9797C17.3474 13.9723 17.3487 13.9542 17.3496 13.9453C17.3496 13.9452 17.3513 13.9245 17.3552 13.9001C17.3565 13.892 17.3603 13.8719 17.3629 13.8597C17.3677 13.8394 17.3862 13.7794 17.4016 13.7402C17.4564 13.6387 17.846 13.3591 18.2164 13.3676C18.4405 13.4882 18.6351 13.75 18.6594 13.8197C18.6673 13.8498 18.6767 13.8966 18.6792 13.9131C18.6806 13.9235 18.6825 13.9408 18.6831 13.9479C18.6843 13.9616 18.6848 13.9724 18.685 13.9767ZM17.7026 16.9461C16.7658 18.4366 14.9761 19.9297 11.6572 20.2197C8.4 20.5044 6.32718 20.1373 4.93263 19.6742C4.7446 19.6117 4.56993 19.5479 4.40777 19.4843C8.56613 25.6495 14.3961 27.1846 19.2651 28.4667C20.1162 28.6908 20.9379 28.9071 21.7162 29.1392C23.5415 29.6833 25.0906 30.1847 26.4779 30.6337C30.5403 31.9487 33.2143 32.8142 37.3694 32.9868C42.2112 33.1878 49.031 32.4377 62.1919 30.2536C41.6252 29.6013 33.8408 28.6212 28.8623 27.3113C27.17 26.866 24.3504 25.808 21.9218 23.7358C20.0449 22.1343 18.4013 19.9245 17.7026 16.9461Z"
                        fill="#1C5DFF"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M41.1172 32.9964C41.1172 32.9964 53.0072 32.3146 55.0929 29.1111C56.0191 27.6885 58.8594 26.4697 59.5585 26.1859C63.8169 24.4574 58.9342 23.4713 60.6691 22.9999C62.4041 22.5285 66.1338 23.2879 66.8395 23.6478C67.5452 24.0077 67.2868 24.7717 66.1827 26.8144C65.9019 27.3341 66.0497 27.7724 66.3925 28.1707C66.9151 28.778 68.42 31.866 72.8587 31.426C77.2974 30.9861 69.2767 34.0915 68.5431 34.8224C66.4928 36.8652 60.6626 36.7139 60.6626 36.7139L41.1172 32.9964Z"
                        fill="#1C5DFF"
                      />
                      <ellipse
                        cx="9.81412"
                        cy="12.6667"
                        rx="8.69888"
                        ry="6"
                        fill="#1C5DFF"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.36076 18.2223C6.00571 18.2223 4.90723 17.2274 4.90723 16.0001C4.90723 14.6668 6.6505 14.9346 7.57239 14.4228C8.49429 13.911 8.45842 13.5557 9.81429 13.5557C11.1718 13.5557 11.1375 13.9051 12.0596 14.4151C12.8681 14.8624 14.7214 14.6668 14.7214 16.0001C14.7214 17.2274 13.6229 18.2223 12.2678 18.2223C10.9128 18.2223 9.81429 17.783 9.81429 16.5557C9.78121 17.7569 8.69496 18.2223 7.36076 18.2223Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.55143 14.4124C9.70785 14.2991 9.91977 14.2991 10.0762 14.4124L11.1579 15.1962C11.5073 15.4493 11.3275 16.0001 10.8955 16.0001H8.73211C8.30007 16.0001 8.12032 15.4493 8.46973 15.1962L9.55143 14.4124Z"
                        fill="black"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.12268 8.88892C3.12268 8.88892 1.08818 9.0434 0 10.4708C1.08818 10.6968 1.41719 11.5556 1.41719 11.5556L2.4693 10.6556L3.12268 8.88892Z"
                        fill="#1C5DFF"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.5053 8.88892C16.5053 8.88892 18.5398 9.0434 19.6279 10.4708C18.5398 10.6968 18.2107 11.5556 18.2107 11.5556L17.1586 10.6556L16.5053 8.88892Z"
                        fill="#1C5DFF"
                      />
                      <g filter="url(#filter0_i_215_13030)">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 12.2284C0 11.687 0.329162 11.2004 0.841962 11.0213C2.45134 10.4589 6.13273 9.33325 9.81413 9.33325C13.4955 9.33325 17.1769 10.4589 18.7863 11.0213C19.2991 11.2004 19.6283 11.687 19.6283 12.2284V12.4537C19.6283 13.0855 18.9817 13.5277 18.3803 13.3271C16.6122 12.7373 13.2131 11.7777 9.81413 11.7777C6.41511 11.7777 3.0161 12.7373 1.24794 13.3271C0.646576 13.5277 0 13.0855 0 12.4537V12.2284Z"
                          fill="url(#paint0_linear_215_13030)"
                        />
                      </g>
                      <path
                        opacity="0.6"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.44242 11.1874C3.17928 11.272 2.91199 11.3794 2.74859 11.4744C2.6422 11.5362 2.50561 11.5005 2.44353 11.3945C2.38144 11.2885 2.41735 11.1524 2.52375 11.0905C2.72806 10.9717 3.03069 10.8527 3.30539 10.7644C3.44453 10.7197 3.58118 10.6813 3.70036 10.6538C3.81447 10.6275 3.92853 10.6074 4.01537 10.6074C4.13856 10.6074 4.23842 10.7069 4.23842 10.8296C4.23842 10.9524 4.13856 11.0519 4.01537 11.0519C3.98254 11.0519 3.91032 11.0616 3.80084 11.0868C3.69643 11.1109 3.57219 11.1456 3.44242 11.1874Z"
                        fill="white"
                      />
                      <path
                        opacity="0.6"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.17023 10.7984C5.05894 10.7984 4.92118 10.8282 4.78221 10.8649C4.66314 10.8963 4.54102 10.8256 4.50946 10.707C4.47789 10.5884 4.54883 10.4667 4.6679 10.4353C4.80851 10.3981 4.99562 10.354 5.17023 10.354C5.29341 10.354 5.39328 10.4535 5.39328 10.5762C5.39328 10.699 5.29341 10.7984 5.17023 10.7984Z"
                        fill="white"
                      />
                      <path
                        d="M9.81389 12.6666C11.7849 12.6666 13.3827 13.5549 13.3827 13.5549C13.3827 13.5549 11.7849 12.9999 9.81389 12.9999C7.84291 12.9999 6.24512 13.5549 6.24512 13.5549C6.24512 13.5549 7.84291 12.6666 9.81389 12.6666Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.42379 15.5736C5.42385 15.5737 5.42392 15.5737 5.35375 15.6601L5.42392 15.5737C5.47179 15.6123 5.47918 15.6823 5.44043 15.73C5.40175 15.7776 5.33171 15.785 5.28384 15.7467C5.28379 15.7466 5.28375 15.7466 5.2837 15.7465C5.28369 15.7465 5.28369 15.7465 5.28368 15.7465L5.2825 15.7456C5.28116 15.7446 5.27885 15.7428 5.27555 15.7404C5.26894 15.7355 5.25839 15.728 5.2438 15.7182C5.21463 15.6986 5.16933 15.6702 5.10724 15.6367C4.9831 15.5698 4.79169 15.4825 4.52773 15.4053C4.00025 15.2511 3.18017 15.1362 2.02442 15.3074C1.9635 15.3165 1.90677 15.2746 1.89771 15.2139C1.88865 15.1532 1.9307 15.0967 1.99162 15.0876C3.17788 14.9119 4.03067 15.0284 4.59055 15.1921C4.87027 15.2739 5.07616 15.3673 5.2134 15.4413C5.28201 15.4783 5.33342 15.5104 5.36829 15.5338C5.38572 15.5455 5.39902 15.555 5.40826 15.5618C5.41288 15.5652 5.41649 15.5679 5.4191 15.5699L5.42226 15.5724L5.42327 15.5732L5.42364 15.5735L5.42379 15.5736Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.37271 16.0222C5.37276 16.0222 5.37282 16.0222 5.35386 16.1311L5.37282 16.0222C5.43351 16.0327 5.47417 16.0902 5.46364 16.1507C5.45313 16.2111 5.39548 16.2516 5.33485 16.2412C5.33484 16.2412 5.33484 16.2412 5.33484 16.2412C5.33483 16.2412 5.33481 16.2412 5.3348 16.2412C5.3348 16.2412 5.33479 16.2412 5.33478 16.2412C5.33476 16.2412 5.33473 16.2412 5.3347 16.2412L5.33452 16.2411L5.33241 16.2408C5.33036 16.2405 5.32703 16.24 5.32243 16.2393C5.31325 16.238 5.29903 16.2361 5.27993 16.234C5.24173 16.2297 5.18404 16.2245 5.10813 16.221C4.95633 16.214 4.73172 16.2139 4.44469 16.2423C3.87079 16.2989 3.04656 16.4693 2.05485 16.9264C1.99895 16.9521 1.93267 16.9278 1.90681 16.8722C1.88096 16.8165 1.90531 16.7504 1.96122 16.7247C2.97695 16.2566 3.82558 16.0801 4.42269 16.0211C4.72115 15.9916 4.95658 15.9915 5.11844 15.999C5.19937 16.0027 5.26191 16.0084 5.30474 16.0131C5.32615 16.0155 5.34264 16.0177 5.35405 16.0193C5.35975 16.0201 5.36418 16.0208 5.36731 16.0213L5.37104 16.0219L5.37218 16.0221L5.37256 16.0222L5.37271 16.0222Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.57666 16.9456C5.57666 16.9456 5.57667 16.9456 5.57668 16.9456C5.63823 16.9456 5.68811 16.8958 5.68811 16.8345C5.68811 16.7731 5.63818 16.7234 5.57658 16.7234V16.8345C5.57658 16.7234 5.57653 16.7234 5.57647 16.7234L5.57633 16.7234L5.57591 16.7234L5.57463 16.7234L5.57027 16.7234C5.56656 16.7235 5.56128 16.7236 5.55448 16.7238C5.54088 16.7241 5.52122 16.7249 5.49601 16.7263C5.44562 16.7291 5.373 16.7347 5.28234 16.7459C5.10112 16.7682 4.84725 16.8128 4.55431 16.9017C3.96856 17.0794 3.22374 17.4356 2.59327 18.1487C2.55255 18.1948 2.55702 18.265 2.60324 18.3055C2.64946 18.3461 2.71993 18.3416 2.76065 18.2956C3.35694 17.6211 4.06193 17.2834 4.6193 17.1142C4.89793 17.0297 5.13895 16.9875 5.30972 16.9665C5.39506 16.9559 5.46272 16.9507 5.5086 16.9481C5.53153 16.9469 5.54901 16.9462 5.56052 16.9459C5.56627 16.9458 5.57053 16.9457 5.57323 16.9456L5.5761 16.9456L5.57664 16.9456L5.57666 16.9456Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.2051 15.5736C14.2051 15.5737 14.205 15.5737 14.2752 15.6601L14.205 15.5737C14.1571 15.6123 14.1497 15.6823 14.1885 15.73C14.2272 15.7776 14.2972 15.785 14.3451 15.7467C14.3451 15.7466 14.3452 15.7466 14.3452 15.7465C14.3452 15.7465 14.3452 15.7465 14.3452 15.7465L14.3464 15.7456C14.3477 15.7446 14.3501 15.7428 14.3534 15.7404C14.36 15.7355 14.3705 15.728 14.3851 15.7182C14.4143 15.6986 14.4596 15.6702 14.5217 15.6367C14.6458 15.5698 14.8372 15.4825 15.1012 15.4053C15.6287 15.2511 16.4487 15.1362 17.6045 15.3074C17.6654 15.3165 17.7221 15.2746 17.7312 15.2139C17.7403 15.1532 17.6982 15.0967 17.6373 15.0876C16.451 14.9119 15.5982 15.0284 15.0384 15.1921C14.7586 15.2739 14.5527 15.3673 14.4155 15.4413C14.3469 15.4783 14.2955 15.5104 14.2606 15.5338C14.2432 15.5455 14.2299 15.555 14.2206 15.5618C14.216 15.5652 14.2124 15.5679 14.2098 15.5699L14.2067 15.5724L14.2056 15.5732L14.2053 15.5735L14.2051 15.5736Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.2562 16.0222C14.2561 16.0222 14.2561 16.0222 14.275 16.1311L14.2561 16.0222C14.1954 16.0327 14.1547 16.0902 14.1653 16.1507C14.1758 16.2111 14.2334 16.2516 14.2941 16.2412C14.2941 16.2412 14.2941 16.2412 14.2941 16.2412C14.2941 16.2412 14.2941 16.2412 14.2941 16.2412C14.2941 16.2412 14.2941 16.2412 14.2941 16.2412C14.2942 16.2412 14.2942 16.2412 14.2942 16.2412L14.2944 16.2411L14.2965 16.2408C14.2985 16.2405 14.3019 16.24 14.3065 16.2393C14.3157 16.238 14.3299 16.2361 14.349 16.234C14.3872 16.2297 14.4449 16.2245 14.5208 16.221C14.6726 16.214 14.8972 16.2139 15.1842 16.2423C15.7581 16.2989 16.5824 16.4693 17.5741 16.9264C17.63 16.9521 17.6962 16.9278 17.7221 16.8722C17.7479 16.8165 17.7236 16.7504 17.6677 16.7247C16.652 16.2566 15.8033 16.0801 15.2062 16.0211C14.9078 15.9916 14.6723 15.9915 14.5105 15.999C14.4295 16.0027 14.367 16.0084 14.3242 16.0131C14.3028 16.0155 14.2863 16.0177 14.2749 16.0193C14.2692 16.0201 14.2647 16.0208 14.2616 16.0213L14.2579 16.0219L14.2567 16.0221L14.2563 16.0222L14.2562 16.0222Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.0523 16.9456C14.0522 16.9456 14.0522 16.9456 14.0522 16.9456C13.9907 16.9456 13.9408 16.8958 13.9408 16.8345C13.9408 16.7731 13.9907 16.7234 14.0523 16.7234V16.8345C14.0523 16.7234 14.0524 16.7234 14.0524 16.7234L14.0526 16.7234L14.053 16.7234L14.0543 16.7234L14.0586 16.7234C14.0623 16.7235 14.0676 16.7236 14.0744 16.7238C14.088 16.7241 14.1077 16.7249 14.1329 16.7263C14.1833 16.7291 14.2559 16.7347 14.3466 16.7459C14.5278 16.7682 14.7817 16.8128 15.0746 16.9017C15.6603 17.0794 16.4052 17.4356 17.0356 18.1487C17.0764 18.1948 17.0719 18.265 17.0257 18.3055C16.9794 18.3461 16.909 18.3416 16.8683 18.2956C16.272 17.6211 15.567 17.2834 15.0096 17.1142C14.731 17.0297 14.49 16.9875 14.3192 16.9665C14.2338 16.9559 14.1662 16.9507 14.1203 16.9481C14.0974 16.9469 14.0799 16.9462 14.0684 16.9459C14.0626 16.9458 14.0584 16.9457 14.0557 16.9456L14.0528 16.9456L14.0523 16.9456L14.0523 16.9456Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.51122 18.0525C9.68081 17.9324 9.9373 17.9252 10.1068 18.0453C10.1202 18.0548 10.1342 18.0644 10.1488 18.0741C10.3194 18.1874 10.5364 18.2892 10.7402 18.3719C10.9391 18.4526 10.939 18.7318 10.7294 18.7784C10.4614 18.838 10.1378 18.8889 9.81424 18.8889C9.47963 18.8889 9.14501 18.8345 8.87188 18.7723C8.66534 18.7253 8.66362 18.4546 8.86033 18.3762C9.08273 18.2876 9.31899 18.1808 9.47967 18.0741C9.49053 18.0669 9.50104 18.0597 9.51122 18.0525Z"
                        fill="white"
                      />
                      <path
                        d="M38.3945 3.27075C40.5386 3.27083 42.5266 3.80522 44.3584 4.87329C46.1904 5.94144 47.6427 7.38796 48.7148 9.21313C49.787 11.0383 50.3223 13.0297 50.3223 15.1868C50.3222 17.3438 49.7869 19.3247 48.7148 21.1292C47.6427 22.9335 46.1955 24.3644 44.374 25.4221C42.5526 26.4798 40.5594 27.009 38.3945 27.009C36.2295 27.009 34.2356 26.4799 32.4141 25.4221C30.5926 24.3644 29.1453 22.9335 28.0732 21.1292C27.0011 19.3247 26.4658 17.3438 26.4658 15.1868C26.4658 13.0297 27.0011 11.0383 28.0732 9.21313C29.1454 7.38796 30.5977 5.94144 32.4297 4.87329C34.2617 3.80514 36.2503 3.27075 38.3945 3.27075ZM22.8799 10.178C23.399 10.178 23.7927 10.3115 24.0605 10.5784C24.3284 10.8452 24.4629 11.237 24.4629 11.7542V25.0901C24.4629 25.6072 24.3283 25.999 24.0605 26.2659C23.7927 26.5327 23.399 26.6663 22.8799 26.6663H22.0479C21.5287 26.6663 21.1351 26.5327 20.8672 26.2659C20.5995 25.999 20.4658 25.6071 20.4658 25.0901V11.7542C20.4658 11.2371 20.5995 10.8452 20.8672 10.5784C21.1351 10.3115 21.5287 10.178 22.0479 10.178H22.8799ZM65.2324 3.61353C65.7511 3.61356 66.1485 3.75135 66.4248 4.02661C66.701 4.30182 66.8398 4.69752 66.8398 5.21411V6.05688C66.8398 6.57351 66.701 6.96916 66.4248 7.24438C66.1485 7.51965 65.7511 7.65744 65.2324 7.65747H56.9092V13.1018H64.2012C64.7198 13.1018 65.1182 13.2397 65.3945 13.5149C65.6708 13.7902 65.8086 14.1866 65.8086 14.7034V15.5452C65.8086 16.0619 65.6707 16.4584 65.3945 16.7336C65.1182 17.0088 64.7198 17.1467 64.2012 17.1467H56.9092V25.0149C56.9092 25.5486 56.767 25.9579 56.4824 26.2415C56.1978 26.525 55.7873 26.6662 55.252 26.6663H54.3828C53.8473 26.6663 53.437 26.5248 53.1523 26.2415C52.8677 25.9579 52.7246 25.5486 52.7246 25.0149V6.28247C52.7246 5.4179 52.9542 4.75634 53.4131 4.29907C53.872 3.84187 54.5357 3.61359 55.4033 3.61353H65.2324ZM81.4746 3.61353C81.9932 3.61359 82.3907 3.75138 82.667 4.02661C82.9431 4.30182 83.081 4.69757 83.0811 5.21411V6.05688C83.081 6.57345 82.9431 6.96916 82.667 7.24438C82.3907 7.51962 81.9932 7.65741 81.4746 7.65747H73.1514V13.1018H80.4434C80.9621 13.1018 81.3604 13.2397 81.6367 13.5149C81.913 13.7902 82.0508 14.1866 82.0508 14.7034V15.5452C82.0508 16.0619 81.9129 16.4584 81.6367 16.7336C81.3604 17.0089 80.9622 17.1467 80.4434 17.1467H73.1514V25.0149C73.1514 25.5486 73.0092 25.9579 72.7246 26.2415C72.44 26.525 72.0295 26.6662 71.4941 26.6663H70.624C70.0885 26.6662 69.6781 26.5249 69.3936 26.2415C69.109 25.9579 68.9668 25.5485 68.9668 25.0149V6.28247C68.9668 5.41785 69.1963 4.75634 69.6553 4.29907C70.1142 3.84184 70.7778 3.61356 71.6455 3.61353H81.4746ZM97.7168 3.61353C98.2354 3.61362 98.6329 3.75141 98.9092 4.02661C99.1852 4.30182 99.3232 4.69763 99.3232 5.21411V6.05688C99.3232 6.5734 99.1852 6.96917 98.9092 7.24438C98.6329 7.51959 98.2354 7.65737 97.7168 7.65747H89.3936V13.2581H96.8105C97.2962 13.2581 97.6648 13.3829 97.916 13.6331C98.1672 13.8833 98.2929 14.2507 98.293 14.7346V15.5139C98.2929 15.9811 98.1672 16.344 97.916 16.6028C97.6648 16.8615 97.2963 16.9914 96.8105 16.9915H89.3936V22.6223H97.7168C98.2354 22.6224 98.6329 22.7602 98.9092 23.0354C99.1853 23.3107 99.3232 23.7071 99.3232 24.2239V25.0657C99.3232 25.5824 99.1854 25.9789 98.9092 26.2542C98.633 26.5293 98.2353 26.6662 97.7168 26.6663H87.8877C87.0199 26.6663 86.3564 26.4379 85.8975 25.9807C85.4386 25.5235 85.2091 24.8627 85.209 23.9983V6.28247C85.209 5.41784 85.4385 4.75634 85.8975 4.29907C86.3564 3.84187 87.0199 3.61353 87.8877 3.61353H97.7168ZM109.757 3.61353C111.172 3.61353 112.454 3.95024 113.599 4.62427C114.743 5.29824 115.638 6.17491 116.283 7.25317C116.929 8.33169 117.252 9.45204 117.252 10.6135C117.252 11.7542 116.929 12.8694 116.283 13.9583C115.638 15.0467 114.743 15.9384 113.599 16.6331C113.392 16.7587 113.179 16.8719 112.963 16.9749L117.33 24.5686C117.666 25.1687 117.72 25.6684 117.491 26.0676C117.263 26.4668 116.823 26.6663 116.171 26.6663H115.156C114.653 26.6662 114.22 26.538 113.859 26.2815C113.499 26.025 113.177 25.6216 112.895 25.0715L109.06 17.676H106.197V25.0149C106.197 25.5486 106.055 25.9579 105.771 26.2415C105.486 26.5249 105.075 26.6663 104.54 26.6663H103.671C103.135 26.6662 102.725 26.5248 102.44 26.2415C102.156 25.9579 102.013 25.5486 102.013 25.0149V6.28247C102.013 5.41795 102.242 4.75633 102.701 4.29907C103.16 3.84189 103.824 3.61361 104.691 3.61353H109.757ZM38.3945 7.22192C36.9165 7.22192 35.5945 7.56489 34.4287 8.24927C33.2629 8.93371 32.3573 9.87736 31.7119 11.0803C31.0666 12.2833 30.7432 13.652 30.7432 15.1868C30.7432 16.7215 31.0666 18.085 31.7119 19.2776C32.3573 20.4702 33.2577 21.3981 34.4131 22.0618C35.5684 22.7254 36.8957 23.0579 38.3945 23.0579C39.8931 23.0578 41.2198 22.7253 42.375 22.0618C43.5304 21.3981 44.4308 20.4702 45.0762 19.2776C45.7215 18.085 46.0449 16.7215 46.0449 15.1868C46.0449 13.652 45.7215 12.2833 45.0762 11.0803C44.4308 9.87736 43.5252 8.93371 42.3594 8.24927C41.1937 7.56497 39.8723 7.222 38.3945 7.22192ZM106.197 13.6311H109.757C110.465 13.6311 111.069 13.4963 111.568 13.2268C112.068 12.9572 112.443 12.5941 112.692 12.1379C112.942 11.6817 113.067 11.1734 113.067 10.6135C113.067 10.0536 112.942 9.55063 112.692 9.10474C112.443 8.65887 112.068 8.30636 111.568 8.04712C111.069 7.7879 110.465 7.65747 109.757 7.65747H106.197V13.6311Z"
                        fill="black"
                      />
                      <path
                        d="M22.5283 0.222656C22.5285 2.60052 24.4026 4.54235 26.7598 4.66113L26.9893 4.66699C24.5255 4.66699 22.5283 6.65673 22.5283 9.11133C22.5283 6.73358 20.6537 4.7921 18.2969 4.67285L18.0674 4.66699C20.5307 4.66674 22.5281 2.6769 22.5283 0.222656Z"
                        fill="#1C5DFF"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M23.8659 33.7777C23.8659 33.7777 41.5943 33.1241 38.2798 32.9877C35.0631 32.8554 32.1779 30.5513 33.0007 29.5677C34.1261 28.2222 35.3277 24.3759 33.457 24.1111C31.4221 23.823 32.4533 25.6666 25.8734 27.7777C23.0223 28.6925 16.2823 27.6666 16.2823 27.6666L23.8659 33.7777Z"
                        fill="#1C5DFF"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_i_215_13030"
                        x="0"
                        y="9.33325"
                        width="19.6279"
                        height="4.04272"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset />
                        <feGaussianBlur stdDeviation="0.5" />
                        <feComposite
                          in2="hardAlpha"
                          operator="arithmetic"
                          k2="-1"
                          k3="1"
                        />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.880982 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="shape"
                          result="effect1_innerShadow_215_13030"
                        />
                      </filter>
                      <linearGradient
                        id="paint0_linear_215_13030"
                        x1="1.39671"
                        y1="9.33325"
                        x2="1.39671"
                        y2="13.1452"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#A7FFAC" />
                        <stop offset="1" stopColor="#00BAFF" />
                      </linearGradient>
                      <clipPath id="clip0_215_13030">
                        <rect width="120" height="40" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Collapse button - Hidden but functionality preserved */}
            {/* <button
              className={`collapse-button ${
                isSidebarCollapsed ? "collapsed" : ""
              }`}
              aria-label="Collapse sidebar"
              onClick={toggleSidebar}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4L4.7716 8.48149C3.84038 9.27968 3.84038 10.7203 4.7716 11.5185L10 16"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
                <path
                  d="M17 5L12.2785 8.37253C11.1618 9.17017 11.1618 10.8298 12.2785 11.6275L17 15"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </svg>
            </button> */}
          </div>

          {/* Navigation */}
          <div className="sidebar-nav">
            {/* School Match - Active */}
            <div className="nav-item-active">
              <div className="nav-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    cx="9.99956"
                    cy="5.68421"
                    rx="8.42045"
                    ry="5.68421"
                    fill="#1C5DFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.5791 5.68408H18.42C18.42 5.68408 17.7723 13.0525 17.7723 14.9472C17.7723 16.842 18.42 19.9999 18.42 19.9999H1.5791C1.5791 19.9999 2.22683 16.842 2.22683 14.9472C2.22683 13.0525 1.5791 5.68408 1.5791 5.68408Z"
                    fill="#1C5DFF"
                  />
                  <path
                    opacity="0.6"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.5 12C4.5 12 6.72115 13.0489 10 13.0489C13.2788 13.0489 15.5 12 15.5 12L15 20H5.00915L4.5 12Z"
                    fill="url(#paint0_linear_215_13035)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.625 10.9474C6.31332 10.9474 5.25 10.0049 5.25 8.84216C5.25 7.579 6.93747 7.83272 7.82986 7.34788C8.72225 6.86304 8.68753 6.52637 10 6.52637C11.3141 6.52637 11.2808 6.85738 12.1734 7.34058C12.9561 7.76428 14.75 7.579 14.75 8.84216C14.75 10.0049 13.6867 10.9474 12.375 10.9474C11.0633 10.9474 10 10.5312 10 9.36847C9.96798 10.5065 8.9165 10.9474 7.625 10.9474Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.76862 7.32229C9.90722 7.224 10.0928 7.224 10.2314 7.32229L11.3508 8.11613C11.6688 8.34163 11.5093 8.84241 11.1194 8.84241H8.88056C8.49072 8.84241 8.33118 8.34163 8.64918 8.11613L9.76862 7.32229Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.52273 2.10547C3.52273 2.10547 1.55335 2.25182 0.5 3.60413C1.55335 3.81823 1.87183 4.63178 1.87183 4.63178L2.89027 3.77922L3.52273 2.10547Z"
                    fill="#1C5DFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.4773 2.10547C16.4773 2.10547 18.4467 2.25182 19.5 3.60413C18.4467 3.81823 18.1282 4.63178 18.1282 4.63178L17.1097 3.77922L16.4773 2.10547Z"
                    fill="#1C5DFF"
                  />
                  <path
                    d="M10.0002 5.625C12.0989 5.625 13.8002 6.25 13.8002 6.25C13.8002 6.25 12.0989 5.85873 10.0002 5.85873C7.90151 5.85873 6.2002 6.25 6.2002 6.25C6.2002 6.25 7.90151 5.625 10.0002 5.625Z"
                    fill="white"
                  />
                  <path
                    d="M5.682 8.52008C5.682 8.52008 4.7104 7.75323 2.44336 8.08188"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.682 8.96673C5.682 8.96673 4.38654 8.74762 2.44336 9.62404"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.89764 9.63281C5.89764 9.63281 4.27832 9.63281 3.09082 10.9474"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14.318 8.52008C14.318 8.52008 15.2896 7.75323 17.5566 8.08188"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14.318 8.96673C14.318 8.96673 15.6135 8.74762 17.5566 9.62404"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14.1024 9.63281C14.1024 9.63281 15.7217 9.63281 16.9092 10.9474"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <g filter="url(#filter0_i_215_13035)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.5 5.23438C0.5 4.74328 0.797702 4.30353 1.26207 4.14369C2.79092 3.61746 6.39546 2.52637 10 2.52637C13.6045 2.52637 17.2091 3.61746 18.7379 4.14369C19.2023 4.30353 19.5 4.74328 19.5 5.23438V5.26138C19.5 5.96844 18.7829 6.46636 18.1094 6.25104C16.3536 5.68965 13.1768 4.84216 10 4.84216C6.82322 4.84216 3.64643 5.68965 1.89059 6.25104C1.21712 6.46636 0.5 5.96844 0.5 5.26138V5.23438Z"
                      fill="url(#paint1_linear_215_13035)"
                    />
                  </g>
                  <path
                    opacity="0.6"
                    d="M2.76758 4.42105C3.11296 4.22226 3.8382 4 4.06303 4"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <path
                    opacity="0.6"
                    d="M4.81836 3.82432C4.95395 3.78935 5.11152 3.75437 5.25018 3.75437"
                    stroke="white"
                    strokeWidth="0.25"
                    strokeLinecap="round"
                  />
                  <defs>
                    <filter
                      id="filter0_i_215_13035"
                      x="0.5"
                      y="2.52637"
                      width="19"
                      height="3.77539"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset />
                      <feGaussianBlur stdDeviation="0.4" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.880982 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_215_13035"
                      />
                    </filter>
                    <linearGradient
                      id="paint0_linear_215_13035"
                      x1="6.93269"
                      y1="10.1678"
                      x2="6.73676"
                      y2="18.1077"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0.01" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_215_13035"
                      x1="1.85201"
                      y1="2.52637"
                      x2="1.85201"
                      y2="6.13767"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#A7FFAC" />
                      <stop offset="1" stopColor="#00BAFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="nav-text-active">School Match</span>
            </div>

            {/* History */}
            <div className="nav-item">
              <div className="nav-item-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1H13C14.1046 1 15 1.89543 15 3V11"
                    stroke="black"
                  />
                  <path d="M4 5H12" stroke="black" strokeLinecap="round" />
                  <path d="M4 9H12" stroke="black" strokeLinecap="round" />
                  <path d="M4 13H8" stroke="black" strokeLinecap="round" />
                  <path
                    d="M15 15L15.7071 15.7071"
                    stroke="black"
                    strokeLinecap="round"
                  />
                  <path d="M15 15L15 13" stroke="black" strokeLinecap="round" />
                  <circle cx="15" cy="15" r="4" stroke="black" />
                  <circle cx="15" cy="15" r="4" stroke="black" />
                </svg>

                <span className="nav-text">History</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 6L9.53644 10.1563C8.73685 11.1158 7.26315 11.1158 6.46356 10.1563L3 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="sidebar-divider"></div>

          {/* User Profile */}
          <div className="sidebar-user">
            {/* User Profile Section */}
            <div className="user-profile">
              <div className="user-info">
                <div className="user-avatar">
                  <img
                    src="/images/bot-avatar.png"
                    alt="User Avatar"
                    className="avatar-image"
                  />
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {currentUserProfile?.user?.name ||
                     userProfile?.name ||
                     currentUserProfile?.user?.email?.split('@')[0] ||
                     userProfile?.email?.split('@')[0] ||
                     user?.email?.split('@')[0] ||
                     'User'}
                  </div>
                  <div className="user-badge">
                    {isAIData ? 'AI Analysis' : 'iOFFER Pro'}
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="chevron-right"
                >
                  <path
                    d="M6 3L10.1563 6.46356C11.1158 7.26315 11.1158 8.73685 10.1563 9.53644L6 13"
                    stroke="currentColor"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* Main Header - Contains the report title and info */}
        <div className="main-header">
          <div className="main-header-content">
            {/* Bot Avatar */}
            <div className="chat-avatar-container">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="20.0001"
                  cy="11.3684"
                  rx="16.8409"
                  ry="11.3684"
                  fill="#1C5DFF"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.15918 11.3684H36.841C36.841 11.3684 35.5455 26.1053 35.5455 29.8947C35.5455 33.6842 36.841 40 36.841 40H3.15918C3.15918 40 4.45463 33.6842 4.45463 29.8947C4.45463 26.1053 3.15918 11.3684 3.15918 11.3684Z"
                  fill="#1C5DFF"
                />
                <path
                  opacity="0.6"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 24C9 24 13.4423 26.0979 20 26.0979C26.5577 26.0979 31 24 31 24L30 40H10.0183L9 24Z"
                  fill="url(#paint0_linear_215_12725)"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.25 21.8948C12.6266 21.8948 10.5 20.0097 10.5 17.6843C10.5 15.158 13.8749 15.6654 15.6597 14.6958C17.4445 13.7261 17.3751 13.0527 20 13.0527C22.6282 13.0527 22.5617 13.7148 24.3468 14.6812C25.9122 15.5286 29.5 15.158 29.5 17.6843C29.5 20.0097 27.3734 21.8948 24.75 21.8948C22.1266 21.8948 20 21.0624 20 18.7369C19.936 21.0129 17.833 21.8948 15.25 21.8948Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.5372 14.6441C19.8144 14.4475 20.1856 14.4475 20.4628 14.6441L22.7016 16.2318C23.3376 16.6828 23.0186 17.6843 22.2389 17.6843H17.7611C16.9814 17.6843 16.6624 16.6828 17.2984 16.2318L19.5372 14.6441Z"
                  fill="black"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.04545 4.21045C7.04545 4.21045 3.1067 4.50316 1 7.20777C3.1067 7.63596 3.74367 9.26308 3.74367 9.26308L5.78053 7.55794L7.04545 4.21045Z"
                  fill="#1C5DFF"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M32.9545 4.21045C32.9545 4.21045 36.8933 4.50316 39 7.20777C36.8933 7.63596 36.2563 9.26308 36.2563 9.26308L34.2195 7.55794L32.9545 4.21045Z"
                  fill="#1C5DFF"
                />
                <path
                  d="M20.0004 11.25C24.1978 11.25 27.6004 12.5 27.6004 12.5C27.6004 12.5 24.1978 11.7175 20.0004 11.7175C15.803 11.7175 12.4004 12.5 12.4004 12.5C12.4004 12.5 15.803 11.25 20.0004 11.25Z"
                  fill="white"
                />
                <path
                  d="M11.364 17.0402C11.364 17.0402 9.42081 15.5065 4.88672 16.1638"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M11.364 17.9335C11.364 17.9335 8.77308 17.4952 4.88672 19.2481"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M11.7963 19.2654C11.7963 19.2654 8.55762 19.2654 6.18262 21.8946"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28.636 17.0402C28.636 17.0402 30.5792 15.5065 35.1133 16.1638"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28.636 17.9335C28.636 17.9335 31.2269 17.4952 35.1133 19.2481"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28.2037 19.2654C28.2037 19.2654 31.4424 19.2654 33.8174 21.8946"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <g filter="url(#filter0_i_215_12725)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1 10.4688C1 9.48655 1.5954 8.60706 2.52413 8.28738C5.58183 7.23492 12.7909 5.05273 20 5.05273C27.2091 5.05273 34.4182 7.23492 37.4759 8.28738C38.4046 8.60705 39 9.48655 39 10.4688V10.5228C39 11.9369 37.5658 12.9327 36.2188 12.5021C32.7071 11.3793 26.3536 9.68431 20 9.68431C13.6464 9.68431 7.29286 11.3793 3.78118 12.5021C2.43423 12.9327 1 11.9369 1 10.5228V10.4688Z"
                    fill="url(#paint1_linear_215_12725)"
                  />
                </g>
                <path
                  opacity="0.6"
                  d="M5.53418 8.84235C6.22494 8.44476 7.67543 8.00024 8.12509 8.00024"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <path
                  opacity="0.6"
                  d="M9.63672 7.64889C9.90791 7.57893 10.223 7.50898 10.5004 7.50898"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <defs>
                  <filter
                    id="filter0_i_215_12725"
                    x="1"
                    y="5.05273"
                    width="38"
                    height="7.55054"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="0.8" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.880982 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect1_innerShadow_215_12725"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_215_12725"
                    x1="13.8654"
                    y1="20.3356"
                    x2="13.4735"
                    y2="36.2155"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_215_12725"
                    x1="3.70401"
                    y1="5.05273"
                    x2="3.70401"
                    y2="12.2753"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#A7FFAC" />
                    <stop offset="1" stopColor="#00BAFF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="chat-title">
                {userProfile?.name || 'Your'}&apos;s personalized school match report
              </h1>
              <p className="chat-subtitle">generated on 2024/04/18</p>
            </div>
          </div>

          {/* Main Header Actions */}
          <div className="main-header-actions">
            <button className="chat-action-button" aria-label="Chat options">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="black"
                />
                <path d="M10 1V19" stroke="black" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body - Chat left, Recommendations right */}
        <div className="content-body">
          {/* Chat Interface - Left Side */}
          <div className="recommendations-chat-container">
            {/* Chat Messages and Assessment */}
            <div className="chat-messages-container">
              {/* Bot Message */}
              <div className="chat-message">
                <div className="chat-message-content">
                  <p className="chat-message-text">
                    Hi {userProfile?.name || 'there'} 🙌 Here&apos;s your personalized school match report
                    {isAIData ? ' generated by AI analysis' : ' based on the info you provided'}.
                    I hope it helps you better understand your competitiveness and the schools that fit you best!
                  </p>
                </div>
              </div>

              {/* Profile Summary */}
              {userProfile && isAIData && (
                <div className="profile-summary-container">
                  <h4 className="profile-summary-title">Your Profile Summary</h4>
                  <div className="profile-summary-card">
                    <div className="profile-stats-row">
                      {userProfile.gpa && (
                        <div className="profile-stat-item">
                          <span className="stat-label">GPA</span>
                          <span className="stat-value">{userProfile.gpa}</span>
                        </div>
                      )}
                      {userProfile.major && (
                        <div className="profile-stat-item">
                          <span className="stat-label">Major</span>
                          <span className="stat-value">{userProfile.major}</span>
                        </div>
                      )}
                      {userProfile.toefl && (
                        <div className="profile-stat-item">
                          <span className="stat-label">TOEFL</span>
                          <span className="stat-value">{userProfile.toefl}</span>
                        </div>
                      )}
                      {userProfile.nationality && (
                        <div className="profile-stat-item">
                          <span className="stat-label">Nationality</span>
                          <span className="stat-value">{userProfile.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Competitiveness Assessment */}
              <div className="assessment-card-standalone">
                  <div className="assessment-header">
                    <h2 className="assessment-title">
                      Your Competitiveness Assessment
                    </h2>
                  </div>

                  <div className="assessment-content">
                    {/* Score Section */}
                    <div className="assessment-score-section">
                      <div className="assessment-score-container">
                        <div className="assessment-score-display">
                          <span className="assessment-score-number">
                            {competitivenessLoading ? "..." : competitivenessData?.overallScore || 85}
                          </span>
                          <div className="assessment-score-details">
                            <span className="assessment-score-badge">
                              {competitivenessData?.overallScore ?
                                (competitivenessData.overallScore >= 80 ? "Highly Competitive" :
                                 competitivenessData.overallScore >= 65 ? "Competitive" :
                                 competitivenessData.overallScore >= 50 ? "Moderately Competitive" : "Needs Improvement") :
                                "Highly Competitive"
                              }
                            </span>
                            <span className="assessment-score-total">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="assessment-chart">
                      <CompetitivenessChart
                        chartData={competitivenessData?.chartData}
                      />
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="assessment-analysis">
                    <div className="assessment-analysis-header">
                      <div className="assessment-analysis-dot"></div>
                      <h3 className="assessment-analysis-title">
                        Analysis 1 title
                      </h3>
                    </div>
                    <p className="assessment-analysis-text">
                      For academic enhancement, enroll in advanced quantitative
                      courses (e.g., Python/Financial Modeling) to strength...
                    </p>
                    <button className="assessment-analysis-button">
                      View All ↓
                    </button>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="chat-action-buttons">
                <button className="chat-view-case-button">
                  View Application Case
                </button>
              </div>
            </div>

            {/* Chat Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="告诉小i你的想法吧～"
                  className="chat-input"
                />
                <button
                  className="chat-input-attach-button"
                  aria-label="Attach file"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M6.37156 15.2262L13.3849 8.42884C13.5842 8.23923 13.7431 8.01029 13.8517 7.75614C13.9603 7.50199 14.0163 7.22801 14.0163 6.9511C14.0163 6.67419 13.9603 6.40021 13.8517 6.14606C13.7431 5.89191 13.5842 5.66297 13.3849 5.47337C12.9722 5.08034 12.427 4.86151 11.8604 4.86151C11.2939 4.86151 10.7487 5.08034 10.336 5.47337L3.37244 12.2213C2.99358 12.5815 2.69162 13.0165 2.48521 13.4994C2.2788 13.9823 2.17231 14.5029 2.17231 15.0291C2.17231 15.5554 2.2788 16.076 2.48521 16.5589C2.69162 17.0418 2.99358 17.4768 3.37244 17.837C4.97244 19.3877 7.56622 19.3877 9.16622 17.837L16.232 10.9901C18.5893 8.70423 18.5893 4.99999 16.232 2.71409C13.8747 0.428188 10.0507 0.429088 7.69244 2.71409L2 8.23085"
                      stroke="currentColor"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="chat-input-send-button"
                  aria-label="Send message"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16" cy="16" r="16" fill="#CDD4E4" />
                    <path
                      d="M20.9912 10.0708C21.773 9.81023 22.5168 10.5541 22.2563 11.3359L17.9508 24.2523C17.6757 25.0777 16.5504 25.1825 16.1278 24.4222L13.7427 20.1284L16.0497 17.8214C16.44 17.4309 16.4399 16.7976 16.0497 16.4072C15.6593 16.0167 15.0261 16.0168 14.6355 16.4072L12.3657 18.6769L7.9049 16.1993C7.14455 15.7766 7.2494 14.6514 8.07477 14.3763L20.9912 10.0708Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* School Recommendations - Right Side */}
          <div className="recommendations-content">
            <div className="recommendations-content-inner">
              {/* Header */}
              <div className="recommendations-header">
                <h2 className="recommendations-title">Your School Selection</h2>
                <div className="recommendations-filters">
                  <button
                    className={`pill-category pill-button ${
                      selectedCategory === "target"
                        ? "pill-active"
                        : "pill-outline"
                    }`}
                    onClick={() => setSelectedCategory("target")}
                  >
                    Target Schools: {getCategoryCount("target")}
                  </button>
                  <button
                    className={`pill-category pill-button ${
                      selectedCategory === "fit"
                        ? "pill-active"
                        : "pill-outline"
                    }`}
                    onClick={() => setSelectedCategory("fit")}
                  >
                    Fit Schools: {getCategoryCount("fit")}
                  </button>
                  <button
                    className={`pill-category pill-button ${
                      selectedCategory === "safety"
                        ? "pill-active"
                        : "pill-outline"
                    }`}
                    onClick={() => setSelectedCategory("safety")}
                  >
                    Safety Schools: {getCategoryCount("safety")}
                  </button>
                </div>
              </div>

              {/* Summary Section */}
              <div className="summary-section">
                <div className="summary-header">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="summary-indicator"
                  >
                    <path
                      d="M10.1748 12.3481C10.384 12.5703 10.99 12.475 11.0049 12.4761C11.7923 13.9002 11.3869 14.1256 11.3779 14.1304C9.56822 15.1415 5.02816 14.4808 4.66113 14.1021C4.39481 13.8287 5.08158 12.4911 5.09082 12.4731C5.35401 12.6813 5.92719 12.3541 5.9375 12.3481C6.26593 12.7487 7.36512 12.4797 7.37988 12.4761C8.00665 13.0334 8.73242 12.4761 8.73242 12.4761C9.37291 12.7721 10.1536 12.3595 10.1748 12.3481ZM7.80957 1.3667C7.84658 1.35626 10.4774 0.633648 9.75977 6.45361C9.0472 12.2523 8.01422 12.0683 7.99316 12.064C6.50825 11.5809 5.95136 4.89288 6.18555 3.16943C6.41988 1.44661 7.80957 1.3667 7.80957 1.3667ZM2.67969 3.18994C3.77322 1.57792 5.2619 2.9128 5.28223 2.93115C4.76908 7.41622 6.6327 11.9473 6.6377 11.9595C4.72641 11.4176 1.63255 4.7341 2.67969 3.18994ZM10.7119 2.93115C10.7363 2.90917 12.2225 1.58272 13.3145 3.18994C14.3642 4.73426 11.2705 11.4174 9.35645 11.9595C9.36518 11.9382 11.2245 7.4117 10.7119 2.93115ZM0.0146484 6.66553C-0.179319 4.38094 1.6475 4.93898 1.66016 4.94287C1.79565 7.744 4.8411 11.7875 4.84473 11.7886C3.6392 11.3847 0.209453 8.95836 0.0146484 6.66553ZM14.3369 4.94287C14.365 4.93433 16.1785 4.39075 15.9854 6.66553C15.7906 8.9607 12.3611 11.3844 11.1553 11.7886C11.1664 11.7737 14.1988 7.73922 14.3369 4.94287Z"
                      fill="#F44949"
                    />
                    <path
                      d="M10.1748 12.3481C10.384 12.5703 10.99 12.475 11.0049 12.4761C11.7923 13.9002 11.3869 14.1256 11.3779 14.1304C9.56822 15.1415 5.02816 14.4808 4.66113 14.1021C4.39481 13.8287 5.08158 12.4911 5.09082 12.4731C5.35401 12.6813 5.92719 12.3541 5.9375 12.3481C6.26593 12.7487 7.36512 12.4797 7.37988 12.4761C8.00665 13.0334 8.73242 12.4761 8.73242 12.4761C9.37291 12.7721 10.1536 12.3595 10.1748 12.3481ZM7.80957 1.3667C7.84658 1.35626 10.4774 0.633648 9.75977 6.45361C9.0472 12.2523 8.01422 12.0683 7.99316 12.064C6.50825 11.5809 5.95136 4.89288 6.18555 3.16943C6.41988 1.44661 7.80957 1.3667 7.80957 1.3667ZM2.67969 3.18994C3.77322 1.57792 5.2619 2.9128 5.28223 2.93115C4.76908 7.41622 6.6327 11.9473 6.6377 11.9595C4.72641 11.4176 1.63255 4.7341 2.67969 3.18994ZM10.7119 2.93115C10.7363 2.90917 12.2225 1.58272 13.3145 3.18994C14.3642 4.73426 11.2705 11.4174 9.35645 11.9595C9.36518 11.9382 11.2245 7.4117 10.7119 2.93115ZM0.0146484 6.66553C-0.179319 4.38094 1.6475 4.93898 1.66016 4.94287C1.79565 7.744 4.8411 11.7875 4.84473 11.7886C3.6392 11.3847 0.209453 8.95836 0.0146484 6.66553ZM14.3369 4.94287C14.365 4.93433 16.1785 4.39075 15.9854 6.66553C15.7906 8.9607 12.3611 11.3844 11.1553 11.7886C11.1664 11.7737 14.1988 7.73922 14.3369 4.94287Z"
                      fill="white"
                      fillOpacity="0.5"
                    />
                  </svg>
                  <h3 className="summary-title">
                    {selectedCategory === "all"
                      ? `${schoolData.length} Schools Total`
                      : selectedCategory === "target"
                      ? `${getCategoryCount("target")} Target Schools`
                      : selectedCategory === "fit"
                      ? `${getCategoryCount("fit")} Fit Schools`
                      : `${getCategoryCount("safety")} Safety Schools`}
                  </h3>
                </div>
                <p className="summary-description">
                  {selectedCategory === "all" &&
                    "Here's a comprehensive overview of all recommended schools tailored to your profile. Each school has been carefully selected based on your academic background, research interests, and career goals."}
                  {selectedCategory === "target" &&
                    "These schools are highly competitive 🎯, usually attracting applicants with very strong research or top international backgrounds. With your GPA of 3.8 and Microsoft internship experience, you definitely have the potential to challenge these top programs — admission is tougher, but it's worth aiming high!"}
                  {selectedCategory === "fit" &&
                    "These schools are well-matched to your profile 🎯. They offer excellent programs in your field and have admission requirements that align well with your academic credentials and experience. These represent your strongest opportunities for admission."}
                  {selectedCategory === "safety" &&
                    "These schools provide solid backup options 🛡️. While they may be less competitive, they still offer quality programs and represent excellent opportunities where your admission chances are very high."}
                </p>
              </div>

              {/* School Cards */}
              <div className="schools-grid">
                {filteredSchools.map((school) => (
                  <SchoolRecommendationCard key={school.id} school={school} />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to render AI response content
function AIResponseRenderer({ content }: { content: string }) {
  // Split content into sections for better readability
  const sections = content.split(/(?=\d+\.\s+[A-Z])/);

  return (
    <div className="ai-response-content">
      {sections.map((section, index) => {
        if (section.trim().length === 0) return null;

        // Check if this is a university section
        const isUniversitySection = new RegExp('^\\d+\\.\\s+[A-Z]').test(section.trim());

        if (isUniversitySection) {
          const lines = section.split('\n');
          const title = lines[0];
          const content = lines.slice(1).join('\n');

          return (
            <div key={index} className="university-analysis">
              <h4 className="university-title">{title}</h4>
              <div className="university-content">
                {content.split('\n').map((line, lineIndex) => {
                  if (line.trim().length === 0) return null;

                  if (line.includes('Score:')) {
                    return (
                      <div key={lineIndex} className="score-line">
                        {line.trim()}
                      </div>
                    );
                  }

                  if (line.includes("Strategist's Note:")) {
                    return (
                      <div key={lineIndex} className="strategist-note">
                        <strong>💡 {line.trim()}</strong>
                      </div>
                    );
                  }

                  return (
                    <p key={lineIndex} className="analysis-text">
                      {line.trim()}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        } else {
          // General content section
          return (
            <div key={index} className="general-analysis">
              {section.split('\n').map((line, lineIndex) => {
                if (line.trim().length === 0) return null;
                return (
                  <p key={lineIndex} className="analysis-text">
                    {line.trim()}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}
