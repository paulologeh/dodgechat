import {
  Button,
  Card,
  Image,
  Icon,
  Container,
  Divider,
  Form,
  Modal,
  Item,
  Label,
} from 'semantic-ui-react'
import { useState } from 'react'
import { Friend as FriendService } from 'services/friends'
import { delay } from 'utils'
import './Friends.css'

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
    <Item>
      <Image src={avatar} wrapped ui={false} />
      <Item.Content>
        <Item.Header>{name}</Item.Header>
        <Item.Meta>
          <span className="date">{dateJoined}</span>
        </Item.Meta>
        <Item.Description>{aboutMe}</Item.Description>
        <Item.Extra>
          <Icon name="user" />
          {noOfFriends} Friends
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}

type addFriendsPropTypes = {
  open: boolean
  setModalState: (arg: boolean) => void
}

type addFriendsStateTypes = {
  username: string
  loading: boolean
  error: string
  success: string
}

const AddFriends = ({ open, setModalState }: addFriendsPropTypes) => {
  const [state, setState] = useState<addFriendsStateTypes>({
    username: '',
    loading: false,
    error: '',
    success: '',
  })

  const handleSubmit = async () => {
    setState({ ...state, loading: true, success: '', error: '' })
    try {
      const request = await FriendService.addFriend(state.username)
      if (request.status === 200) {
        setState({ ...state, success: 'Sent request!', loading: false })
      } else {
        const response = await request.json()
        setState({ ...state, error: response.message, loading: false })
      }
      await delay(3000)
    } catch (error) {
      console.error(error)
      setState({
        ...state,
        error: 'Server error. Try again later',
        loading: false,
      })
    }
  }

  const handleClose = () => {
    setState({ ...state, username: '' })
    setModalState(false)
  }

  return (
    <Modal size="tiny" closeIcon open={open} onClose={handleClose}>
      <Modal.Header>Add new friends</Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          <Form.Group inline>
            <Form.Field>
              <label htmlFor="username">Username</label>
            </Form.Field>
            <Form.Input
              id="username"
              placeholder="joey123"
              name="username"
              required
              value={state.username}
              onChange={(e) => setState({ ...state, username: e.target.value })}
            />
            <Form.Button content="Add" color="black" loading={state.loading} />
            {state.error && (
              <Label basic color="red" pointing="left">
                {state.error}
              </Label>
            )}
            {state.success && (
              <Label basic color="green" pointing="left">
                {state.success}
              </Label>
            )}
          </Form.Group>
        </Form>
      </Modal.Content>
    </Modal>
  )
}

type friendsState = {
  openAddFriends: boolean
}

export const Friends = () => {
  const [state, setState] = useState<friendsState>({
    openAddFriends: false,
  })

  const setModalState = (val: boolean) => {
    setState({ ...state, openAddFriends: val })
  }

  return (
    <>
      <Button
        onClick={() => setState({ ...state, openAddFriends: true })}
        color="black"
      >
        <Icon name="add user" />
        Add friend
      </Button>
      <AddFriends open={state.openAddFriends} setModalState={setModalState} />
      <Divider />
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
      <Item.Group itemsPerRow={3} stackable>
        {friendsData.map((data, i) => (
          <Friend data={data} key={i} />
        ))}
      </Item.Group>
    </>
  )
}
