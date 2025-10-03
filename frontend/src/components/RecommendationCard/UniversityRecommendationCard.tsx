'use client';

import React, { useState } from 'react';

interface UniversityRecommendationCardProps {
  universityName: string;
  projectName: string;
  location: string;
  duration: string;
  tuition: string;
  toefl: string;
  employmentRate: string;
  admissionRate: number;
  perfectFit: number;
  matchLevel: string;
  matchScore: number;
  recommendationText: string;
}

const UniversityRecommendationCard: React.FC<UniversityRecommendationCardProps> = ({
  universityName,
  projectName,
  location,
  duration,
  tuition,
  toefl,
  employmentRate,
  admissionRate,
  perfectFit,
  matchLevel,
  matchScore,
  recommendationText
}) => {
  const [activeTab, setActiveTab] = useState('Match Analysis');
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(true);

  const tabs = [
    'Match Analysis',
    'Academic',
    'Language',
    'Specialization',
    'Professional Experience',
    'Preference & Other Advice'
  ];

  const getTabContent = (tab: string) => {
    switch (tab) {
      case 'Match Analysis':
        return recommendationText;
      case 'Academic':
        return "Your undergraduate GPA of 3.8 and strong performance in mathematics and statistics courses demonstrate excellent academic preparation for this program. The university's rigorous curriculum will challenge you while building upon your existing knowledge base.";
      case 'Language':
        return "Your TOEFL score of 105 meets the program requirements and indicates strong English proficiency. The university offers excellent language support services and the program includes technical writing courses to further enhance your communication skills.";
      case 'Specialization':
        return "The program's focus on artificial intelligence and data analytics aligns perfectly with your stated career interests. The university's research facilities and industry partnerships provide excellent opportunities for hands-on experience in your chosen specialization.";
      case 'Professional Experience':
        return "Your 2 years of experience in software development, combined with your internship at a tech startup, provides a solid foundation for this program. The university's strong industry connections will help you leverage this experience for career advancement.";
      case 'Preference & Other Advice':
        return "Given your preference for urban environments and interest in startup culture, this university's location in a major tech hub is ideal. The program's flexible scheduling and strong alumni network will support your career transition goals.";
      default:
        return recommendationText;
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleAnalysis = () => {
    setIsAnalysisVisible(!isAnalysisVisible);
  };

  return (
    <div className="university-card-container">
      {/* 第一个Frame: 推荐卡片 - 上半部分 */}
      <div className="card-header-frame">
        <div className="header-content">
          <div className="university-info-section">
            <div className="university-header">
              <img src="/学校logo.svg" alt="University Logo" className="university-logo" />
              <span className="university-name">{universityName}</span>
              <div className="cooperation-badge">iOFFER 合作</div>
            </div>
            <h2 className="project-name">{projectName}</h2>
            <div className="program-attributes">
              <div className="location-item">
                <img src="/通用2.svg" alt="Location Icon" className="location-icon" />
                <span>{location}</span>
              </div>
              <div className="divider"></div>
              <div className="attribute-pill">{duration}</div>
              <div className="attribute-pill">{tuition}</div>
              <div className="attribute-pill">{toefl}</div>
              <div className="attribute-pill employment">{employmentRate}</div>
            </div>
          </div>
          <div className="share-section">
            <img src="/通用.svg" alt="Share Icon" className="share-icon" />
            <span>Share</span>
          </div>
        </div>

        <div className="rating-section">
          <div className="rating-background">
            <img src="/rectangle.svg" alt="Rating Background" className="rating-bg-svg" />
          </div>
          <div className="hexagon-container">
            <div className="hexagon-rating">
              <img src="/六边形地图册.svg" alt="Hexagon" className="hexagon-svg" />
              <span className="hexagon-value">{admissionRate}%</span>
              <span className="hexagon-label">Admission Rate</span>
            </div>
            <div className="hexagon-rating">
              <img src="/六边形地图册.svg" alt="Hexagon" className="hexagon-svg" />
              <span className="hexagon-value">{perfectFit}</span>
              <span className="hexagon-label">Perfect Fit</span>
            </div>
          </div>
          <div className="hide-analysis-section">
            <span>Hide Analysis</span>
            <img src="/通用3.svg" alt="Arrow Icon" className="arrow-icon" />
          </div>
        </div>
      </div>

      {/* 第二个Frame: 标签页和内容 - 下半部分 */}
      {isAnalysisVisible && (
        <div className="card-content-frame">
          {/* 标签导航 */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                <span>{tab}</span>
              </div>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="content-area">
            <div className="rating-display">
              <div className="rating-background-large">
                <img src="/评分bg.svg" alt="Rating Background" className="rating-bg-svg" />
              </div>
              <div className="rating-content">
                <span className="large-score">{matchScore}</span>
                <div className="match-level-badge">
                  <span>Match Level: {matchLevel}</span>
                </div>
              </div>
            </div>

            <div className="recommendation-content">
              <h3 className="recommendation-title">
                {activeTab === 'Match Analysis' ? '· Reasons for Recommendation' : `· ${activeTab} Assessment`}
              </h3>
              <div className="recommendation-text">
                <p>{getTabContent(activeTab)}</p>
              </div>
              <div className="content-divider"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityRecommendationCard;
