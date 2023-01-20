import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketEvent } from 'types/sockets'
import { useUser } from 'contexts/userContext'
import beepSound from 'assets/messagealert.mp3'

const SERVER = process.env.APP_URL ?? ''
const socket = io(SERVER, { autoConnect: false, withCredentials: true })

export const useWebsockets = () => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [events, setEvents] = useState<Partial<SocketEvent>[]>([])
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

    socket.on('message', (payload) => {
      const audio = new Audio(beepSound)
      audio.play().catch(console.error)
      const { data } = payload
      const newevents = [...events, data]
      setEvents(newevents)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message')
    }
  }, [])

  const disconnect = () => {
    if (loggedIn && isConnected) {
      socket.disconnect()
    }
  }

  return { isConnected, setEvents, events, disconnect }
}
