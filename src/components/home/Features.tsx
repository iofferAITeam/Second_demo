import Image from 'next/image'

export default function Features() {
  const features = [
    {
      icon: '/images/icon-chart.png',
      title: 'AI-Powered Matching',
      description: 'Our advanced AI analyzes your profile and preferences to find colleges that match your goals and aspirations.'
    },
    {
      icon: '/images/icon-question.png',
      title: 'Comprehensive Database',
      description: 'Access information from thousands of colleges worldwide with detailed insights about programs, campus life, and more.'
    },
    {
      icon: '/images/icon-success.png',
      title: 'Success Tracking',
      description: 'Monitor your application progress and get personalized guidance throughout your college application journey.'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine cutting-edge technology with educational expertise to help you make the best college choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="mb-6 flex justify-center">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}