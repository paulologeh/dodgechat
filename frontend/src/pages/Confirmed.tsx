import { Grid, Header, Image, Message } from 'semantic-ui-react'
import logo from 'assets/logo.png'

export const Confirmed = () => {
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
          Email Confirmed!
        </Header>

        <Message>
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
