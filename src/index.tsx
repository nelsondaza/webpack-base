import { render } from "react-dom";

import App from './App';

var mountNode = document.getElementById("app");
render(<App name="Jane ..." />, mountNode);
