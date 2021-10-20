import { render } from 'react-dom'

import '../config/assets/tailwind/tailwind.css'
import '../config/assets/semantic-ui/semantic.css'

import App from './App'

const mountNode = document.getElementById('app')
render(<App />, mountNode)
