import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useApplication } from 'contexts/applictionContext'

export const ErrorModal = () => {
  const { errorMessage, errorKind, clearAppError } = useApplication()

  const open = Boolean(errorMessage) && errorKind === 'MODAL'

  return (
    <Modal isOpen={open} onClose={() => clearAppError()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Error </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{errorMessage}</ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={() => clearAppError()} bg="blue.400">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
