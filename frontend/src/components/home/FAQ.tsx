'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is my personal data secure and private?",
      answer: "Yes, absolutely. We use bank-level encryption to protect your data and never share your personal information with third parties."
    },
    {
      question: "How does iOffer's AI matching work?",
      answer: "Our AI analyzes your academic profile against our database of 50,000+ successful applications to find your best matches."
    },
    {
      question: "Application requirements differ significantly by country or academic institution. Do you offer format or content reviews tailored to a specific target country?",
      answer: "Yes! Our platform provides country-specific guidance for applications to universities in the US, UK, Canada, Australia, and 10+ other countries."
    }
  ]

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="faq-content">
        <div className="faq-header">
          <div className="faq-icon">
            <Image src="/images/icon-question.png" alt="Question" width={80} height={80} />
          </div>
          <div className="faq-text">
            <h2>About Us: Q & A</h2>
            <p>Got questions? We've got answers. Learn more about how iOffer can help you succeed.</p>
          </div>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="faq-arrow">⌄</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}