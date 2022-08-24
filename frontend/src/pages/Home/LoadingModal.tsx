import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Spinner,
  Stack,
  Flex,
} from '@chakra-ui/react'

export const LoadingModal = ({
  open,
  message,
}: {
  open: boolean
  message: string
}) => {
  return (
    <Modal isCentered isOpen={open} onClose={() => null}>
      <ModalOverlay />
      <ModalContent>
        <Flex align="center" justify="center">
          {message && (
            <Stack>
              <ModalHeader>{message}</ModalHeader>
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
