import { createContext, FC, useContext, useEffect, useState } from 'react'
import { FriendMinimal, UserProfile } from 'types/api'
import { Relationships } from 'services'

type DashboardStore = {
  activeItem: string
  unreadCount: number
  friendRequestsCount: number
  loading: boolean
  loadingMessage: string
  friendRequests: FriendMinimal[]
  friends: FriendMinimal[]
  openErrorModal: boolean
  modalError: string
  openUserProfileModal: boolean
  selectedUserProfile: UserProfile | null
}

const initialStore: DashboardStore = {
  activeItem: 'friends',
  unreadCount: 0,
  friendRequestsCount: 0,
  loading: false,
  loadingMessage: '',
  friendRequests: [],
  friends: [],
  openErrorModal: false,
  modalError: '',
  openUserProfileModal: false,
  selectedUserProfile: null,
}

const DashboardContext = createContext({
  dashboardStore: initialStore,
  setDashboardStore: (data: (prevState: DashboardStore) => DashboardStore) => {
    data
  },
})

export function useDashboardStore() {
  return useContext(DashboardContext)
}

export const DashboardStoreProvider: FC = ({ children }) => {
  const [dashboardStore, setDashboardStore] =
    useState<DashboardStore>(initialStore)

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
          friendRequests: FriendMinimal[]
          friends: FriendMinimal[]
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
  }, [])

  const value = {
    dashboardStore,
    setDashboardStore,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
