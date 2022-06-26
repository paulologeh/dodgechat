import { Button, Image, Modal, Header, Icon } from 'semantic-ui-react'
import { useState } from 'react'
import { userProfileType } from 'types/apiTypes'
import { Relationships } from 'services'
import { months } from 'utils/index'
import { useDashboardStore } from 'contexts/dashboardContext'

type propTypes = {
  open: boolean
  selectedUserProfile: userProfileType | null
}

type buttonGroupType = {
  add: boolean
  delete: boolean
  block: boolean
}

export const UserProfileModal = ({ open, selectedUserProfile }: propTypes) => {
  const [loading, setLoading] = useState<buttonGroupType>({
    add: false,
    delete: false,
    block: false,
  })
  const [disabled, setDisabled] = useState<buttonGroupType>({
    add: false,
    delete: false,
    block: false,
  })
  const { setDashboardStore } = useDashboardStore()

  const handleClick = async (button: string) => {
    if (!selectedUserProfile?.username) return

    setLoading({ ...loading, [button]: true })
    try {
      let response

      if (button === 'add')
        response = await Relationships.addUser(selectedUserProfile.username)
      if (button === 'delete')
        response = await Relationships.deleteUser(selectedUserProfile.username)
      if (button === 'block')
        response = await Relationships.blockUser(selectedUserProfile.username)

      if (!response) throw new Error('undefined response ')

      if (response.status === 200) {
        const refetchResponse = await Relationships.getFriends()
        if (refetchResponse.status === 200) {
          const data = await refetchResponse.json()
          setDashboardStore((prevState) => ({
            ...prevState,
            friendRequests: data.friendRequests,
            friends: data.friends,
          }))
        }
        setLoading({ ...loading, [button]: false })
        setDisabled({ ...disabled, [button]: true })
      } else {
        const data = await response.json()
        setLoading({ ...loading, [button]: false })
        setDashboardStore((prevState) => ({
          ...prevState,
          modalError: data.message,
          openErrorModal: true,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        modalError: 'Something went wrong. Please try again',
        openErrorModal: true,
      }))
    } finally {
      setLoading({ ...loading, [button]: false })
    }
  }

  const getLastSeen = (date: Date) => {
    const datetime = new Date(date)
    const now = new Date()
    const diff = now.getTime() - datetime.getTime()
    if (diff <= 600000) {
      // 10 minutes
      return 'Now'
    } else if (diff <= 86400000) {
      const time = Math.round(diff / 3600000)
      if (time === 1) {
        return `${time} hour ago`
      }
      return `${time} hours ago`
    } else {
      return 'Over a day ago'
    }
  }

  const getJoined = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear() // 2019
    const month = d.getMonth() // 12
    if (month > 12 || month < 1) return ''
    return `Joined ${months[month - 1]} ${year}`
  }

  return (
    <Modal
      closeIcon
      onClose={() =>
        setDashboardStore((prevState) => ({
          ...prevState,
          openUserProfileModal: false,
        }))
      }
      onOpen={() => null}
      open={open}
      size="small"
    >
      <Modal.Header>
        <i>{selectedUserProfile?.username}</i>
      </Modal.Header>
      <Modal.Content image>
        <Image size="medium" src={selectedUserProfile?.gravatar} wrapped />
        <Modal.Description>
          <Header>{selectedUserProfile?.name}</Header>
          {selectedUserProfile?.numberOfFriends && (
            <p>
              <Icon name="user" /> {selectedUserProfile?.numberOfFriends}{' '}
              Friends
            </p>
          )}
          <p>
            <Icon name="map marker" /> Location:{' '}
            {selectedUserProfile?.location ?? 'Unknown'}
          </p>
          {selectedUserProfile?.aboutMe && (
            <p>
              <Icon name="comments" /> About me: {selectedUserProfile?.aboutMe}
            </p>
          )}
          {selectedUserProfile?.lastSeen && (
            <p>
              <Icon name="circle" />
              Last seen: {getLastSeen(selectedUserProfile?.lastSeen)}
            </p>
          )}
          {selectedUserProfile?.memberSince && (
            <p>
              <Icon name="calendar" />
              {getJoined(selectedUserProfile?.memberSince)}
            </p>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {selectedUserProfile?.relationshipState === null && (
          <Button
            positive
            icon
            labelPosition="right"
            loading={loading.add}
            disabled={disabled.add}
            onClick={() => handleClick('add')}
          >
            Add
            <Icon name="add user" />
          </Button>
        )}
        {selectedUserProfile?.relationshipState === 'ACCEPTED' && (
          <Button
            primary
            icon
            labelPosition="right"
            loading={loading.delete}
            disabled={disabled.delete}
            onClick={() => handleClick('delete')}
          >
            Delete
            <Icon name="user delete" />
          </Button>
        )}
        <Button
          negative
          icon
          labelPosition="right"
          disabled={
            (disabled.block ||
              selectedUserProfile?.relationshipState === 'BLOCKED') ??
            false
          }
          loading={loading.block}
          onClick={() => handleClick('block')}
        >
          {selectedUserProfile?.relationshipState === 'BLOCKED'
            ? 'Blocked'
            : 'Block'}
          <Icon name="ban" />
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
