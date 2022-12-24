import { createContext, FC, useContext, useEffect, useState } from 'react'
import { Conversation, FriendMinimal, Message, UserProfile } from 'types/api'
import { unknownProfile } from 'utils'
import { isEmpty } from 'lodash'
import { Conversations, Relationships } from 'api'
import { PageLoading } from '../components/common'

type LoadingState = {
  isAppLoading: boolean
  loadingMessage: string | null
}

type ErrorKind = 'MODAL' | 'TOAST' | null

type ErrorsState = {
  errorMessage: string | null
  errorKind: ErrorKind
}

type ChatState = {
  userConversations: Conversation[]
  activeConversationId: string | null | undefined
  olderMessages: Message[]
}

type UserRelationshipsState = {
  userFriends: FriendMinimal[]
  userRequests: FriendMinimal[]
  otherUsers: FriendMinimal[]
}

const initialAppLoading: LoadingState = {
  isAppLoading: false,
  loadingMessage: null,
}

const initialAppError: ErrorsState = {
  errorMessage: null,
  errorKind: null,
}

const initialChatState: ChatState = {
  userConversations: [],
  activeConversationId: undefined,
  olderMessages: [],
}

const initialUserRelationshipState: UserRelationshipsState = {
  userFriends: [],
  userRequests: [],
  otherUsers: [],
}

type ContextType = LoadingState &
  ErrorsState &
  UserRelationshipsState & {
    showAppLoading: () => void
    showAppLoadingWithMessage: (message: string) => void
    clearAppLoading: () => void
    setAppModalError: (error: string) => void
    setAppToastError: (error: string) => void
    clearAppError: () => void
    requestOrAppError: (
      errorKind: ErrorKind,
      appLoadingMessage: string | null,
      request: () => Promise<Response>
    ) => Promise<never | null>
    requestSilent: (request: () => Promise<Response>) => Promise<never | null>
    displayedProfile: UserProfile | null
    setDisplayedProfile: (profile: UserProfile | null) => void
    activeConversation: Conversation | undefined
    userConversations: Conversation[]
    olderMessages: Message[]
    getUserById: (userId: number) => FriendMinimal
    setActiveConversation: (conversationId: string | undefined | null) => void
    readLocalMessages: (messageIds: string[]) => void
    setOlderMessages: (messages: Message[]) => void
    addNewConversation: (conversation: Conversation) => void
    addMessageToActiveConversation: (message: Message) => void
    syncData: (silent: boolean) => void
  }

const ApplicationContext = createContext<ContextType>({
  ...initialAppLoading,
  showAppLoading: () => void undefined,
  showAppLoadingWithMessage: (message: string) => void message,
  clearAppLoading: () => void undefined,
  ...initialAppError,
  setAppModalError: (err: string) => void err,
  setAppToastError: (err: string) => void err,
  clearAppError: () => void undefined,
  requestOrAppError: (
    errorKind: ErrorKind,
    appLoadingMessage: string | null,
    request: () => Promise<Response>
  ) => {
    void errorKind
    void appLoadingMessage
    void request()
    return Promise.resolve(null)
  },
  requestSilent: (request: () => Promise<Response>) => {
    void request()
    return Promise.resolve(null)
  },
  ...initialUserRelationshipState,
  displayedProfile: null,
  setDisplayedProfile: (profile: UserProfile | null) => void profile,
  activeConversation: undefined,
  userConversations: [],
  olderMessages: [],
  getUserById: (userId: number) => {
    void userId
    return unknownProfile
  },
  setActiveConversation: (conversationId: string | undefined | null) =>
    void conversationId,
  readLocalMessages: (messageIds: string[]) => void messageIds,
  setOlderMessages: (messages: Message[]) => void messages,
  addNewConversation: (conversation: Conversation) => void conversation,
  addMessageToActiveConversation: (message: Message) => void message,
  syncData: (silent: boolean) => void silent,
})

export function useApplication() {
  return useContext(ApplicationContext)
}

const DEFAULT_ERROR = 'Something went wrong. Please try again later'

