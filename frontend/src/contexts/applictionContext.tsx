import { createContext, FC, useContext, useState } from 'react'
import { Conversation, FriendMinimal, Message, UserProfile } from 'types/api'

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

const ApplicationContext = createContext({})

export function useApplication() {
  return useContext(ApplicationContext)
}

const DEFAULT_ERROR = 'Something went wrong. Please try again later'

export const ApplicationProvider: FC = ({ children }) => {
  const [appLoading, setAppLoading] = useState<LoadingState>(initialAppLoading)
  const [appError, setAppError] = useState<ErrorsState>(initialAppError)
  const [chat] = useState<ChatState>(initialChatState)
  const [displayedProfile, setDisplayedProfile] = useState<UserProfile | null>(
    null
  )
  const [userRelationships] = useState<UserRelationshipsState>(
    initialUserRelationshipState
  )

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
      loadingMessage: message,
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

  const requestOrError = async (
    errorKind: ErrorKind,
    appLoadingMessage: string | null,
    request: () => Promise<Response>
  ): Promise<never | null> => {
    if (errorKind === null) {
      throw 'errorKind cannot be null'
    }

    let responseBody

    appLoadingMessage
      ? showAppLoadingWithMessage(appLoadingMessage)
      : showAppLoading

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

  const { errorMessage, errorKind } = appError
  const { isAppLoading, loadingMessage } = appLoading
  const { userConversations, activeConversationId } = chat
  const activeConversation = userConversations.find(
    ({ id }) => id === activeConversationId
  )
  const { userFriends, userRequests, otherUsers } = userRelationships

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
    requestOrError,
    activeConversation,
    userConversations,
    requestSilent,
    displayedProfile,
    setDisplayedProfile,
    userFriends,
    userRequests,
    otherUsers,
  }

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}
