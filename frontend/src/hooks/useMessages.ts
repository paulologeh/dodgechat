import { useEffect, useState } from 'react'
import { useOnScreen } from 'hooks/useOnScreen'
import { useApplication } from 'contexts/applictionContext'
import { Conversations } from 'api'
import { Conversation } from 'types/api'
import { isEmpty } from 'lodash'
import { useUser } from 'contexts/userContext'

export const useMessages = () => {
  const {
    activeConversation,
    addMessagesToActiveConversation,
    readLocalMessages,
    getUserById,
  } = useApplication()
  const { currentUser } = useUser()
  const { messages, recipientId, senderId } = activeConversation ?? {
    messages: [],
  }
  const [lastMessageRef, setLastMessageRef] = useState<HTMLElement | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [hasMore, setHasMore] = useState(
    !activeConversation?.id || messages.length >= 10
  )
  const [isReading, setIsReading] = useState(false)
  const isIntersecting = useOnScreen({ current: lastMessageRef })
  const userId = senderId === currentUser.id ? recipientId : senderId
  const user = getUserById(userId ?? 0)

  const readUnreadMessages = async () => {
    if (isEmpty(messages) || isReading) return

    const unreadMessageIds =
      messages
        .filter((msg) => msg.senderId === user.id && !msg.read)
        .map((msg) => msg.id) ?? []

    if (isEmpty(unreadMessageIds)) return

    setIsReading(true)

    try {
      const response = await Conversations.readMessages(unreadMessageIds)
      if (response.status === 200) {
        readLocalMessages(unreadMessageIds)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsReading(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!activeConversation?.id || isLoadingMessages || !hasMore) return

    const timestamp = messages[0].createdAt
    setIsLoadingMessages(true)

    try {
      const response = await Conversations.getConversation(
        activeConversation.id,
        10,
        timestamp
      )
      if (response.status === 200) {
        const conversation: Conversation = await response.json()
        if (isEmpty(conversation)) return
        const msgs = conversation.messages
        if (isEmpty(msgs)) {
          setHasMore(false)
        } else {
          addMessagesToActiveConversation(msgs)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (isIntersecting) {
      loadMoreMessages().catch(console.error)
    }
  }, [isIntersecting])

  return {
    messages,
    isLoadingMessages,
    setLastMessageRef,
    readUnreadMessages,
  }
}
