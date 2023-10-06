import { useLayoutEffect, useMemo, useRef } from 'react'

export const useKeepScrollPosition = (deps: any[] = []) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousScrollPosition = useRef(0)

  useMemo(() => {
    if (containerRef?.current) {
      const container = containerRef?.current
      previousScrollPosition.current =
        container?.scrollHeight - container?.scrollTop
    }
  }, [...deps])

  useLayoutEffect(() => {
    if (containerRef?.current) {
      const container = containerRef?.current || {}
      container.scrollTop =
        container?.scrollHeight - previousScrollPosition.current
    }
  }, [...deps])

  return {
    containerRef,
  }
}
