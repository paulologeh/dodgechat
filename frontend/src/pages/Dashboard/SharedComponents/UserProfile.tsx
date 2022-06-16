import { Button, Image, Modal, Header, Icon } from 'semantic-ui-react'
import { updateStateValues } from '../index'
import { userProfileType } from 'types/apiTypes'

type propTypes = {
  open: boolean
  updateState: (key: string, value: updateStateValues) => void
  selectedUserProfile: userProfileType | null
}

export const UserProfileModal = ({
  open,
  updateState,
  selectedUserProfile,
}: propTypes) => {
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
          {selectedUserProfile?.aboutMe && (
            <p>About me: {selectedUserProfile?.aboutMe}</p>
          )}
          <p>Location: {selectedUserProfile?.location ?? 'Unknown'}</p>
          {selectedUserProfile?.lastSeen && (
            <p>Online: Last seen at {selectedUserProfile?.lastSeen}</p>
          )}
          {selectedUserProfile?.memberSince && (
            <p>Joined: {selectedUserProfile?.memberSince}</p>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {selectedUserProfile?.relationshipState === null && (
          <Button positive icon labelPosition="right">
            Add
            <Icon name="add user" />
          </Button>
        )}
        {selectedUserProfile?.relationshipState === 'FRIEND' && (
          <Button primary icon labelPosition="right">
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
