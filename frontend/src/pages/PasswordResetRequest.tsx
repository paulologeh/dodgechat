import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react'
import { useState } from 'react'
import { Auth } from 'services'
import { validateEmail } from 'utils'
import logo from 'assets/logo.png'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    if (!validateEmail(email)) {
      setError('Email address is not valid')
      setLoading(false)
      return
    }

    try {
      const response = await Auth.passwordResetRequest(email)

      if (response.status === 200) {
        setSuccess(
          'You will receive an email with instructions on how to reset your password if the email you provided exists'
        )
      } else {
        setError('Failed to send reset request')
      }
    } catch {
      setError('Server error, please try again later')
    }
    setLoading(false)
  }

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
          Request password reset
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {error && <Message negative content={error} />}
            {success && <Message positive content={success} />}
            <Form.Input
              fluid
              required
              icon="mail"
              iconPosition="left"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button fluid size="large" color="black" loading={loading}>
              Submit
            </Button>
          </Segment>
        </Form>

        <Message>
          <a href="login">Login</a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
