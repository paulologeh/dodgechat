import { Card, Image, Button } from 'semantic-ui-react'
import { friendMinimalType } from 'types/apiTypes'

type propTypes = {
  data: friendMinimalType
}

export const FriendRequest = ({ data }: propTypes) => {
  const { name, username, gravatar } = data

  return (
    <Card>
      <Card.Content>
        <Image floated="right" size="mini" src={gravatar} />
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
