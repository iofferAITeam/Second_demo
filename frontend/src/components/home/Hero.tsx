'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    degree: '',
    country: '',
    program: '',
    about: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 构建发送给聊天模型的消息
    const message = `Hi! I'm looking for personalized school recommendations based on my profile:

🎓 Desired Degree: ${formData.degree || 'Not specified'}
🌍 Country of Interest: ${formData.country || 'Not specified'}
📚 Desired Major/Program: ${formData.program || 'Not specified'}
📝 About Me: ${formData.about || 'Not provided'}

Please provide me with personalized school recommendations based on this information, including:
1. Top recommended universities/colleges
2. Admission requirements and chances
3. Application tips specific to my profile
4. Any additional insights that might be helpful

Thank you!`

    // 将消息保存到sessionStorage，然后跳转到聊天页面
    sessionStorage.setItem('initialMessage', message)
    sessionStorage.setItem('userFormData', JSON.stringify(formData))

    // 跳转到聊天页面
    router.push('/chat')
  }

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Stop Guessing<br />Secure Your Offer</h1>
          <p className="subtitle">Driven by AI, designed for your unique profile</p>
          <p className="description">
            Discover where you truly belong by comparing your application profile against thousands of students who got accepted.
          </p>

          <ul className="features">
            <li>5 min to find your best-fit college programs</li>
            <li>3X More Likely to Get Accepted</li>
            <li>50,000+ successful application data powering your match</li>
          </ul>
        </div>

        <div className="form-area">
          <div className="figma-characters" style={{textAlign: 'center', marginBottom: '-10px'}}>
            <Image
              src="/images/characters.png"
              alt="Four Cartoon Characters"
              width={200}
              height={80}
              style={{height: '80px', width: 'auto'}}
            />
          </div>

          <div className="form-container">
            <h3>Get Your Personalized School Recommendations</h3>
            <p className="subtitle">
              Share a bit about your academic profile and we'll match you with schools where you're most likely to succeed!
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="degree">Desired degree</label>
                  <select
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                  >
                    <option value="">Please Select</option>
                    <option value="Bachelor's Degree">Bachelor's</option>
                    <option value="Master's Degree">Master's</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country of interest</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Please Select</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="program">Your desired major / program</label>
                <input
                  type="text"
                  id="program"
                  name="program"
                  placeholder="e.g. Computer Science"
                  value={formData.program}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="about">Tell us a bit about yourself!</label>
                <textarea
                  id="about"
                  name="about"
                  placeholder="Share your interests, goals, and any preferences..."
                  value={formData.about}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="generate-button">
                Generate My Free School Match Report
              </button>
            </form>

            <a href="#" className="discover-link">Discover More</a>
          </div>
        </div>
      </div>
    </section>
  )
}