import * as Jwt from '@hapi/jwt';

export const register = async (server, { name, validator }) => {
  await server.register(Jwt)

  await server.auth.strategy(name, "jwt", {
    keys: 'some_shared_secret',
    verify: {
      aud: 'urn:audience:test',
      iss: 'urn:issuer:test',
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400, // 4 hours
      timeSkewSec: 15
    },
    validate: validator ?? function (artifacts, request, h) {
      console.log(artifacts)

      return {
        isValid: true,
        credentials: { user: artifacts.decoded.payload.user }
      };
    }
  })
}