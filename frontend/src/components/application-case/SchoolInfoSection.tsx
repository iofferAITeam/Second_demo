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

      {/* Offer Results */}
      <div className="offer-results">
        <ul>
          <li>
            <span className="offer-label">Offer results</span>
            <div className="offer-item">
              <Image
                src="/images/icon-24-通用.svg"
                alt="school icon"
                width={16}
                height={16}
                className="offer-icon"
              />
              <span>California College of the Arts – MA Interaction Text TextTextText Design</span>
            </div>
          </li>
          <li>
            <span className="offer-label"></span>
            <div className="offer-item">
              <Image
                src="/images/icon-24-通用.svg"
                alt="school icon"
                width={16}
                height={16}
                className="offer-icon"
              />
              <span>California College of the Arts – MA Interaction Text TextTextTextText Design TextTextTextText</span>
            </div>
          </li>
          <li>
            <span className="offer-label"></span>
            <div className="offer-item">
              <Image
                src="/images/icon-24-通用.svg"
                alt="school icon"
                width={16}
                height={16}
                className="offer-icon"
              />
              <span>University name – Major name</span>
            </div>
          </li>
        </ul>
      </div>

      {/* 背景信息 */}
      <div className="background">
        <div className="background-row">
          <span className="offer-label">Background</span>
          <div className="background-tags">
            <span className="tag">GPA 3.80</span>
            <span className="tag">IELTS 6.5</span>
            <span className="tag">Intended Major: Interaction Design</span>
            <span className="tag">Target Country: UK</span>
          </div>
        </div>

        <div className="background-row">
          <span className="section-label"></span>
          <div className="profile-tags">
            <span className="profile-tag">Unique Personal Profile tag</span>
            <span className="profile-tag">Unique Personal Profile tag</span>
            <span className="profile-tag">Unique Personal Profile tag</span>
            <span className="profile-tag">Unique Personal Profile tag</span>
            <span className="profile-tag">Unique Personal Profile tag</span>
            <span className="profile-tag">Unique Personal Profile tag</span>
          </div>
        </div>
      </div>
    </section>
  );
}
