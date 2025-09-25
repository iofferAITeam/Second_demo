import { UpdateProfileRequest, UserProfile } from '@/types/profile'

interface AcademicInfoFormProps {
  profile: UserProfile | null
  formData: UpdateProfileRequest
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export default function AcademicInfoForm({ profile, formData, isEditing, onChange }: AcademicInfoFormProps) {
  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Education Background */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Background</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Education Level</label>
            {isEditing ? (
              <select
                name="currentEducation"
                value={formData.currentEducation || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select education level</option>
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.currentEducation || 'Not provided'}</p>
            )}
          </div>

          {/* Major/Field of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Major/Field of Study</label>
            {isEditing ? (
              <input
                type="text"
                name="major"
                value={formData.major || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Computer Science, Business Administration"
              />
            ) : (
              <p className="text-gray-900">{profile.major || 'Not provided'}</p>
            )}
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GPA (4.0 scale)</label>
            {isEditing ? (
              <input
                type="number"
                name="gpa"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 3.85"
              />
            ) : (
              <p className="text-gray-900">{profile.gpa ? `${profile.gpa}/4.0` : 'Not provided'}</p>
            )}
          </div>

          {/* Graduation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation Date</label>
            {isEditing ? (
              <input
                type="date"
                name="graduationDate"
                value={
                  formData.graduationDate ||
                  (profile.graduationDate ? new Date(profile.graduationDate).toISOString().split('T')[0] : '')
                }
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {profile.graduationDate ? new Date(profile.graduationDate).toLocaleDateString() : 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Scores */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TOEFL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TOEFL Score (0-120)</label>
            {isEditing ? (
              <input
                type="number"
                name="toefl"
                min="0"
                max="120"
                value={formData.toefl || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 108"
              />
            ) : (
              <p className="text-gray-900">{profile.toefl || 'Not taken'}</p>
            )}
          </div>

          {/* IELTS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IELTS Score (0-9)</label>
            {isEditing ? (
              <input
                type="number"
                name="ielts"
                step="0.5"
                min="0"
                max="9"
                value={formData.ielts || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7.5"
              />
            ) : (
              <p className="text-gray-900">{profile.ielts || 'Not taken'}</p>
            )}
          </div>

          {/* GRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GRE Score (260-340)</label>
            {isEditing ? (
              <input
                type="number"
                name="gre"
                min="260"
                max="340"
                value={formData.gre || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 325"
              />
            ) : (
              <p className="text-gray-900">{profile.gre || 'Not taken'}</p>
            )}
          </div>

          {/* GMAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GMAT Score (200-800)</label>
            {isEditing ? (
              <input
                type="number"
                name="gmat"
                min="200"
                max="800"
                value={formData.gmat || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 720"
              />
            ) : (
              <p className="text-gray-900">{profile.gmat || 'Not taken'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Test Score Helper Information */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Test Score Guidelines</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>TOEFL:</strong> Required for non-native English speakers (0-120 scale)</li>
            <li>• <strong>IELTS:</strong> Alternative to TOEFL (0-9 scale, 0.5 increments)</li>
            <li>• <strong>GRE:</strong> Required for most graduate programs (260-340 scale)</li>
            <li>• <strong>GMAT:</strong> Required for MBA programs (200-800 scale)</li>
          </ul>
        </div>
      )}
    </div>
  )
}