import { Button, Image, Modal, Card, Icon } from 'semantic-ui-react'
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
      size="mini"
    >
      {selectedUserProfile && (
        <>
          <Image src={selectedUserProfile.gravatar} />
          <Card.Content>
            <Card.Header>
              {selectedUserProfile.name} ({selectedUserProfile.username})
            </Card.Header>
            <Card.Meta>
              {selectedUserProfile.memberSince && (
                <span className="date">{selectedUserProfile.memberSince}</span>
              )}
            </Card.Meta>
            {selectedUserProfile.aboutMe && (
              <Card.Description>{selectedUserProfile.aboutMe}</Card.Description>
            )}
            {selectedUserProfile.numberOfFriends && (
              <>
                <Icon name="user" />
                {selectedUserProfile.numberOfFriends} Friends
              </>
            )}
            <p>Location: {selectedUserProfile.location ?? 'Unknown'}</p>
          </Card.Content>
        </>
      )}

      <Modal.Actions>
        <div>
          {!selectedUserProfile?.isFriendRequested &&
            !selectedUserProfile?.isFriend && (
              <Button positive icon labelPosition="right">
                Add
                <Icon name="add user" />
              </Button>
            )}
          {selectedUserProfile?.isFriend && (
            <Button negative icon labelPosition="right">
              Delete
              <Icon name="user delete" />
            </Button>
          )}
          {!selectedUserProfile?.isBlocked && (
            <Button negative icon labelPosition="right">
              Block
              <Icon name="ban" />
            </Button>
          )}
        </div>
      </Modal.Actions>
    </Modal>
  )
}
