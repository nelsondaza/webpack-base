import * as exports from './index'

describe('ui::package', () => {
  it('exports the right elements', () => {
    expectKeys(exports, [
      'SimpleButton',
    ])
  })
})
