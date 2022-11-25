import {
  Box,
  BoxProps,
  CloseButton,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'
import { FiHome, FiMessageCircle, FiSettings } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { NavItem } from './NavItem'
import { IconType } from 'react-icons'
import { useDashboardStore } from 'contexts/dashboardContext'

interface LinkItemProps {
  name: string
  icon: IconType
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome },
  { name: 'Messages', icon: FiMessageCircle },
  { name: 'Friends', icon: FaUserFriends },
  { name: 'Settings', icon: FiSettings },
]

interface SidebarProps extends BoxProps {
  onClose: () => void
}

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { setDashboardStore } = useDashboardStore()

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Dodgechat
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          onClick={() =>
            setDashboardStore((prevState) => ({
              ...prevState,
              activeItem: link.name.toLowerCase(),
            }))
          }
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}
