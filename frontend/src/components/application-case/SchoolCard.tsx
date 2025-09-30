import Image from "next/image";

export default function SchoolCard() {
  return (
    <div className="school-info-section" style={{ position: "relative" }}>
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

      {/* Share 区域 */}
        <div 
          style={{
            position: "absolute",
            bottom: "10px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            color: "#1c5dff",
            fontSize: "12px",
            fontWeight: 500
          }}
        >
          <Image 
            src="/images/icon-16-通用.svg"
            alt="share"
            width={14}
            height={14}
          />
          <span>Share</span>
        </div>


      {/* 底部右侧指标 */}
      <div style={{
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
        
        {/* 六边形容器 */}
        <div style={{
          display: "flex",
          gap: "0px",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: "55%",
          left: "68%",
          transform: "translate(-50%, -50%)",
          zIndex: 1
        }}>
          {/* 第一个六边形 */}
          <div style={{ position: "relative", textAlign: "center", flexShrink: 0 }}>
            <Image
              src="/images/六边形地图册.svg"
              alt="hexagon"
              width={140}
              height={140}
            />
            <div style={{
              position: "absolute",
              top: "45%",
              left: "51%",
              transform: "translate(-50%, -50%)"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1c5dff"
              }}>89%</h3>
              <p style={{ 
                margin: 0,
                fontSize: "10px",
                color: "#999",
                whiteSpace: "nowrap"
              }}>Admission Rate</p>
            </div>
          </div>
          {/* 第二个六边形 */}
          <div style={{ position: "relative", textAlign: "center", flexShrink: 0 }}>
            <Image
              src="/images/六边形地图册.svg"
              alt="hexagon"
              width={140}
              height={140}
            />
            <div style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1c5dff"
              }}>4.8</h3>
              <p style={{ 
                margin: 0,
                fontSize: "11px",
                color: "#999"
              }}>Perfect Fit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
