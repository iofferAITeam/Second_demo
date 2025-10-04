"use client";

import { useState } from "react";
import { RatingHex } from "./RatingHex";
import { CardBackground } from "./CardBackground";
import HexagonalRatings from "./HexagonalRatings";
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
  // AI recommendation scores
  academic?: number;
  practical?: number;
  language?: number;
  fit?: number;
  note?: string;
}

interface SchoolRecommendationCardProps {
  school: SchoolData;
}

export default function SchoolRecommendationCard({
  school,
}: SchoolRecommendationCardProps) {
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Match Analysis");

  // 根据fitScore分数来确定颜色：5-4分蓝色，4-3分绿色，3-2分黄色，2-0分红色
  const getColorByScore = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 4) return "blue";
    if (numScore >= 3) return "green";
    if (numScore >= 2) return "yellow";
    return "red";
  };
  const colorKey = getColorByScore(school.fitScore);

  const tabs = [
    "Match Analysis",
    "Academic",
    "Language",
    "Specialization",
    "Professional Experience",
    "Preference & Other Advice",
  ];

  const getTabContent = (tab: string) => {
    switch (tab) {
      case "Match Analysis":
        return `This ${school.name} program shows excellent alignment with your academic background and career goals. The program's curriculum and research opportunities match well with your interests and qualifications.`;
      case "Academic":
        return `Your academic credentials align well with ${school.name}'s admission standards. The program's rigorous curriculum will challenge you while building upon your existing knowledge base.`;
      case "Language":
        return `The TOEFL requirement of ${school.toefl} matches your proficiency level. The university offers excellent language support services to help international students succeed.`;
      case "Specialization":
        return `The ${school.program} program offers specialized tracks that align with your career interests and academic background.`;
      case "Professional Experience":
        return `Your professional background complements this program well. The university's industry connections will help you leverage your experience for career advancement.`;
      case "Preference & Other Advice":
        return `Based on your preferences for location and program type, this university offers an ideal environment for your studies and career development.`;
      default:
        return `Detailed analysis for ${school.name} program.`;
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleAnalysis = () => {
    setIsAnalysisVisible(!isAnalysisVisible);
  };

  return (
    <div
      className={`school-analysis-container ${
        isAnalysisVisible ? "with-expanded-content" : ""
      }`}
    >
      {/* 推荐卡片容器 */}
      <div className={`school-card ${isAnalysisVisible ? "expanded" : ""}`}>
        {/* Decorative wave background on right */}
        <div className="school-card-decorative-container">
          <CardBackground color={colorKey} />
        </div>

        <div className="card-content">
          <div className="card-info">
            <div className="card-header">
              <div className="card-icon" />
              <span className="card-school-name">{school.name}</span>
              <span className="pill pill-service-type">
                {school.schoolType}
              </span>
            </div>
            <h4 className="card-program-title">{school.program}</h4>
            <div className="card-details">
              {school.location?.trim() && (
                <span className="card-location">📍 {school.location}</span>
              )}
              {school.duration?.trim() && (
                <span className="pill-bullet pill-outline">
                  {school.duration}
                </span>
              )}
              {school.tuition?.trim() && (
                <span className="pill-bullet pill-outline">
                  Annual tuition {school.tuition}
                </span>
              )}
              {school.toefl?.trim() && (
                <span className="pill-bullet pill-outline">
                  TOEFL {school.toefl}
                </span>
              )}
              {school.employment?.trim() && (
                <span className="pill-bullet pill-blue-text">
                  {school.employment}
                </span>
              )}
            </div>
          </div>

          {/* AI Rating Scores Section - Use both RatingHex and HexagonalRatings */}
          <div className="card-ratings">
            <RatingHex
              value={school.admissionRate}
              label="Admission Rate"
              color={colorKey}
            />
            <RatingHex
              value={school.fitScore}
              label={school.fitLabel}
              color={colorKey}
            />
          </div>

          {/* AI Rating Scores Section - Hexagonal Design */}
          <HexagonalRatings
            academic={school.academic}
            practical={school.practical}
            language={school.language}
            fit={school.fit}
            cardColor={colorKey}
          />

          <button className="analysis-button" onClick={toggleAnalysis}>
            {isAnalysisVisible ? "Hide Analysis ↑" : "View Analysis ↓"}
          </button>
        </div>
      </div>

      {/* 展开的分析内容 - 移到 school-card 外部 */}
      {isAnalysisVisible && (
        <div className={`card-content-frame ${colorKey}`}>
          {/* 标签导航 */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab-pill ${colorKey} ${
                  activeTab === tab ? `active` : ""
                }`}
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
                <img
                  src={`/images/background-hex/${colorKey}.svg`}
                  alt="Rating Background"
                  className="rating-bg-svg"
                />
              </div>
              <div className="rating-content">
                <span className="large-score">{school.fitScore}</span>
                <div className={`match-level-badge ${colorKey}`}>
                  <span>Match Level: {school.fitLabel}</span>
                </div>
              </div>
            </div>

            <div className="recommendation-content">
              <h3 className="recommendation-title">
                {activeTab === "Match Analysis"
                  ? "· Reasons for Recommendation"
                  : `· ${activeTab} Assessment`}
              </h3>
              <div className="recommendation-text">
                <p>{getTabContent(activeTab)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}