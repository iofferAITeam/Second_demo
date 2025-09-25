import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Image src="/images/logo.png" alt="iOffer" width={120} height={28} />
          </div>
          <p>Empowering students to achieve their academic dreams through AI-powered university matching and expert guidance.</p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Stay Updated</h4>
          <p>Get the latest insights and tips for university applications.</p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Your email"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 iOffer. All rights reserved.</p>
      </div>
    </footer>
  )
}