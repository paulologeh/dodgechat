import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import {
  FiChevronDown,
  FiDownloadCloud,
  FiMessageSquare,
  FiTrash,
  FiUser,
  FiVolume,
} from 'react-icons/fi'
import { MenuItemWithConfirm } from './MenuItemWithConfirm'

type ConversationMenuProps = {
  handleViewUser: () => void
  handleChatDelete: () => void
  handleBlock: () => void
}
export const ConversationMenu = ({
  handleViewUser,
  handleChatDelete,
  handleBlock,
}: ConversationMenuProps) => {
  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<FiChevronDown />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<FiUser />} onClick={handleViewUser} command="⌘V">
            View user information
          </MenuItem>
          <MenuItem icon={<FiMessageSquare />} command="⌘S" isDisabled>
            Select messages
          </MenuItem>
          <MenuItem icon={<FiTrash />} command="⌘⇧C" isDisabled>
            Clear messages
          </MenuItem>
          <MenuItemWithConfirm
            itemName="Delete conversation"
            handleConfirm={handleChatDelete}
          />
          <MenuItem icon={<FiVolume />} isDisabled>
            Mute
          </MenuItem>
          <MenuItemWithConfirm
            itemName="Block user"
            handleConfirm={handleBlock}
          />
          <MenuItem icon={<FiDownloadCloud />} isDisabled>
            Download conversation
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
