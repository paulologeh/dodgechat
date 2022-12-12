import { chakra, ChakraProps, OmitCommonProps } from '@chakra-ui/react'
import { SVGProps } from 'react'

export const EnterIcon = (
  props: JSX.IntrinsicAttributes &
    OmitCommonProps<SVGProps<SVGSVGElement>, keyof ChakraProps> &
    ChakraProps & { as?: 'svg' | undefined }
) => {
  return (
    <chakra.svg
      strokeWidth="2px"
      width="16px"
      height="16px"
      viewBox="0 0 20 20"
      {...props}
    >
      <g
        stroke="currentColor"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 3v4c0 2-2 4-4 4H2" />
        <path d="M8 17l-6-6 6-6" />
      </g>
    </chakra.svg>
  )
}
