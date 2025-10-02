import Navbar from '@/components/shared/Navbar'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import FAQ from '@/components/home/FAQ'
import PrivacySection from '@/components/home/PrivacySection'
import Footer from '@/components/shared/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <FAQ />
      <PrivacySection />
      <Footer />
    </div>
  )
}
