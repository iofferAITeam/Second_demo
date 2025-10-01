import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Image src="/images/logo.png" alt="iOffer" width={120} height={32} />
        </div>

        <ul className="nav-links">
          <li><Link href="/chat" className="active">Chat</Link></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        <div className="nav-right">
          <div className="language-selector">
            <span>🌐 EN</span>
          </div>
          <a href="#" className="signup-button">Sign up / Log in</a>
        </div>
      </nav>
    </header>
  )
}