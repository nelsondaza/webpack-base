import System from './index'

describe('system', () => {
  it('sets a var when calling `call`', () => {
    expectChange({
      fn: () => System.call('key', 'value'),
      of: () => System.key,
      from: undefined,
      to: 'value',
    })
    delete System.key
  })

  it('has exact keys', () => {
    expectKeys(System, [
      'addNotification',
      'api_url',
      'AUTH_HEADERS',
      'call',
      'device',
      'env',
      'Feature',
      'history',
      'notificationsAdd',
      'sentry',
      'static_url',
      'url',
      'version',
      'workbox',
    ])
  })

  it('calls notificationsAdd when set', () => {
    System.notificationsAdd = jest.fn()

    expectChange({
      fn: () => System.addNotification(1, 2, 3),
      of: () => System.notificationsAdd.mock.calls.length,
      by: 1,
    })
    expect(System.notificationsAdd).toHaveBeenLastCalledWith(1, 2, 3)

    System.notificationsAdd = null
  })
})
