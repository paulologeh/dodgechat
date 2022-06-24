import { Card, Image, Button } from 'semantic-ui-react'
import { friendMinimalType } from 'types/apiTypes'

export const FriendRequest = ({ data }: { data: friendMinimalType }) => {
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
