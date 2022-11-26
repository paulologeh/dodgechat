import { SearchIcon } from '@chakra-ui/icons'
import {
  Alert,
  Avatar,
  Box,
  Center,
  chakra,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useEventListener,
  useToast,
  useUpdateEffect,
} from '@chakra-ui/react'
import MultiRef from 'react-multi-ref'
import scrollIntoView from 'scroll-into-view-if-needed'
import {
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { FriendMinimal } from 'types/api'
import { Search as SearchService } from 'services/search'
import { debounce, isEmpty } from 'lodash'
import { useDashboardStore } from 'contexts/dashboardContext'
import './SearchModal.css'

const SearchNoResults = () => <Alert status="warning">No results found</Alert>

const SearchError = ({ message }: { message: string }) => (
  <Alert status="error">{message}</Alert>
)

export const UserSearch = () => {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [shouldCloseModal, setShouldCloseModal] = useState(true)
  const [menuNodes] = useState(() => new MultiRef<number, HTMLElement>())
  const [results, setResults] = useState<FriendMinimal[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const menu = useDisclosure()
  const modal = useDisclosure()
  const menuRef = useRef<HTMLDivElement>(null)
  const eventRef = useRef<'mouse' | 'keyboard' | null>(null)
  const { setDashboardStore } = useDashboardStore()
  const toast = useToast()
  const resultsLength = results?.length ?? 0

  useEventListener('keydown', (event) => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.userAgent)
    const hotkey = isMac ? 'metaKey' : 'ctrlKey'
    if (event?.key?.toLowerCase() === 'k' && event[hotkey]) {
      event.preventDefault()
      modal.isOpen ? modal.onClose() : modal.onOpen()
    }
  })

  useEffect(() => {
    if (modal.isOpen && query.length > 0) {
      setQuery('')
      setResults(null)
      setError('')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen])

  const search = async (term: string) => {
    try {
      const response = await SearchService.searchAll(term)
      const data = await response.json()
      if (response.status === 200) {
        const userResults: FriendMinimal[] = [...data.users.results]
        setResults(userResults)
      } else {
        setError(data.message ?? 'Something went wrong. Try again later')
        setResults(null)
      }
    } catch (error) {
      console.error(error)
      setError('Something went wrong. Try again later')
      setResults(null)
    }
    setLoading(false)
  }

  const handleSearchChange = async (e: {
    target: { value: SetStateAction<string> }
  }) => {
    setError('')
    if (isEmpty(e.target.value)) {
      setLoading(false)
      setResults([])
      setQuery('')
      debouncedSearch.cancel()
    } else {
      setQuery(e.target.value)
      setLoading(true)
      debouncedSearch(e.target.value)
    }
    menu.onOpen()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      search(value).then()
    }, 500),
    []
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      eventRef.current = 'keyboard'
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (active + 1 < resultsLength) {
            setActive(active + 1)
          }
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          if (active - 1 >= 0) {
            setActive(active - 1)
          }
          break
        }
        case 'Control':
        case 'Alt':
        case 'Shift': {
          e.preventDefault()
          setShouldCloseModal(true)
          break
        }
        case 'Enter': {
          if (resultsLength <= 0) {
            break
          }

          modal.onClose()
          break
        }
      }
    },
    [active, modal, results]
  )

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    eventRef.current = 'keyboard'
    switch (e.key) {
      case 'Control':
      case 'Alt':
      case 'Shift': {
        e.preventDefault()
        setShouldCloseModal(false)
      }
    }
  }, [])

  useUpdateEffect(() => {
    setActive(0)
  }, [query])

  useUpdateEffect(() => {
    if (!menuRef.current || eventRef.current === 'mouse') return
    const node = menuNodes.map.get(active)
    if (!node) return
    scrollIntoView(node, {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
      boundary: menuRef.current,
    })
  }, [active])

  const handleSearchSelect = (username: string) => {
    const fetchAndViewProfile = async () => {
      try {
        const response = await SearchService.searchUser(username)
        const responseData = await response.json()
        if (response.status === 200) {
          setDashboardStore((prevState) => ({
            ...prevState,
            openUserProfileModal: true,
            selectedUserProfile: responseData,
          }))
        } else {
          toast({
            title: 'Unable to view profile',
            description: responseData.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error(error)
        toast({
          title: 'Unable to view profile',
          description:
            "We've cannot view this user's profile right now. Try again later",
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    }

    if (shouldCloseModal) {
      modal.onClose()
    }
    fetchAndViewProfile().then()
  }

  const open = menu.isOpen && resultsLength > 0

  return (
    <>
      <IconButton
        variant="ghost"
        aria-label="Search users"
        icon={<SearchIcon />}
        onClick={modal.onOpen}
      />
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        blockScrollOnMount={false} // prevents react-remove-scroll error when mounting multiple modals
        // see -> https://github.com/chakra-ui/chakra-ui/issues/6213
      >
        <ModalOverlay />
        <ModalContent
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
          rounded="lg"
          overflow="hidden"
          top="4vh"
          bg="transparent"
          shadow="lg"
          maxW="600px"
        >
          <Flex pos="relative" align="stretch">
            <chakra.input
              aria-autocomplete="list"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              maxLength={64}
              sx={{
                w: '100%',
                h: '68px',
                pl: '68px',
                fontWeight: 'medium',
                outline: 0,
                bg: 'white',
                '.chakra-ui-dark &': { bg: 'gray.700' },
              }}
              placeholder="Search for users"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
            />
            <Center pos="absolute" left={7} h="68px">
              {loading ? (
                <Spinner color="teal.500" />
              ) : (
                <SearchIcon color="teal.500" boxSize="20px" />
              )}
            </Center>
          </Flex>
          <ModalBody maxH="66vh" p="0" ref={menuRef}>
            {resultsLength === 0 && results !== null && <SearchNoResults />}
            {error && <SearchError message={error} />}
            {open && (
              <Box
                sx={{
                  px: 4,
                  bg: 'white',
                  '.chakra-ui-dark &': { bg: 'gray.700' },
                }}
              >
                <Box as="ul" role="listbox" borderTopWidth="1px" pt={2} pb={4}>
                  {(results ?? []).map((item, index) => {
                    const selected = index === active

                    return (
                      <span key={index} className="fake-link">
                        <Box
                          id={`search-item-${index}`}
                          as="li"
                          aria-selected={selected ? true : undefined}
                          onMouseEnter={() => {
                            setActive(index)
                            eventRef.current = 'mouse'
                          }}
                          onClick={() => handleSearchSelect(item.username)}
                          ref={menuNodes.ref(index)}
                          role="option"
                          key={item.username}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minH: 16,
                            mt: 2,
                            px: 4,
                            py: 2,
                            rounded: 'lg',
                            bg: 'gray.100',
                            '.chakra-ui-dark &': { bg: 'gray.600' },
                            _selected: {
                              bg: 'teal.500',
                              color: 'white',
                              mark: {
                                color: 'white',
                                textDecoration: 'underline',
                              },
                            },
                          }}
                        >
                          <Avatar size="sm" src={item.gravatar} />
                          <Box flex="1" ml="4">
                            <Box
                              fontWeight="medium"
                              fontSize="xs"
                              opacity={0.7}
                            >
                              {'@'}
                              {item.username}
                            </Box>
                            <Box fontWeight="semibold">{item.name}</Box>
                          </Box>
                        </Box>
                      </span>
                    )
                  })}
                </Box>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
