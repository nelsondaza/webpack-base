import buildMock from './index'

describe('utils::buildMock', () => {
  it('uses defaultProps as default response', () => {
    const defaultProps = { id: '1', name: 'name' }
    const m = buildMock(defaultProps)
    expect(m()).toEqual(defaultProps)
  })

  it('response changes id by default', () => {
    const defaultProps = { id: '1', name: 'name' }
    const m = buildMock(defaultProps)
    expect(m('2')).toEqual({ ...defaultProps, id: '2' })
  })

  it('response can merge params', () => {
    const defaultProps = { id: '1', name: 'name' }
    const m = buildMock(defaultProps)
    expect(m({ name: 'second' }, '3')).toEqual({ name: 'second', id: '3' })
  })

  it('can use a different key as id', () => {
    const defaultProps = { id: '1', name: 'name' }
    const m = buildMock(defaultProps, 'uid')
    expect(m('22')).toEqual({ ...defaultProps, uid: '22' })
  })
})
