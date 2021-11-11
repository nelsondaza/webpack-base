import { ComponentStory, ComponentMeta } from '@storybook/react'

import Block from './Block'

export default {
  title: 'components/ui/Block',
  component: Block,
} as ComponentMeta<typeof Block>

export const Default: ComponentStory<typeof Block> = (props) => <Block {...props} />

Default.args = {
  children: 'Block Content',
}
