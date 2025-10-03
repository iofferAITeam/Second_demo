import UniversityRecommendationCard from '@/components/RecommendationCard/UniversityRecommendationCard';
import '@/styles/university-card.css';

export default function CardDemoPage() {
  // Hardcoded data based on AI service response structure from ChatController
  const hardcodedRecommendations = [
    {
      id: "1",
      schoolName: "Carnegie Mellon University",
      programName: "Master of Science in Computer Science",
      academicScore: 4.8,
      practicalScore: 4.5,
      languageScore: 4.2,
      fitScore: 4.7,
      strategistNote: "Exceptional match for your profile with strong research opportunities and industry connections.",
      analysisContent: "Academic Background Score: 4.8/5\nPractical Experience Score: 4.5/5\nLanguage Proficiency Score: 4.2/5\nOverall Fit Score: 4.7/5\nStrategist's Note: Exceptional match for your profile with strong research opportunities and industry connections.",
      location: "Pittsburgh, PA",
      tuition: "$58,924",
      duration: "2 years",
      toeflRequirement: "102",
      admissionRate: "15-25%",
      schoolType: "One Click Apply",
      category: "target",
      displayOrder: 1
    },
    {
      id: "2", 
      schoolName: "Stanford University",
      programName: "Master of Science in Computer Science",
      academicScore: 4.9,
      practicalScore: 4.6,
      languageScore: 4.3,
      fitScore: 4.8,
      strategistNote: "Top-tier program with excellent research facilities and strong startup ecosystem.",
      analysisContent: "Academic Background Score: 4.9/5\nPractical Experience Score: 4.6/5\nLanguage Proficiency Score: 4.3/5\nOverall Fit Score: 4.8/5\nStrategist's Note: Top-tier program with excellent research facilities and strong startup ecosystem.",
      location: "Stanford, CA",
      tuition: "$58,416",
      duration: "2 years", 
      toeflRequirement: "100",
      admissionRate: "15-25%",
      schoolType: "One Click Apply",
      category: "target",
      displayOrder: 2
    },
    {
      id: "3",
      schoolName: "UC Berkeley",
      programName: "Master of Science in Computer Science",
      academicScore: 4.6,
      practicalScore: 4.4,
      languageScore: 4.1,
      fitScore: 4.5,
      strategistNote: "Strong program with excellent faculty and research opportunities in AI and machine learning.",
      analysisContent: "Academic Background Score: 4.6/5\nPractical Experience Score: 4.4/5\nLanguage Proficiency Score: 4.1/5\nOverall Fit Score: 4.5/5\nStrategist's Note: Strong program with excellent faculty and research opportunities in AI and machine learning.",
      location: "Berkeley, CA",
      tuition: "$44,007",
      duration: "2 years",
      toeflRequirement: "90",
      admissionRate: "15-25%",
      schoolType: "One Click Apply",
      category: "target",
      displayOrder: 3
    },
    {
      id: "4",
      schoolName: "Georgia Tech",
      programName: "Master of Science in Computer Science",
      academicScore: 4.3,
      practicalScore: 4.2,
      languageScore: 4.0,
      fitScore: 4.2,
      strategistNote: "Excellent value with strong industry connections and practical curriculum focus.",
      analysisContent: "Academic Background Score: 4.3/5\nPractical Experience Score: 4.2/5\nLanguage Proficiency Score: 4.0/5\nOverall Fit Score: 4.2/5\nStrategist's Note: Excellent value with strong industry connections and practical curriculum focus.",
      location: "Atlanta, GA",
      tuition: "$29,140",
      duration: "2 years",
      toeflRequirement: "100",
      admissionRate: "15-25%",
      schoolType: "iOffer Cooperation",
      category: "fit",
      displayOrder: 4
    },
    {
      id: "5",
      schoolName: "University of Washington",
      programName: "Master of Science in Computer Science",
      academicScore: 4.1,
      practicalScore: 4.0,
      languageScore: 3.9,
      fitScore: 4.0,
      strategistNote: "Good program with strong research opportunities and reasonable cost.",
      analysisContent: "Academic Background Score: 4.1/5\nPractical Experience Score: 4.0/5\nLanguage Proficiency Score: 3.9/5\nOverall Fit Score: 4.0/5\nStrategist's Note: Good program with strong research opportunities and reasonable cost.",
      location: "Seattle, WA",
      tuition: "$36,898",
      duration: "2 years",
      toeflRequirement: "92",
      admissionRate: "15-25%",
      schoolType: "iOffer Cooperation",
      category: "fit",
      displayOrder: 5
    }
  ];

  // Convert AI service data to component props format
  const convertToCardProps = (recommendation: any) => ({
    universityName: recommendation.schoolName,
    projectName: recommendation.programName,
    location: recommendation.location,
    duration: recommendation.duration,
    tuition: `Annual tuition ${recommendation.tuition}`,
    toefl: `TOEFL ${recommendation.toeflRequirement}`,
    employmentRate: "High employment rate",
    admissionRate: Math.round(parseFloat(recommendation.admissionRate.replace('%', '').split('-')[0])),
    perfectFit: recommendation.fitScore,
    matchLevel: recommendation.fitScore >= 4.5 ? "Exceptional" : recommendation.fitScore >= 4.0 ? "Excellent" : "Good",
    matchScore: recommendation.fitScore,
    recommendationText: `Your compatibility with ${recommendation.schoolName}'s ${recommendation.programName} stands at an impressive ${recommendation.fitScore}/5, with distinct strengths that align closely with the program's priorities.

Academically, your strong GPA and performance in computer science courses demonstrate excellent preparation for this program. The university's rigorous curriculum will challenge you while building upon your existing knowledge base in algorithms, data structures, and software engineering.

Your practical experience in software development and relevant projects further strengthens your application, showing you can bridge theoretical knowledge with real-world application. The program's emphasis on cutting-edge research aligns well with your career goals in technology.

${recommendation.strategistNote}`
  });

  // Use the first recommendation as the main display
  const sampleData = convertToCardProps(hardcodedRecommendations[0]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#1a1a1a',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          University Recommendation Card Demo
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center'
        }}>
          {hardcodedRecommendations.map((recommendation, index) => (
            <div key={recommendation.id} style={{ width: '100%' }}>
              <h2 style={{
                textAlign: 'center',
                marginBottom: '20px',
                color: '#1a1a1a',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Recommendation #{index + 1}: {recommendation.schoolName}
              </h2>
              <UniversityRecommendationCard {...convertToCardProps(recommendation)} />
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '60px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1a1a1a', marginBottom: '16px' }}>
            Data Structure Information
          </h3>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
            This demo uses hardcoded data that matches the structure returned by the AI service. 
            The data includes academic scores, practical experience scores, language proficiency scores, 
            and overall fit scores, along with detailed university information and strategist notes.
          </p>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#888',
            fontFamily: 'monospace',
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '6px',
            textAlign: 'left',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(hardcodedRecommendations[0], null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
