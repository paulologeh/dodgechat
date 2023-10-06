import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { FiSlash, FiX } from 'react-icons/fi'

const items = {
  'Delete conversation': {
    icon: <FiX />,
    command: '⌘D',
    body: 'Are you sure you want to delete this conversation ? It will be deleted for all participants in the conversation',
  },
  'Block user': {
    icon: <FiSlash />,
    command: undefined,
    body: 'Are you sure you want to block this user ?',
  },
}
export const MenuItemWithConfirm = ({
  handleConfirm,
  itemName,
}: {
  handleConfirm: () => void
  itemName: string
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const item = items[itemName]
  const handleClick = () => {
    handleConfirm()
    onClose()
  }

  return (
    <>
      <MenuItem icon={item.icon} onClick={onOpen} command={item.command}>
        {itemName}
      </MenuItem>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>
            {itemName}
            {'?'}
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{item.body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button colorScheme="red" ml={3} onClick={handleClick}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
