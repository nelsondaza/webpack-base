import { ReactNode, useEffect } from 'react'

import '../assets/tailwind/tailwind.css'
import '../assets/semantic-ui/semantic.css'
import './stories.css'

type StoriesHolderProps = {
  environmentSet?: () => void
  children: ReactNode
}

const StoriesHolder = ({ children, environmentSet = () => {} }: StoriesHolderProps) => {
  useEffect(() => environmentSet(), [environmentSet])

  return (
    <div className="StoriesContainer">
      <div className="StoriesContainer__holder">{children}</div>
    </div>
  )
}

export const withEnvironment = (Story: JSX.IntrinsicAttributes) => (
  <StoriesHolder>
    {/* @ts-ignore */}
    <Story />
  </StoriesHolder>
)

export default StoriesHolder
