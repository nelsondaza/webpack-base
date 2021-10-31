import { doc } from 'storybook-readme'
import { storiesOf } from '@storybook/react'

import README from '../README.md'

storiesOf(' Webpack Base', module).add('README', doc(README))
