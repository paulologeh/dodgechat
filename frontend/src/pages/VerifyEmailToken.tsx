import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users } from 'api'
import { ErrorResult, PageLoading, SuccessResult } from 'components/common'

const title = 'Email Verification'

export const VerifyEmailToken = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  document.title = 'Dodgechat | Verify Email'

  useEffect(() => {
    const confirmToken = async () => {
      try {
        const response = await Users.changeEmail(token)

        if (response.status === 200) {
          setSuccess('Your email has been changed. Thanks!')
        } else {
          setError('The link is invalid or has expired')
        }
      } catch (error) {
        setError('Server error, please try again later')
      }
    }

    setLoading(true)
    if (token) {
      confirmToken().catch(console.error)
    } else {
      navigate('..', { replace: true })
    }

    setLoading(false)
  }, [navigate, token])

  return (
    <>
      {loading && <PageLoading />}
      {success && <SuccessResult title={title} message={success} />}
      {error && <ErrorResult title={title} message={error} />}
    </>
  )
}
