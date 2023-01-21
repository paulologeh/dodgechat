import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketEvent } from 'types/sockets'
import { useUser } from 'contexts/userContext'

const SERVER = process.env.APP_URL ?? ''
const socket = io(SERVER, { autoConnect: false, withCredentials: true })

export const useWebsockets = () => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [events, setEvents] = useState<Partial<SocketEvent>[]>([])
  const [lastPong, setLastPong] = useState<Date | null>(null)
  const [lastPing, setLastPing] = useState<Date | null>(null)
  const { loggedIn } = useUser()

  useEffect(() => {
    if (loggedIn && !isConnected) {
      socket.connect()
      setIsConnected(true)
    }

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('pong', () => {
      setLastPong(new Date())
    })

    socket.on('ping', () => {
      setLastPing(new Date())
    })

    socket.on('message', (payload) => {
      const { data } = payload
      const newevents = [...events, data]
      setEvents(newevents)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pong')
      socket.off('ping')
      socket.off('message')
    }
  }, [])

  const disconnect = () => {
    if (loggedIn && isConnected) {
      socket.disconnect()
    }
  }

  return { isConnected, setEvents, events, disconnect, lastPing, lastPong }
}
