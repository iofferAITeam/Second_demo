import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface CompetitivenessData {
  overallScore: number;
  chartData: ChartData[];
  breakdown: {
    academic: number;
    research: number;
    work: number;
    extracurricular: number;
    test: number;
    recommendation: number;
  };
}

export function useCompetitiveness() {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<CompetitivenessData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompetitiveness = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

      const response = await fetch(`${API_BASE_URL}/api/user/competitiveness`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch competitiveness data')
      }

      const competitivenessData = await response.json()
      console.log('Competitiveness data received:', competitivenessData)
      setData(competitivenessData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Fetch competitiveness error:', err)
      console.log('Auth state:', isAuthenticated)
      console.log('Token:', localStorage.getItem('token'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitiveness()
  }, [isAuthenticated])

  return {
    data,
    isLoading,
    error,
    refetch: fetchCompetitiveness
  }
}