import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users } from 'api'
import { ErrorResult, PageLoading, SuccessResult } from 'components/common'

const title = 'Account Confirmation'

export const ConfirmAccountToken = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  document.title = 'Dodgechat | Confirm Account'

  useEffect(() => {
    const confirmToken = async () => {
      try {
        const response = await Users.confirm(token)

        if (response.status === 200) {
          setSuccess('Your account has been confirmed. Thanks!')
        } else {
          setError('The confirmation link is invalid or has expired')
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
