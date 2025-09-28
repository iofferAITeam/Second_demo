'use client'

interface PersonalTagsProps {
  tags: string[]
}

export default function PersonalTags({ tags }: PersonalTagsProps) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  )
}