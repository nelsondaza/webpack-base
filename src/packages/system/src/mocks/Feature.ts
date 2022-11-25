import { buildMock } from 'utils'

const mock = buildMock({
  enabled: true,
  value: 'red',
  users: undefined,
  access: undefined,
})

const dataUser = buildMock({
  email: 'feature@email.com',
  id: 'ABCFEAT',
  username: 'feature-user',
  value: undefined,
})

const dataAccess = buildMock({
  level: 2,
  scope: 'level_access',
  value: undefined,
})

const mockProperties = {
  User: dataUser,
  Access: dataAccess,
  withUsers: (users = [dataUser()]) => ({
    ...mock(),
    users: users.map((u) => dataUser(u)),
  }),
  withAccess: (access = [dataAccess()]) => ({
    ...mock(),
    access: access.map((a) => dataAccess(a)),
  }),
}

Object.assign(mock, mockProperties)

export default mock as typeof mock & typeof mockProperties
