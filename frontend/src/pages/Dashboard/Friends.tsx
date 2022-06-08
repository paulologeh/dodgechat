import {
  Button,
  Card,
  Image,
  Icon,
  Container,
  Divider,
} from 'semantic-ui-react'

const friendsData = [
  {
    name: 'Helen',
    dateJoined: 'Joined in 2018',
    aboutMe: 'Helen is a nurse living in Austin.',
    noOfFriends: 22,
    avatar: 'https://react.semantic-ui.com/images/avatar/large/helen.jpg',
  },
  {
    name: 'Matthew',
    dateJoined: 'Joined in 2015',
    aboutMe: 'Matthew is a musician living in Nashville.',
    noOfFriends: 35,
    avatar: 'https://react.semantic-ui.com/images/avatar/large/matthew.png',
  },
  {
    name: 'Molly',
    dateJoined: 'Joined in 2017',
    aboutMe: 'Molly is an artist living in San Francisco.',
    noOfFriends: 28,
    avatar: 'https://react.semantic-ui.com/images/avatar/large/molly.png',
  },
]

const friendRequestsData = [
  { name: 'Steve Sanders', username: 'steve-sanders' },
  { name: 'Simon Taylor', username: 'simon-taylor' },
]

type friendRequestsPropTypes = {
  name?: string
  username: string
}

const FriendRequest = ({ data }: { data: friendRequestsPropTypes }) => {
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

type friendPropTypes = {
  name?: string
  dateJoined: string
  aboutMe?: string
  noOfFriends: number
  avatar?: string
}

const Friend = ({ data }: { data: friendPropTypes }) => {
  const { name, dateJoined, aboutMe, noOfFriends, avatar } = data

  return (
    <Card>
      <Image src={avatar} wrapped ui={false} />
      <Card.Content>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>
          <span className="date">{dateJoined}</span>
        </Card.Meta>
        <Card.Description>{aboutMe}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Icon name="user" />
        {noOfFriends} Friends
      </Card.Content>
    </Card>
  )
}

export const Friends = () => {
  return (
    <>
      {friendRequestsData.length > 0 && (
        <Container>
          <Card.Group centered itemsPerRow={2} stackable>
            {friendRequestsData.map((data, i) => (
              <FriendRequest data={data} key={i} />
            ))}
          </Card.Group>
        </Container>
      )}
      <Divider />
      <Card.Group itemsPerRow={3} stackable>
        {friendsData.map((data, i) => (
          <Friend data={data} key={i} />
        ))}
      </Card.Group>
    </>
  )
}
