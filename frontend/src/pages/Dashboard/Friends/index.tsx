import { Card, Container, Header, Item, Tab } from 'semantic-ui-react'
import { FriendRequest } from './Components/FriendRequest'
import { Friend } from './Components/Friend'
import { FriendMinimal } from 'types/api'

type propTypes = {
  friendRequests: FriendMinimal[]
  friends: FriendMinimal[]
}

export const Friends = ({ friendRequests, friends }: propTypes) => {
  const panes = [
    {
      menuItem: 'My friends',
      render: () => (
        <Tab.Pane attached={false}>
          {friends.length > 0 && (
            <Item.Group>
              {friends.map((data, i) => (
                <Friend data={data} key={i} />
              ))}
            </Item.Group>
          )}
          {friends.length == 0 && <Header as="h5">No friends yet</Header>}
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Friend requests',
      render: () => (
        <Tab.Pane attached={false}>
          {friendRequests.length > 0 && (
            <Container>
              <Card.Group itemsPerRow={2} stackable>
                {friendRequests.map((data, i) => (
                  <FriendRequest data={data} key={i} />
                ))}
              </Card.Group>
            </Container>
          )}
          {friendRequests.length == 0 && (
            <Header as="h5">No friend requests</Header>
          )}
        </Tab.Pane>
      ),
    },
  ]
  return <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
}
