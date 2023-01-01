import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketEvent } from 'types/sockets'

const SERVER = process.env.API_URI ?? ''
const socket = io(SERVER)

export const useWebsockets = () => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [events, setEvents] = useState<Partial<SocketEvent>[]>([])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('message', (payload) => {
      const { data } = payload
      const newevents = [...events, { ...data, name: 'message' }]
      setEvents(newevents)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message')
    }
  }, [])

  return { isConnected, setEvents, events }
}
