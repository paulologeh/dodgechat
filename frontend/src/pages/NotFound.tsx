import { Grid, Header, Image, Message } from 'semantic-ui-react'
import logo from 'assets/logo.png'

export const NotFound = () => {
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
          Not Found
        </Header>

        <Message>
          Sorry could not find anything on this page
          <br />
          <a
            href="/"
            style={{
              color: 'black',
              textDecoration: 'underline',
            }}
          >
            Go back to dashboard
          </a>
        </Message>
      </Grid.Column>
    </Grid>
  )
}
