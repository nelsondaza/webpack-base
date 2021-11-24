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

mock.User = dataUser

mock.Access = dataAccess

mock.withUsers = (users = [dataUser()]) => ({
  ...mock(),
  users: users.map((u) => dataUser(u)),
})

mock.withAccess = (access = [dataAccess()]) => ({
  ...mock(),
  access: access.map((a) => dataAccess(a)),
})

export default mock
