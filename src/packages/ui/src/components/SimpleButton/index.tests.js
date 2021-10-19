import Component from './index'

import styles from './index.scss'

describe('ui::components::SimpleButton', () => {
  const tc = createTestComponent(Component, {
    className: '',
  })

  it('uses custom className', () => {
    expectBecameTrue({
      fn: () => tc.setProps({ className: 'myClass' }),
      of: () => tc.scope.hasClass('myClass'),
    })
  })

  it('uses primary className', () => {
    expectBecameTrue({
      fn: () => tc.setProps({ primary: true }),
      of: () => tc.scope.hasClass(styles.primary),
    })
  })

  it('uses secondary className', () => {
    expectBecameTrue({
      fn: () => tc.setProps({ secondary: true }),
      of: () => tc.scope.hasClass(styles.secondary),
    })
  })

  it('uses tertiary className', () => {
    expectBecameTrue({
      fn: () => tc.setProps({ tertiary: true }),
      of: () => tc.scope.hasClass(styles.tertiary),
    })
  })

  it('uses ariaLabel when set', () => {
    expectChange({
      fn: () => tc.setProps({ ariaLabel: 'my label for aria' }),
      of: () => tc.scope.find('button').props()['aria-label'],
      to: 'my label for aria',
    })
  })

  describe('icon', () => {
    it('uses iconButton styles when icon but no content', () => {
      tc.setProps({ children: 'text' })
      expectBecameTrue({
        fn: () => tc.setProps({ icon: 'user', children: null }),
        of: () => tc.scope.hasClass(styles.iconButton),
      })
    })

    it('uses iconButton styles when icon but no value', () => {
      tc.setProps({ value: 'text' })
      expectBecameTrue({
        fn: () => tc.setProps({ icon: 'user', value: null }),
        of: () => tc.scope.hasClass(styles.iconButton),
      })
    })
  })

  it('renders icon + space + children', () => {
    expectChange({
      fn: () => tc.setProps({ icon: 'user', children: 'child' }),
      of: () => tc.scope.find('button').text(),
      to: 'userchild',
    })
  })

  it('uses value as aria and content when possible', () => {
    expectChange({
      fn: () => tc.setProps({ value: 'content + aria + value' }),
      of: () => [
        tc.scope.find('button').props()['aria-label'],
        tc.scope.find('button').props().value,
        tc.scope.find('button').text(),
      ],
      to: ['content + aria + value', 'content + aria + value', 'content + aria + value'],
    })
  })

  it('calls onClick when set', () => {
    const onClick = jest.fn()
    tc.setProps({ onClick })
    expectChange({
      fn: () => tc.scope.find('button').simulate('click'),
      of: () => onClick.mock.calls.length,
      by: 1,
    })
  })

  describe('itemsDirection', () => {
    it('rtl uses itemsRTL className', () => {
      expectBecameTrue({
        fn: () => tc.setProps({ itemsDirection: 'rtl' }),
        of: () => tc.scope.hasClass(styles.itemsRTL),
      })
    })

    it('ttb uses itemsTTB className', () => {
      expectBecameTrue({
        fn: () => tc.setProps({ itemsDirection: 'ttb' }),
        of: () => tc.scope.hasClass(styles.itemsTTB),
      })
    })

    it('btt uses itemsBTT className', () => {
      expectBecameTrue({
        fn: () => tc.setProps({ itemsDirection: 'btt' }),
        of: () => tc.scope.hasClass(styles.itemsBTT),
      })
    })
  })
})
