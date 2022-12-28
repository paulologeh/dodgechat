import { fetcher } from 'utils'

const ROOT = `${process.env.API_URI}/api/conversations`

type NewConversation = {
  recipientId: number
  messageBody: string
}

export class Conversations {
  static getAllConversations() {
    return fetcher(`${ROOT}`, 'GET')
  }

  static createConversation(conversation: NewConversation) {
    return fetcher(`${ROOT}`, 'POST', conversation)
  }

  static getConversation(
    conversationId: string,
    limit: number,
    timestamp: Date
  ) {
    return fetcher(
      `${ROOT}/${conversationId}?limit=${limit}&timestamp=${timestamp}`,
      'GET'
    )
  }

  static sendMessage(conversationId: string, text: string) {
    return fetcher(`${ROOT}/${conversationId}`, 'POST', {
      body: text,
    })
  }

  static deleteConversation(conversationId: string) {
    return fetcher(`${ROOT}/${conversationId}`, 'DELETE')
  }

  static readMessages(ids: string[]) {
    return fetcher(`${ROOT}/messages/read`, 'POST', {
      ids: ids,
    })
  }

  static deleteMessages(ids: string[]) {
    return fetcher(`${ROOT}/messages/delete`, 'DELETE', {
      ids: ids,
    })
  }
}
