import { object, text } from '@storybook/addon-knobs'

import Block from './Block'

export default {
  component: Block,
  title: 'components/ui/Block',
}

export const normal = () => (
  <Block style={object('style', {})} className={text('className', '')}>
    Block content
  </Block>
)
