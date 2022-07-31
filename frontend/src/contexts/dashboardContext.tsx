import { useState, createContext, useContext, FC, useEffect } from 'react'
import {
  userProfileType,
  searchResultsType,
  friendMinimalType,
} from 'types/apiTypes'
import { Relationships } from 'services'
import { io } from 'socket.io-client'

type dashboardStoreType = {
  activeItem: string
  unreadCount: number
  friendRequestsCount: number
  loading: boolean
  loadingMessage: string
  friendRequests: friendMinimalType[]
  friends: friendMinimalType[]
  isSearching: boolean
  searchValue: string
  searchError: string
  searchResults: searchResultsType[]
  openErrorModal: boolean
  modalError: string
  openUserProfileModal: boolean
  selectedUserProfile: userProfileType | null
}

const initialStore: dashboardStoreType = {
  activeItem: 'friends',
  unreadCount: 0,
  friendRequestsCount: 0,
  loading: false,
  loadingMessage: '',
  friendRequests: [],
  friends: [],
  isSearching: false,
  searchValue: '',
  searchError: '',
  searchResults: [],
  openErrorModal: false,
  modalError: '',
  openUserProfileModal: false,
  selectedUserProfile: null,
}

const DashboardContext = createContext({
  dashboardStore: initialStore,
  setDashboardStore: (
    data: (prevState: dashboardStoreType) => dashboardStoreType
  ) => {
    data
  },
  isConnected: false,
  lastPong: '',
  sendPing: () => {
    null
  },
})

export function useDashboardStore() {
  return useContext(DashboardContext)
}

const socket = io(`${process.env.API_URI}`)

export const DashboardStoreProvider: FC = ({ children }) => {
  const [dashboardStore, setDashboardStore] =
    useState<dashboardStoreType>(initialStore)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [lastPong, setLastPong] = useState<string>('')

  const fetchAllData = async () => {
    setDashboardStore((prevState) => ({ ...prevState, loading: true }))
    try {
      const response = await Relationships.getFriends()
      const data = await response.json()
      if (response.status === 200) {
        const {
          friendRequests,
          friends,
        }: {
          friendRequests: friendMinimalType[]
          friends: friendMinimalType[]
        } = data
        setDashboardStore((prevState) => ({
          ...prevState,
          friendRequests: friendRequests,
          friends: friends,
          loading: false,
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          openErrorModal: true,
          modalError: data.message,
          loading: false,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        openErrorModal: true,
        modalError: 'Something went wrong. Please try again',
        loading: false,
      }))
    }
  }

  useEffect(() => {
    fetchAllData()
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('pong', () => {
      setLastPong(new Date().toISOString())
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pong')
    }
  }, [])

  const sendPing = () => {
    socket.emit('ping')
  }

  const value = {
    dashboardStore,
    setDashboardStore,
    isConnected,
    lastPong,
    sendPing,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
