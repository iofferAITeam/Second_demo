import Image from "next/image";

export default function SchoolCard() {
  return (
    <div className="school-info-section">
      {/* 上半部分：学校名 + 项目名 */}
      <div className="school-card-header">
        <p className="school-name">
          <Image
            src="/images/学校logo.svg"
            alt="icon"
            width={14}
            height={14}
            className="school-icon"
          />
          University name text text text text text text text text text text text text…
          <span className="offer-tag"
          style={{
          backgroundColor: "#1c5dff", // 蓝色背景
          color: "#fff",              // 白色文字
          padding: "2px 6px",
          borderRadius: "12px",
          fontSize: "12px",
        }}>OFFER 合作</span>
        </p>
        <h4 className="project-name">
          Project name text text text text text text text text text text text text text…
        </h4>
      </div>

      {/* 中间部分：标签 */}
      <div className="school-tags">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <Image
            src="/images/icon-12-通用.svg"
            alt="icon"
            width={15}
            height={15}
          />
          Cambridge, USA
        </span>
        <span className="tag">15 months</span>
        <span className="tag">Annual tuition $12,615</span>
        <span className="tag">TOEFL 110</span>
        <span className="profile-tag">High employment rate</span>
      </div>

      {/* 底部右侧指标 */}
      <div className="school-card-footer" style={{
        width: "438px",
        height: "180px",
        position: "relative",
        marginLeft: "auto",
        marginTop: "-141px", 
        marginRight: "-20px",
        marginBottom: "-20px"
      }}>
        {/* 背景图 */}
        <Image
          src="/images/评分bg.svg"
          alt="score background"
          fill
          className="score-bg"
        />
      </div>
    </div>
  );
}
