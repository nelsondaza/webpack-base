import { SimpleButton } from 'ui'

import Block from './components/ui/Block'

interface Props {
  name: string
}

export default ({ name }: Props) => (
  <Block>
    <h1 className="text-4xl">Tailwind 4 {name}</h1>
    <button
      type="button"
      className="group p-2 w-full flex items-center justify-between rounded-full border border-gray-300 shadow-sm space-x-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <span className="min-w-0 flex-1 flex items-center space-x-3">
        <span className="block flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full"
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="test"
          />
        </span>
        <span className="block min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-900 truncate">Lindsay Walton</span>
          <span className="block text-sm font-medium text-gray-500 truncate">Front-end Developer</span>
        </span>
      </span>
      <span className="flex-shrink-0 h-10 w-10 inline-flex items-center justify-center">
        <svg
          className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
    <hr />
    <h1 className="text-4xl">Semantic</h1>
    <div className="ui card">
      <div className="image">
        <img
          alt="test"
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        />
      </div>
      <div className="content">
        <a href="/" className="header">
          Kristy
        </a>
        <div className="meta">
          <span className="date">Joined in 2013</span>
        </div>
        <div className="description">Kristy is an art director living in New York.</div>
      </div>
      <div className="extra content">
        <a href="/">
          <i className="user icon" />
          22 Friends
        </a>
      </div>
    </div>
    <hr />
    <h1>Packages</h1>
    {/* @ts-ignore */}
    Value from System: <SimpleButton>{SYSTEM.appName}</SimpleButton>
  </Block>
)
