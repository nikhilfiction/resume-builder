import { CheckCircle2Icon, Loader2, Target, XCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'

// picks a color for the score ring/badge based on how good the match is
const scoreColor = (score) => {
  if (score >= 75) return { text: 'text-green-600', ring: 'ring-green-300', bg: 'from-green-100 to-green-200' }
  if (score >= 50) return { text: 'text-amber-600', ring: 'ring-amber-300', bg: 'from-amber-100 to-amber-200' }
  return { text: 'text-red-600', ring: 'ring-red-300', bg: 'from-red-100 to-red-200' }
}

const JobMatchForm = ({ resumeId }) => {
  const { token } = useSelector(state => state.auth)
  const [jobDescription, setJobDescription] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)

  const checkMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error('Paste a job description first')
      return
    }
    try {
      setIsChecking(true)
      const { data } = await api.post(
        '/api/ai/match-job',
        { resumeId, jobDescription },
        { headers: { Authorization: token } }
      )
      setResult(data)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsChecking(false)
    }
  }

  const colors = result ? scoreColor(result.matchScore) : null

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
          <Target className="size-5 text-purple-600" /> ATS Match Score
        </h3>
        <p className='text-sm text-gray-500'>Paste a job description to see how well this resume matches it</p>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={8}
        className='w-full p-3 px-4 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none'
        placeholder='Paste the full job description here...'
      />

      <button
        disabled={isChecking}
        onClick={checkMatch}
        className='flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50'
      >
        {isChecking ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
        {isChecking ? 'Checking match...' : 'Check ATS Match'}
      </button>

      {result && (
        <div className='space-y-5 pt-2'>
          {/* Score badge */}
          <div className={`flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br ${colors.bg} ring ${colors.ring}`}>
            <div className={`text-4xl font-bold ${colors.text}`}>{result.matchScore}%</div>
            <div className='text-sm text-gray-700'>
              {result.matchScore >= 75 && "Strong match - this resume aligns well with the job description."}
              {result.matchScore >= 50 && result.matchScore < 75 && "Decent match - a few gaps worth closing."}
              {result.matchScore < 50 && "Weak match - consider tailoring the resume for this role."}
            </div>
          </div>

          {/* Matched keywords */}
          {result.matchedKeywords?.length > 0 && (
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                <CheckCircle2Icon className='size-4 text-green-600' /> Found in your resume
              </p>
              <div className='flex flex-wrap gap-2'>
                {result.matchedKeywords.map((kw, i) => (
                  <span key={i} className='px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full'>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {result.missingKeywords?.length > 0 && (
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-700 mb-2'>
                <XCircleIcon className='size-4 text-red-500' /> Missing from your resume
              </p>
              <div className='flex flex-wrap gap-2'>
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className='px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full'>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div>
              <p className='text-sm font-medium text-gray-700 mb-2'>Suggestions to improve your match</p>
              <ul className='space-y-1.5 list-disc list-inside text-sm text-gray-600'>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobMatchForm