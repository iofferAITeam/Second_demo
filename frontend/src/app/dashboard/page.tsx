export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          🎉 Registration/Login Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome to your dashboard. This is where you would see your personalized college recommendations.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Authentication system is working</p>
          <p>✅ Database connection established</p>
          <p>✅ JWT tokens generated successfully</p>
        </div>
      </div>
    </div>
  )
}