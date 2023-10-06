import { fetcher } from 'utils'

const ROOT = `${process.env.APP_URL}/api/conversations`

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
    limit: number | null,
    timestamp: Date | null
  ) {
    const params = new URLSearchParams()
    if (limit) {
      params.append('limit', limit.toString())
    }
    if (timestamp) {
      params.append('timestamp', timestamp.toString())
    }

    let url = `${ROOT}/${conversationId}`

    if (timestamp || limit) {
      url = url.concat('?')
      return fetcher(url + params, 'GET')
    } else {
      return fetcher(url, 'GET')
    }
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
