import { Button, Modal } from 'semantic-ui-react'
import { updateStateValues } from '../index'

type propTypes = {
  open: boolean
  updateState: (key: string, value: updateStateValues) => void
  message: string
}

export const ErrorModal = ({ open, updateState, message }: propTypes) => {
  return (
    <Modal
      onClose={() => updateState('openErrorModal', false)}
      onOpen={() => null}
      open={open}
    >
      <Modal.Header>Error</Modal.Header>
      <Modal.Content>
        <Modal.Description>{message}</Modal.Description>
      </Modal.Content>

      <Modal.Actions>
        <Button
          onClick={() => updateState('openErrorModal', false)}
          color="black"
        >
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
