import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Loader,
  Segment,
} from 'semantic-ui-react'
import { useState } from 'react'
import { User } from 'services'
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
      const response = await User.forgotPassword(email)

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
          style={{ width: 100, height: 100 }}
          centered
        />
        <Header as="h2" textAlign="center">
          Forgot Password
        </Header>
        <Form size="large" onSubmit={handleSubmit}>
          <Segment stacked>
            {loading && (
              <Loader active inline="centered" style={{ marginBottom: 10 }} />
            )}
            {error && (
              <Message negative header="Failed to send reset" content={error} />
            )}
            {success && (
              <Message positive header="Submitted" content={success} />
            )}
            <Form.Input
              fluid
              required
              icon="mail"
              iconPosition="left"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button fluid size="large">
              Submit
            </Button>
          </Segment>
        </Form>

        <Message>
          Know your password ?{' '}
          <a
            href="login"
            style={{
              color: 'black',
              textDecoration: 'underline',
            }}
          >
            Login
          </a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
