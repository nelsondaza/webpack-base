import { render } from 'react-dom'

import App from './App'

const mountNode = document.getElementById('app')
render(<App name="Jane ..." />, mountNode)
