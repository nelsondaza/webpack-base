import { storiesOf } from '@storybook/react'
import { doc } from 'storybook-readme'

import README from '../README.md'

storiesOf(' Webpack Base', module).add('README', doc(README))