export const ApplicationProvider: FC = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [appLoading, setAppLoading] = useState<LoadingState>(initialAppLoading)
  const [appError, setAppError] = useState<ErrorsState>(initialAppError)
  const [chat, setChat] = useState<ChatState>(initialChatState)
  const [displayedProfile, setDisplayedProfile] = useState<UserProfile | null>(
    null
  )
  const [userRelationships, setUserRelationships] =
    useState<UserRelationshipsState>(initialUserRelationshipState)

  const { errorMessage, errorKind } = appError
  const { isAppLoading, loadingMessage } = appLoading
  const { userConversations, activeConversationId, olderMessages } = chat
  const activeConversation = userConversations.find(
    ({ id }) => id === activeConversationId
  )
  const { userFriends, userRequests, otherUsers } = userRelationships

  useEffect(() => {
    syncData().catch(console.error)
  }, [])

  const syncData = async (silent = false) => {
    if (!silent) setLoading(true)
    const values = await Promise.all([
      Conversations.getAllConversations(),
      Relationships.getFriends(),
    ])
    const data1 = await values[0].json()
    const data2 = await values[1].json()

    setChat((prevState) => ({ ...prevState, userConversations: data1 }))

    const { friends, friendRequests, others } = data2
    setUserRelationships({
      userFriends: friends,
      userRequests: friendRequests,
      otherUsers: others,
    })
    if (!silent) setLoading(false)
  }

  const addMessageToActiveConversation = (message: Message) => {
    if (isEmpty(activeConversation)) return

    const userConversationUpdate = userConversations.filter(
      (conv) => conv.id !== activeConversationId
    )
    const messagesUpdate = [...activeConversation.messages]
    messagesUpdate.push(message)
    const activeConverstionUpdate = {
      ...activeConversation,
      messages: messagesUpdate,
    }
    setChat((prevState) => ({
      ...prevState,
      userConversations: [...userConversationUpdate, activeConverstionUpdate],
    }))
  }

  const setOlderMessages = (messages: Message[]) => {
    setChat((prevState) => ({ ...prevState, olderMessages: messages }))
  }

  const addNewConversation = (conversation: Conversation) => {
    const userConversationsUpdate = userConversations.filter(
      (conv) => conv.id !== null
    )
    setChat((prevState) => ({
      ...prevState,
      userConversations: [...userConversationsUpdate, conversation],
    }))
  }

  const readLocalMessages = (messageIds: string[]) => {
    if (!activeConversationId || isEmpty(activeConversation)) return

    const userConversationsUpdate = userConversations.filter(
      ({ id }) => id !== activeConversationId
    )
    const messages = [...activeConversation.messages]
    let count = 0
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].id && messageIds.includes(messages[i].id)) {
        messages[i].read = true
        count++
      }
    }
    if (count > 0) {
      const conversationUpdate = { ...activeConversation, messages: messages }
      setChat((prevState) => ({
        ...prevState,
        userConversations: [...userConversationsUpdate, conversationUpdate],
      }))
    }
  }

  const setActiveConversation = (conversationId: string | undefined | null) => {
    if (conversationId === undefined) {
      const userConversationsUpdate = userConversations.filter(
        ({ id }) => id !== null
      )
      setChat((prevState) => ({
        ...prevState,
        userConversations: userConversationsUpdate,
      }))
    }

    setChat((prevState) => ({
      ...prevState,
      activeConversationId: conversationId,
    }))
  }

  const clearAppLoading = () => {
    setAppLoading(initialAppLoading)
  }

  const showAppLoading = () => {
    setAppLoading({
      isAppLoading: true,
      loadingMessage: null,
    })
  }

  const showAppLoadingWithMessage = (message: string) => {
    setAppLoading({
      isAppLoading: true,
      loadingMessage: message ? message : DEFAULT_ERROR,
    })
  }

  const setAppModalError = (error: string) => {
    setAppError({
      errorMessage: error,
      errorKind: 'MODAL',
    })
  }

  const setAppToastError = (error: string) => {
    setAppError({
      errorMessage: error,
      errorKind: 'TOAST',
    })
  }

  const clearAppError = () => {
    setAppError(initialAppError)
  }

  const requestOrAppError = async (
    errorKind: ErrorKind,
    appLoadingMessage: string | null,
    request: () => Promise<Response>
  ): Promise<never | null> => {
    if (errorKind === null) {
      throw 'errorKind cannot be null'
    }

    let responseBody

    if (errorKind === 'MODAL') {
      appLoadingMessage
        ? showAppLoadingWithMessage(appLoadingMessage)
        : showAppLoading
    }

    try {
      const response = await request()
      const data = await response.json()
      if (response.status < 300) {
        responseBody = data
      } else {
        const { message } = data ?? {
          message: DEFAULT_ERROR,
        }
        errorKind === 'MODAL'
          ? setAppModalError(message)
          : setAppToastError(message)

        responseBody = null
      }
    } catch (e) {
      console.error(e)
      errorKind === 'MODAL'
        ? setAppModalError(DEFAULT_ERROR)
        : setAppToastError(DEFAULT_ERROR)
      responseBody = null
    } finally {
      clearAppLoading()
    }

    return responseBody
  }

  const requestSilent = async (request: () => Promise<Response>) => {
    let responseBody
    try {
      const response = await request()
      const data = await response.json()
      if (response.status < 300) {
        responseBody = data
      } else {
        const { message } = data ?? {
          message: DEFAULT_ERROR,
        }
        console.error(message)
        responseBody = null
      }
    } catch (e) {
      console.error(e)
      responseBody = null
    }

    return responseBody
  }

  const getUserById = (userId: number) => {
    for (const relation in userRelationships) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const user = userRelationships[relation].find(({ id }) => id === userId)
      if (user) return user
    }
    return unknownProfile
  }

  const value = {
    isAppLoading,
    loadingMessage,
    showAppLoading,
    showAppLoadingWithMessage,
    clearAppLoading,
    errorMessage,
    errorKind,
    setAppModalError,
    setAppToastError,
    clearAppError,
    requestOrAppError,
    activeConversation,
    userConversations,
    olderMessages,
    requestSilent,
    displayedProfile,
    setDisplayedProfile,
    userFriends,
    userRequests,
    otherUsers,
    getUserById,
    setActiveConversation,
    readLocalMessages,
    setOlderMessages,
    addNewConversation,
    addMessageToActiveConversation,
    syncData,
  }

  return (
    <ApplicationContext.Provider value={value}>
      {!loading && children}
      {loading && <PageLoading />}
    </ApplicationContext.Provider>
  )
}
