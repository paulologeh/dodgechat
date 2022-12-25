import {
  Flex,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
} from '@chakra-ui/react'
import { useApplication } from 'contexts/applictionContext'

export const LoadingModal = () => {
  const { isAppLoading, loadingMessage } = useApplication()

  return (
    <Modal isCentered isOpen={isAppLoading} onClose={() => null}>
      <ModalOverlay />
      <ModalContent>
        <Flex align="center" justify="center">
          {loadingMessage && (
            <Stack>
              <ModalHeader>{loadingMessage}</ModalHeader>
            </Stack>
          )}
          <Stack>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Stack>
        </Flex>
      </ModalContent>
    </Modal>
  )
}
