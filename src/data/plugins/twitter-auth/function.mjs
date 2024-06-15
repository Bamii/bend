import * as Bell from '@hapi/bell';

export const register = async (server, { name, password, clientId, clientSecret }) => {
  await server.register(Bell)

  await server.auth.strategy(name, "bell", {
    provider: 'twitter',
    password,
    clientId,
    clientSecret,
    isSecure: true  
  })
}