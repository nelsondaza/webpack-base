import Features from './index'
import m from '../mocks'

describe('system::Features', () => {
  const Feature = new Features()
  beforeEach(() => {
    Feature.resetFeatures()
    Feature.set({ features_flags: 'on' })
  })

  const expectFeatureMatch = (name, match) => {
    expect(Feature.features[name]).toMatchObject(match)
  }

  const mockAccess = (props = {}) => ({
    id: 'ABC',
    level: 3,
    scope: 'scope',
    ...props,
  })

  const mockUser = (props = {}) => ({
    avatar: 'avatar.jpg',
    email: 'user@email.com',
    first_name: 'fname',
    id: 'ABC',
    last_name: 'lname',
    level: 23,
    name: 'Name Last',
    points: 23,
    username: 'username',
    ...props,
  })

  it('has all features enabled by default', () => {
    Feature.set({ a: 'on', b: 1, c: true, d: 'off', features_flags: 'off' })

    expect(Feature.isEnabled('a')).toBe(true)
    expect(Feature.isEnabled('b')).toBe(true)
    expect(Feature.isEnabled('c')).toBe(true)
    expect(Feature.isEnabled('d')).toBe(true)
    expect(Feature.isEnabled('thisOneIsNotSet')).toBe(true)
    expect(Feature.isEnabledWithAccess('NotSet', null)).toBe(true)
    expect(Feature.isEnabledForUser('NotSet', null)).toBe(true)
  })

  it('flags are enabled/disabled after main flag is set to ON', () => {
    Feature.set({ a: 'on', b: 1, c: true, d: 'off', features_flags: 'on' })

    expect(Feature.isEnabled('a')).toBe(true)
    expect(Feature.isEnabled('b')).toBe(true)
    expect(Feature.isEnabled('c')).toBe(true)
    expect(Feature.isEnabled('d')).toBe(false)
    expect(Feature.isEnabled('thisOneIsNotSet')).toBe(false)
    expect(Feature.isEnabledWithAccess('NotSet', null)).toBe(false)
    expect(Feature.isEnabledForUser('NotSet', null)).toBe(false)
  })

  it('used userFunction when set', () => {
    const getUserMock = jest.fn()
    Feature.setUserFunction(getUserMock)
    expectChange({
      fn: () => Feature.getUser(),
      of: () => getUserMock.mock.calls.length,
      by: 1,
    })
    Feature.setUserFunction(Function.prototype)
  })

  it('undefined features set Feature as disabled', () => {
    Feature.resetFeatures()
    Feature.set({})
    expect(Feature.enabled).toBe(false)
  })

  describe('status', () => {
    describe('enabled', () => {
      const values = {
        on: 'on',
        true: true,
        1: 1,
        string: 'other string',
        object: {},
      }

      Object.keys(values).forEach((key) => {
        it(`when value is "${key}"`, () => {
          Feature.set({ feature: values[key] })
          expectFeatureMatch('feature', { enabled: true, value: values[key] })
          expect(Feature.isEnabled('feature')).toBe(true)
        })
      })

      it('when value is an enabled Feature', () => {
        Feature.set({ feature: m.Feature({ enabled: true }) })
        expectFeatureMatch('feature', { enabled: true, value: 'red' })
        expect(Feature.isEnabled('feature')).toBe(true)
      })
    })

    describe('disabled', () => {
      const values = {
        off: 'off',
        false: false,
        0: 0,
        null: null,
        undefined,
      }

      Object.keys(values).forEach((key) => {
        it(`when value is "${key}"`, () => {
          Feature.set({ feature: values[key] })
          expectFeatureMatch('feature', { enabled: false, value: values[key] })
          expect(Feature.isEnabled('feature')).toBe(false)
        })
      })

      it('when value is a disabled Feature', () => {
        Feature.set({ feature: m.Feature({ enabled: false }) })
        expectFeatureMatch('feature', { enabled: false, value: 'red' })
        expect(Feature.isEnabled('feature')).toBe(false)
      })
    })

    describe('from value', () => {
      describe('enabled', () => {
        const values = {
          on: 'on',
          true: true,
          1: 1,
          string: 'other string',
        }

        Object.keys(values).forEach((key) => {
          it(`when value is "${key}"`, () => {
            Feature.set({ feature: values[key] })
            expect(Feature.value('feature')).toBe(values[key])
          })
        })

        it('when value is an enabled Feature', () => {
          Feature.set({ feature: m.Feature({ enabled: true }) })
          expect(Feature.value('feature')).toBe('red')
        })
      })

      describe('disabled', () => {
        const values = {
          off: 'off',
          false: false,
          0: 0,
          null: null,
          undefined,
        }

        Object.keys(values).forEach((key) => {
          it(`when value is "${key}"`, () => {
            Feature.set({ feature: values[key] })
            expect(Feature.value('feature')).toBeUndefined()
          })
        })

        it('when value is a disabled Feature', () => {
          Feature.set({ feature: m.Feature({ enabled: false }) })
          expect(Feature.value('feature')).toBeUndefined()
        })
      })
    })

    describe('for specific users', () => {
      beforeEach(() => {
        Feature.set({
          featureForUser: {
            ...m.Feature.withUsers(),
            enabled: false,
          },
        })
      })

      describe('enabled', () => {
        it('for a specific email', () => {
          expect(Feature.isEnabledForUser('featureForUser', mockUser({ email: 'feature@email.com' }))).toBe(true)
        })

        it('for no user', () => {
          expect(Feature.isEnabledForUser('featureForUser', null)).toBe(false)
        })

        it('for empty user', () => {
          expect(Feature.isEnabledForUser('featureForUser', {})).toBe(false)
        })

        it('for a specific username', () => {
          expect(Feature.isEnabledForUser('featureForUser', mockUser({ username: 'feature-user' }))).toBe(true)
        })

        it('when regExp matches', () => {
          Feature.set({
            featureRegExp: {
              ...m.Feature.withUsers([{ email: /mail/ }]),
              enabled: false,
            },
          })

          expect(Feature.isEnabledForUser('featureRegExp', mockUser())).toBe(true)
        })

        it('when stringify regExp matches', () => {
          Feature.set({
            featureStringRegExp: {
              ...m.Feature.withUsers([{ email: '!!js/regexp /@email.com$/' }]),
              enabled: false,
            },
          })

          expect(Feature.isEnabledForUser('featureStringRegExp', mockUser())).toBe(true)
        })
      })

      describe('disabled', () => {
        it('is disabled by default', () => {
          expect(Feature.isEnabled('featureForUser')).toBe(false)
        })

        it('for random user', () => {
          expect(Feature.isEnabledForUser('featureForUser', mockUser())).toBe(false)
        })

        it('when no users are set', () => {
          Feature.set({
            featureForNoOne: m.Feature({ enabled: false }),
          })

          expect(Feature.isEnabledForUser('featureForNoOne', mockUser())).toBe(false)
        })

        it('when does not exists', () => {
          expect(Feature.isEnabledForUser('featureForUser23455', mockUser({ email: 'feature@email.com' }))).toBe(false)
        })

        it('when regExp does not matches', () => {
          Feature.set({
            featureRegExp: {
              ...m.Feature.withUsers([{ email: /unknown-mail/ }]),
              enabled: false,
            },
          })

          expect(Feature.isEnabledForUser('featureRegExp', mockUser())).toBe(false)
        })
      })
    })

    describe('for specific access', () => {
      beforeEach(() => {
        Feature.set({
          featureForAccess: {
            ...m.Feature.withAccess(),
            enabled: false,
          },
        })
      })

      describe('enabled', () => {
        it('for a specific level', () => {
          expect(Feature.isEnabledWithAccess('featureForAccess', mockAccess({ level: 2 }))).toBe(true)
        })

        it('for a specific scope', () => {
          expect(Feature.isEnabledWithAccess('featureForAccess', mockAccess({ scope: 'scope' }))).toBe(true)
        })

        it('when scope regExp matches', () => {
          Feature.set({
            featureRegExp: {
              ...m.Feature.withAccess([{ scope: /scoped/ }]),
              enabled: false,
            },
          })

          expect(Feature.isEnabledWithAccess('featureRegExp', mockAccess({ scope: 'new scoped access' }))).toBe(true)
        })
      })

      describe('disabled', () => {
        it('is disabled by default', () => {
          expect(Feature.isEnabled('featureForAccess')).toBe(false)
        })

        it('for random access', () => {
          expect(Feature.isEnabledWithAccess('featureForAccess', mockAccess({ level: 1 }))).toBe(false)
        })

        it('when no access is set', () => {
          Feature.set({
            featureForNoOne: m.Feature({ enabled: false }),
          })

          expect(Feature.isEnabledWithAccess('featureForNoOne', mockAccess())).toBe(false)
        })

        it('when does not exists', () => {
          expect(Feature.isEnabledWithAccess('featureForAccess23455', mockAccess())).toBe(false)
        })

        it('when regExp does not matches', () => {
          Feature.set({
            featureRegExp: {
              ...m.Feature.withAccess([{ scope: /unknown-scope/ }]),
              enabled: false,
            },
          })

          expect(Feature.isEnabledWithAccess('featureRegExp', mockAccess({ level: 1 }))).toBe(false)
        })
      })
    })
  })

  describe('value', () => {
    it('return default value when feature is disabled', () => {
      Feature.set({ feature: m.Feature({ enabled: false }) })
      expect(Feature.value('feature', 'new value')).toBe('new value')
    })

    it('return feature value when feature is enabled', () => {
      Feature.set({ feature: m.Feature() })
      expect(Feature.value('feature', 'new value')).toBe('red')
    })

    it('return feature as value', () => {
      Feature.set({ feature: 'feature_value' })
      expect(Feature.value('feature', 'new value')).toBe('feature_value')
    })

    describe('for specific users', () => {
      beforeEach(() => {
        Feature.set({
          featureValueForUser: {
            ...m.Feature.withUsers([
              {
                email: 'test@test.com',
                value: 'the new value',
              },
            ]),
            enabled: true,
            value: 'FeatMainValue',
          },
        })
      })

      it('default value globally', () => {
        expect(Feature.value('featureValueForUser')).toBe('FeatMainValue')
      })

      it('default value for unknown user', () => {
        expect(Feature.valueForUser('featureValueForUser', mockUser(), 'DefVAl')).toBe('DefVAl')
      })

      it('default value for null user', () => {
        expect(Feature.valueForUser('featureValueForUser', {}, 'DefVAl2')).toBe('DefVAl2')
      })

      it('defaultValue for undefined feature', () => {
        expect(Feature.valueForUser('featureValueForUser234', mockUser(), 'default')).toBe('default')
      })

      it('defaultValue not returned for feature without users and value', () => {
        Feature.set({
          featureWithoutUser: {
            ...m.Feature(),
            enabled: true,
            value: 1,
          },
        })
        expect(Feature.valueForUser('featureWithoutUser', mockUser(), 'default new')).toBe(1)
      })

      it('defaultValue returned for feature without users and no value', () => {
        Feature.set({
          featureWithoutUser: {
            ...m.Feature(),
            enabled: true,
            value: undefined,
          },
        })
        expect(Feature.valueForUser('featureWithoutUser', mockUser(), 'default new')).toBe('default new')
      })

      it('defaultValue for users without its value', () => {
        Feature.set({
          featureWithoutUserValue: {
            ...m.Feature.withUsers([
              {
                email: 'test@test.com',
                value: undefined,
              },
            ]),
            enabled: true,
            value: null,
          },
        })
        expect(
          Feature.valueForUser('featureWithoutUserValue', mockUser({ email: 'test@test.com' }), 'default new'),
        ).toBe('default new')
      })

      it('user value for users with its value', () => {
        Feature.set({
          featureWithUserValue: {
            ...m.Feature.withUsers([
              {
                email: 'test@test.com',
                value: 'user value',
              },
            ]),
            enabled: true,
            value: 'main value',
          },
        })
        expect(Feature.valueForUser('featureWithUserValue', mockUser({ email: 'test@test.com' }), 'default new')).toBe(
          'user value',
        )
      })
    })
  })

  describe('callbacks', () => {
    it('returns current status and calls if already set', () => {
      Feature.set({ callbackFlag: 'cbflag' })
      let value = 1

      expect(
        Feature.isEnabled('callbackFlag', () => {
          value += 1
        }),
      ).toBe(true)

      expectChange({
        fn: () =>
          Feature.isEnabled('callbackFlag', () => {
            value += 1
          }),
        of: () => value,
        from: 2,
        to: 3,
      })
    })

    describe('calls when set', () => {
      it('for isEnabled', () => {
        let value = 1

        expect(
          Feature.isEnabled('callbackFlagEnabled', () => {
            value += 1
          }),
        ).toBe(false)

        expectChange({
          fn: () => Feature.set({ callbackFlagEnabled: 'cbflag' }),
          of: () => value,
          from: 1,
          to: 2,
        })
      })

      it('for isEnabledForUser', () => {
        let value = 1

        expect(
          Feature.isEnabledForUser('callbackFlagEnabledFU', mockUser(), () => {
            value += 1
          }),
        ).toBe(false)

        expectChange({
          fn: () =>
            Feature.set({
              callbackFlagEnabledFU: {
                ...m.Feature.withUsers([{ email: /mail/ }]),
                enabled: false,
              },
            }),
          of: () => value,
          from: 1,
          to: 2,
        })
      })

      it('for isEnabledWithAccess', () => {
        let value = 1

        expect(
          Feature.isEnabledWithAccess('callbackFlagEnabledWA', mockAccess({ level: 2 }), () => {
            value += 1
          }),
        ).toBe(false)

        expectChange({
          fn: () =>
            Feature.set({
              callbackFlagEnabledWA: {
                ...m.Feature.withAccess(),
                enabled: false,
              },
            }),
          of: () => value,
          from: 1,
          to: 2,
        })
      })
    })
  })
})
