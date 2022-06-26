import { Button, Modal } from 'semantic-ui-react'
import { useDashboardStore } from 'contexts/dashboardContext'

type propTypes = {
  open: boolean
  message: string
}

export const ErrorModal = ({ open, message }: propTypes) => {
  const { setDashboardStore } = useDashboardStore()

  return (
    <Modal
      onClose={() =>
        setDashboardStore((prevState) => ({
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
            setDashboardStore((prevState) => ({
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
