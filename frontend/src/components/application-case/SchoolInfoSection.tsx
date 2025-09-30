import Image from "next/image";

export default function SchoolInfoSection() {
  return (
    <section className="school-info-section">
      {/* 用户名 */}
      <div className="user-block">
        <Image
          src="/images/photo images.svg"   
          alt="user icon"
          width={20}
          height={20}
          className="user-icon"
        />
        <h2 className="user-name">Nickyouth</h2>
      </div>

      {/* 学校列表 */}
      <div className="school-list">
        <p>California College of the Arts – MA Interaction Text TextTextText Design</p>
        <p>California College of the Arts – MA Interaction Text TextTextTextText Design</p>
        <p>University name – Major name</p>
      </div>

      {/* 背景信息 */}
      <div className="background-tags">
        <span className="tag">GPA 3.50</span>
        <span className="tag">IELTS 6.5</span>
        <span className="tag">Intended Major: Interaction Design</span>
        <span className="tag">Target Country: US</span>
      </div>

      {/* 个人标签 */}
      <div className="profile-tags">
        <span className="profile-tag">Unique Personal Profile tag</span>
        <span className="profile-tag">Unique Personal Profile tag</span>
        <span className="profile-tag">Unique Personal Profile tag</span>
      </div>
    </section>
  );
}
