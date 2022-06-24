import { Card, Container, Item, Tab } from 'semantic-ui-react'
import { FriendRequest } from './Components/FriendRequest'
import { Friend } from './Components/Friend'
import { friendMinimalType } from 'types/apiTypes'

type friendsPropType = {
  friendRequests: Array<friendMinimalType>
  friends: Array<friendMinimalType>
}

export const Friends = ({ friendRequests, friends }: friendsPropType) => {
  const panes = [
    {
      menuItem: 'My friends',
      render: () => (
        <Tab.Pane attached={false}>
          <Item.Group>
            {friends.map((data, i) => (
              <Friend data={data} key={i} />
            ))}
          </Item.Group>
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
        </Tab.Pane>
      ),
    },
  ]
  return <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
}
