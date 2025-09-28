'use client'

interface BackgroundTagsProps {
  background: {
    gpa: string
    ielts: string
    intendedMajor: string
    targetCountry: string
  }
}

export default function BackgroundTags({ background }: BackgroundTagsProps) {
  const tags = [
    { label: 'Background', value: '', type: 'label' },
    { label: 'GPA', value: background.gpa, type: 'data' },
    { label: 'IELTS', value: background.ielts, type: 'data' },
    { label: 'Intended Major', value: background.intendedMajor, type: 'data' },
    { label: 'Target Country', value: background.targetCountry, type: 'data' }
  ]

  return (
    <div className="flex flex-wrap gap-3 py-4">
      {tags.map((tag, index) => (
        <div
          key={index}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            tag.type === 'label'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-gray-800 text-white'
          }`}
        >
          {tag.type === 'data' ? `${tag.label}: ${tag.value}` : tag.label}
        </div>
      ))}
    </div>
  )
}