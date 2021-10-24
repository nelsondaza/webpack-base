import { ComponentStory, ComponentMeta } from '@storybook/react'

import Block from './Block'

export default {
  title: 'Block',
  component: Block,
  parameters: {
    controls: { expanded: false },
  },
} as ComponentMeta<typeof Block>

export const Default: ComponentStory<typeof Block> = (props) => <Block {...props} />

Default.args = {
  children: 'Block Content',
}
