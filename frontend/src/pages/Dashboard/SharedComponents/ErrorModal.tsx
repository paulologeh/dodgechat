import { Button, Modal } from 'semantic-ui-react'
import { dashboardStateType } from 'pages/Dashboard/index'
import { SetStateAction, Dispatch } from 'react'

type propTypes = {
  open: boolean
  setState: Dispatch<SetStateAction<dashboardStateType>>
  message: string
}

export const ErrorModal = ({ open, setState, message }: propTypes) => {
  return (
    <Modal
      onClose={() =>
        setState((prevState) => ({
          ...prevState,
          openErrorModal: false,
        }))
      }
      onOpen={() => null}
      open={open}
    >
      <Modal.Header>Error</Modal.Header>
      <Modal.Content>
        <Modal.Description>{message}</Modal.Description>
      </Modal.Content>

      <Modal.Actions>
        <Button
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              openErrorModal: false,
            }))
          }
          color="black"
        >
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
