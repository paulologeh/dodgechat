import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'
import { useDashboardStore } from '../../contexts/dashboardContext'

type ErrorModalPropTypes = {
  open: boolean
  message: string
}

export const ErrorModal = ({ open, message }: ErrorModalPropTypes) => {
  const { setDashboardStore } = useDashboardStore()

  const handleClose = () =>
    setDashboardStore((prevState) => ({
      ...prevState,
      openErrorModal: false,
    }))

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Error </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleClose} bg="blue.400">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
