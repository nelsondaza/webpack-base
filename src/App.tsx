import * as React from 'react'

import { SimpleButton } from 'ui'

import Block from './components/ui/Block'

interface Props {
  name: string
}

export default ({ name }: Props) => (
  <>
    <h1 className="text-4xl text-white bg-black">
      Hello {name}
      <SimpleButton primary>Test 1</SimpleButton>
      <SimpleButton secondary>Test 2</SimpleButton>
      <hr />
      <Block>...</Block>
    </h1>
  </>
)
