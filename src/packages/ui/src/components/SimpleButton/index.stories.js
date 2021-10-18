import { action } from '@storybook/addon-actions'
import { boolean, select, text } from '@storybook/addon-knobs'

import SimpleButton from './index'

export default {
  component: SimpleButton,
  title: 'ui/components/SimpleButton',
}

const getProps = () => ({
  ariaLabel: text('ariaLabel', ''),
  children: text('children', 'simple button'),
  className: text('className', ''),
  icon: text('icon', ''),
  itemsDirection: select('itemsDirection', ['ltr', 'rtl', 'ttb', 'btt'], 'ltr'),
  onClick: action('onClick'),
  primary: boolean('primary', false),
  secondary: boolean('secondary', false),
  tertiary: boolean('tertiary', false),
  value: text('value', ''),
})

export const normal = () => (
  <div>
    <SimpleButton primary>Primary</SimpleButton>
    <br />
    <SimpleButton secondary>Secondary</SimpleButton>
    <br />
    <SimpleButton tertiary>Tertiary</SimpleButton>
    <br />
    Controlado: <SimpleButton {...getProps()} />
  </div>
)

export const icon = () => (
  <div>
    Primary: <SimpleButton primary icon="user" />
    <br />
    Secondary: <SimpleButton secondary icon="building" />
    <br />
    Tertiary: <SimpleButton tertiary icon="cancel" />
    <br />
    Left Icon: <SimpleButton icon="soccer">Left Icon</SimpleButton>
    <br />
    Right Icon:{' '}
    <SimpleButton icon="arrow right" itemsDirection="rtl">
      Right Icon
    </SimpleButton>
    <br />
    Top Icon:{' '}
    <SimpleButton icon="hand point down" itemsDirection="ttb">
      Top Icon
    </SimpleButton>
    <br />
    Bottom Icon:{' '}
    <SimpleButton icon="bath" itemsDirection="btt">
      Bottom Icon
    </SimpleButton>
    <br />
    Controlado: <SimpleButton {...getProps()} />
  </div>
)
