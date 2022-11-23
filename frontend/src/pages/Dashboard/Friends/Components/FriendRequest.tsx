import { Button, Card, Image } from 'semantic-ui-react'
import { FriendMinimal } from 'types/api'
import { useDashboardStore } from 'contexts/dashboardContext'
import { Relationships } from 'services'
import { useState } from 'react'

type propTypes = {
  data: FriendMinimal
}

export const FriendRequest = ({ data }: propTypes) => {
  const [loading, setLoading] = useState({
    accept: false,
    decline: false,
  })
  const { name, username, gravatar } = data
  const { setDashboardStore } = useDashboardStore()

  const handleClick = async (button: string) => {
    const cleanUp = () => {
      setLoading({ ...loading, [button]: false })
    }
    setLoading({ ...loading, [button]: true })

    try {
      let response

      if (button === 'accept') {
        response = await Relationships.addUser(username)
      }
      if (button === 'decline') {
        response = await Relationships.deleteUser(username)
      }
      if (!response) {
        console.error('unrecognised button')
        cleanUp()
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: 'Something went wrong. Please try again',
          openErrorModal: true,
        }))
        return
      }

      if (response.status === 200) {
        const refetchResponse = await Relationships.getFriends()
        const data = await refetchResponse.json()
        cleanUp()
        setDashboardStore((prevState) => ({
          ...prevState,
          friendRequests: data.friendRequests,
          friends: data.friends,
        }))
      } else {
        const data = await response.json()
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
          openErrorModal: true,
        }))
      }
    } catch (error) {
      console.error(error)
      cleanUp()
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
      }))
    }
  }

  return (
    <Card>
      <Card.Content>
        <Image floated="right" size="mini" src={gravatar} />
        <Card.Header>{name}</Card.Header>
        <Card.Meta>{username}</Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
          <Button
            positive
            inverted
            onClick={() => handleClick('accept')}
            loading={loading.accept}
          >
            Accept
          </Button>
          <Button
            negative
            inverted
            onClick={() => handleClick('decline')}
            loading={loading.decline}
          >
            Decline
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
