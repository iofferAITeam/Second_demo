"use client";

import CompetitivenessChart from "./recommendations/CompetitivenessChart";

export default function ChatContent() {
  return (
    <div className="chat-content">
      {/* Chat Messages and Assessment */}
      <div className="chat-messages-container">
        {/* Bot Message */}
        <div className="chat-message">
          <div className="chat-message-content">
            <p className="chat-message-text">
              Hi Nick 🙌 Here&apos;s your personalized school match report based
              on the info you provided. I hope it helps you better understand
              your competitiveness and the schools that fit you best!
            </p>
          </div>
        </div>

        {/* Competitiveness Assessment */}
        <div className="assessment-card">
          <div className="assessment-card-inner">
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
                    <span className="assessment-score-number">85</span>
                    <div className="assessment-score-details">
                      <span className="assessment-score-badge">
                        Highly Competitive
                      </span>
                      <span className="assessment-score-total">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="assessment-chart-section">
                <div className="assessment-chart-container">
                  <CompetitivenessChart />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="assessment-metrics">
                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon academic"></div>
                    <span className="assessment-metric-label">
                      Academic Performance
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">92</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>

                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon research"></div>
                    <span className="assessment-metric-label">
                      Research Experience
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">78</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>

                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon internship"></div>
                    <span className="assessment-metric-label">
                      Internship & Work Experience
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">88</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>

                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon extracurricular"></div>
                    <span className="assessment-metric-label">
                      Extracurriculars
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">75</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>

                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon test-score"></div>
                    <span className="assessment-metric-label">
                      Standardized Test Score
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">85</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>

                <div className="assessment-metric">
                  <div className="assessment-metric-header">
                    <div className="assessment-metric-icon recommendation"></div>
                    <span className="assessment-metric-label">
                      Recommendation letters
                    </span>
                  </div>
                  <div className="assessment-metric-score">
                    <span className="assessment-metric-number">82</span>
                    <span className="assessment-metric-total">/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
