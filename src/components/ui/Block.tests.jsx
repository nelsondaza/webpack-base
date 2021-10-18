import Component from './Block'

describe('ui::Block', () => {
  const tc = createTestComponent(Component)

  it('renders a child', () => {
    tc.setProps({ children: 'Children' })

    expect(tc.scope.type()).toBe('div')
    expect(tc.scope.text()).toBe('Children')
  })

  it('renders className', () => {
    expectBecameTrue({
      fn: () => tc.setProps({ className: 'newClass' }),
      of: () => tc.scope.hasClass('newClass'),
    })
  })
})
