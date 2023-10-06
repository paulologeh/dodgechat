export type ConversationSyncKind = 'NEW' | 'UPDATE' | 'DELETE'

type EventName = 'conversation' | 'relationship'

export type SocketEvent = {
  name: EventName
  id: string
  kind: ConversationSyncKind
}
