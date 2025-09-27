import Image from 'next/image'

export default function PrivacySection() {
  return (
    <section className="privacy-section">
      <div className="privacy-container">
        <div className="privacy-icon" style={{transform: 'translateX(280px) translateY(-30px)'}}>
          <Image src="/images/icon-success.png" alt="Success" width={80} height={80} />
        </div>
        <div className="privacy-content">
          <h3>Don't Worry!</h3>
          <h2>Your Privacy is Guaranteed</h2>

          <div className="privacy-badges">
            <div className="privacy-badge">
              <span className="badge-icon">🔒</span>
              <span className="badge-text">Secure</span>
            </div>
            <div className="privacy-badge">
              <span className="badge-icon">🛡️</span>
              <span className="badge-text">Encrypted</span>
            </div>
            <div className="privacy-badge">
              <span className="badge-icon">👁️</span>
              <span className="badge-text">Private</span>
            </div>
          </div>

          <p>We use bank-level encryption and never share your personal information. Your data is completely anonymized and used solely to provide you with the best possible recommendations and application support.</p>
        </div>
      </div>
    </section>
  )
}