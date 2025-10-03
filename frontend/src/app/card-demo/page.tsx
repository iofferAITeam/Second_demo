import UniversityRecommendationCard from '@/components/UniversityRecommendationCard';

export default function CardDemoPage() {
  const sampleData = {
    universityName: "University name text text text...",
    projectName: "Project name text text text text text text",
    location: "Cambridge, USA",
    duration: "15 months",
    tuition: "Annual tuition $12,615",
    toefl: "TOEFL 110",
    employmentRate: "High employment rate",
    admissionRate: 89,
    perfectFit: 4.8,
    matchLevel: "Exceptional",
    matchScore: 4.8,
    recommendationText: `Your compatibility with the University of Pennsylvania's Global Marketing Management graduate program stands at an impressive 4.8/5, with distinct strengths that align closely with the program's priorities—particularly in how your profile effectively offsets minor gaps through standout academic performance and relevant experience.

Academically, while your undergraduate institution may not rank among the most elite, your exceptional GPA and strong performance in marketing-focused electives serve as robust evidence of your academic rigor. This track record not only demonstrates your ability to excel in quantitative and strategic coursework but also signals readiness for the program's intensive curriculum, from global brand management to data-driven marketing analytics. Your practical experience in digital marketing campaigns and market research further strengthens your application, showing you can bridge theoretical knowledge with real-world application.

The program's emphasis on global perspectives aligns well with your international background and language skills, while your demonstrated leadership in student organizations and volunteer work indicates the collaborative mindset essential for the program's team-based projects. Your clear career goals in international marketing, combined with your understanding of emerging digital trends, position you as an ideal candidate who can contribute meaningfully to classroom discussions and post-graduation success.`
  };

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

        <UniversityRecommendationCard {...sampleData} />
      </div>
    </div>
  );
}