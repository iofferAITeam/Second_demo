import Image from "next/image";

export default function SchoolSelectionPlan() {
  return (
    <section className="school-plan">
      {/* 标题 */}
      <h3  style={{
        fontFamily: "PingFang SC, sans-serif",
        fontSize: "20px",
        fontWeight: 600,
        lineHeight: "100%",
        color: "#000000",
      }}>Her School Selection Plan</h3>

      {/* Tab 按钮组 */}
      <div className="tab-buttons">
        <button className="tab-button active">Target Schools: 3</button>
        <button className="tab-button">Fit Schools: 4</button>
        <button className="tab-button">Safety Schools: 3</button>
      </div>

      {/* Tab 内容区 */}
      <div className="tab-content">
        <div className="tab-header">
          <Image
            src="/images/icon-24-通用.svg"
            alt="icon"
            width={16}
            height={16}
            className="tab-icon"
          />
          <span><strong>3 Target Schools</strong></span>
        </div>
        <p>
          Introduction content  enhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strengthenhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strengthenhancement, enroll in advanced quantitative courses (e.g., Python/Financial Modeling) to strength
        </p>
      </div>
    </section>
  );
}
