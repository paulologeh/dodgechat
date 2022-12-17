import { fetcher } from 'utils'

const ROOT = `${process.env.API_URI}/api/conversations`

type NewConversation = {
  recipientId: string
  messageBody: string
}

export class Conversations {
  static getAllConversations() {
    return fetcher(`${ROOT}`, 'GET')
  }

  static createConversation(conversation: NewConversation) {
    return fetcher(`${ROOT}`, 'POST', conversation)
  }

  static getConversation(conversationId: string, limit: number | null) {
    if (limit) {
      return fetcher(`${ROOT}/${conversationId}/messages?limit=${limit}`, 'GET')
    } else {
      return fetcher(`${ROOT}/${conversationId}/messages`, 'GET')
    }
  }

  static sendMessage(conversationId: string, text: string) {
    return fetcher(`${ROOT}/${conversationId}/messages`, 'POST', {
      body: text,
    })
  }

  static readMessages(ids: string[]) {
    return fetcher(`${ROOT}/messages/read`, 'POST', {
      ids: ids,
    })
  }
}
