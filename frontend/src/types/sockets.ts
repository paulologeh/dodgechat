export type ConversationSyncKind = 'NEW' | 'UPDATE' | 'DELETE'

type EventName = 'message' | 'relationship'

export type SocketEvent = {
  name: EventName
  id: string
  kind: ConversationSyncKind
}
