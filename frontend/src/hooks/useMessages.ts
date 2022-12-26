import { useEffect, useState } from 'react'
import { useOnScreen } from 'hooks/useOnScreen'
import { useApplication } from 'contexts/applictionContext'
import { Conversations } from 'api'
import { Message } from 'types/api'
import { isEmpty } from 'lodash'

export const useMessages = () => {
  const { activeConversation, addMessagesToActiveConversation } =
    useApplication()
  const { messages } = activeConversation ?? { messages: [] }
  const [lastMessageRef, setLastMessageRef] = useState(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [hasMore, setHasMore] = useState(!!activeConversation?.id)
  const isIntersecting = useOnScreen({ current: lastMessageRef })

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
        const msgs: Message[] = await response.json()
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
  }
}
