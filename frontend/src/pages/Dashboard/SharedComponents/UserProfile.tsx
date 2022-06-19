import { Button, Image, Modal, Header, Icon } from 'semantic-ui-react'
import { useState } from 'react'
import { updateStateValues } from '../index'
import { userProfileType } from 'types/apiTypes'
import { Relationships } from 'services'
import { months } from 'utils/index'

type propTypes = {
  open: boolean
  updateState: (key: string, value: updateStateValues) => void
  selectedUserProfile: userProfileType | null
}

type stateType = {
  add: boolean
  delete: boolean
  block: boolean
}

export const UserProfileModal = ({
  open,
  updateState,
  selectedUserProfile,
}: propTypes) => {
  const [loading, setLoading] = useState<stateType>({
    add: false,
    delete: false,
    block: false,
  })

  const handleBlock = async () => {
    if (!selectedUserProfile?.username) return

    setLoading({ ...loading, block: true })
    try {
      const response = await Relationships.deleteUser(
        selectedUserProfile.username
      )
      if (response.status === 200) {
        updateState('selectedUserProfile', {
          ...selectedUserProfile,
          relationshipState: 'BLOCKED',
        })
        setLoading({ ...loading, block: false })
      } else {
        const data = await response.json()
        setLoading({ ...loading, block: false })
        updateState('modalError', data.message)
        updateState('openErrorModal', true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!selectedUserProfile?.username) return

    setLoading({ ...loading, delete: true })
    try {
      const response = await Relationships.deleteUser(
        selectedUserProfile.username
      )
      if (response.status === 200) {
        updateState('selectedUserProfile', {
          ...selectedUserProfile,
          relationshipState: null,
        })
        setLoading({ ...loading, delete: false })
      } else {
        const data = await response.json()
        setLoading({ ...loading, delete: false })
        updateState('modalError', data.message)
        updateState('openErrorModal', true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAdd = async () => {
    if (!selectedUserProfile?.username) return

    setLoading({ ...loading, add: true })
    try {
      const response = await Relationships.addUser(selectedUserProfile.username)
      if (response.status === 200) {
        updateState('selectedUserProfile', {
          ...selectedUserProfile,
          relationshipState: 'FRIEND_REQUEST_SENT',
        })
        setLoading({ ...loading, add: false })
      } else {
        const data = await response.json()
        setLoading({ ...loading, add: false })
        updateState('modalError', data.message)
        updateState('openErrorModal', true)
      }
    } catch (error) {
      console.error(error)
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
      onClose={() => updateState('openUserProfileModal', false)}
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
            onClick={handleAdd}
          >
            Add
            <Icon name="add user" />
          </Button>
        )}
        {selectedUserProfile?.relationshipState === 'FRIEND' && (
          <Button
            primary
            icon
            labelPosition="right"
            loading={loading.delete}
            onClick={handleDelete}
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
            selectedUserProfile?.relationshipState === 'BLOCKED' ?? false
          }
          loading={loading.block}
          onClick={handleBlock}
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
