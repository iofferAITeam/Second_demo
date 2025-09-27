import Image from 'next/image'

export default function Stats() {
  return (
    <section className="stats-section">
      <div className="stats-content">
        <div className="stats-header" style={{gap: '0px'}}>
          <div className="stats-icon" style={{transform: 'translateX(220px)'}}>
            <Image src="/images/icon-chart.png" alt="Stats" width={80} height={80} />
          </div>
          <div className="stats-text">
            <h2>Why Students Choose Us</h2>
            <p>Join thousands of successful students who have achieved their academic dreams through our proven guidance and AI-powered matching system.</p>
          </div>
        </div>

        <div className="stats-numbers">
          <div className="stat-box">
            <div className="stat-number">14 +</div>
            <div className="stat-label">Countries Covered</div>
            <div className="stat-description">Global coverage across major destinations</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">3000 +</div>
            <div className="stat-label">Partner Universities</div>
            <div className="stat-description">Top institutions across multiple countries & the best</div>
          </div>
        </div>

        <div className="world-map-container">
          <Image
            src="/images/world-map.png"
            alt="Global Coverage"
            width={1200}
            height={600}
            className="world-map"
          />
        </div>
      </div>
    </section>
  )
}