import { createContext, FC, useContext, useEffect, useState } from 'react'
import { Conversation, FriendMinimal, UserProfile } from 'types/api'
import { Conversations, Relationships } from 'api'
import { PageLoading } from 'components/common'

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
  selectedUser: UserProfile | null
  conversations: Conversation[]
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
  selectedUser: null,
  conversations: [],
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
  const [loading, setLoading] = useState(true)

  const fetchAllData = async () => {
    try {
      const response = await Relationships.getFriends()
      const data = await response.json()
      const responseConversations = await Conversations.getAllConversations()
      const conversationsData = await responseConversations.json()
      if (response.status === 200 && responseConversations.status === 200) {
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
          conversations: conversationsData,
          // loading: false,
        }))
      } else {
        setDashboardStore((prevState) => ({
          ...prevState,
          openErrorModal: true,
          modalError: data.message,
          // loading: false,
        }))
      }
    } catch (error) {
      console.error(error)
      setDashboardStore((prevState) => ({
        ...prevState,
        openErrorModal: true,
        modalError: 'Something went wrong. Please try again',
      }))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllData().catch(console.error)
  }, [])

  const value = {
    dashboardStore,
    setDashboardStore,
  }

  return (
    <DashboardContext.Provider value={value}>
      {!loading && children}
      {loading && <PageLoading />}
    </DashboardContext.Provider>
  )
}
