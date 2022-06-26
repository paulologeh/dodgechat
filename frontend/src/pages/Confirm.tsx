import { Grid, Header, Image, Loader, Message } from 'semantic-ui-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Auth } from 'services'

import logo from 'assets/logo.png'

export const ConfirmForm = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const confirmToken = async () => {
    try {
      const response = await Auth.confirm(token)

      if (response.status === 200) {
        setSuccess('Your account has been confirmed. Thanks!')
      } else {
        setError('The confirmation link is invalid or has expired')
      }
    } catch (error) {
      setError('Server error, please try again later')
    }
  }

  useEffect(() => {
    setLoading(true)

    if (token) {
      confirmToken()
    } else {
      navigate('..', { replace: true })
    }

    setLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Image
          src={logo}
          alt="dodgechat"
          style={{ width: 70, height: 70 }}
          centered
        />
        <Header as="h2" textAlign="center">
          Email confirmation
        </Header>

        {loading && (
          <Loader active inline="centered" style={{ marginBottom: 10 }} />
        )}
        {error && <Message negative content={error} />}
        {success && <Message positive content={success} />}
      </Grid.Column>
    </Grid>
  )
}
