type friendRequestsPropTypes = {
  name?: string
  username: string
}

import { Card, Image, Button } from 'semantic-ui-react'

export const FriendRequest = ({ data }: { data: friendRequestsPropTypes }) => {
  const { name, username } = data
  return (
    <Card>
      <Card.Content>
        <Image
          floated="right"
          size="mini"
          src="https://react.semantic-ui.com/images/avatar/large/steve.jpg"
        />
        <Card.Header>{name}</Card.Header>
        <Card.Meta>{username}</Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
          <Button positive inverted>
            Accept
          </Button>
          <Button negative inverted>
            Decline
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
