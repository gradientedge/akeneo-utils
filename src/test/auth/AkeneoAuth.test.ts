import nock from 'nock'
import { AkeneoAuth, AkeneoAuthConfig } from '../../lib'
import { AkeneoGrantResponse } from '../../lib/auth/types'
import FakeTimers from '@sinonjs/fake-timers'

const defaultConfig: AkeneoAuthConfig = {
  endpoint: 'https://test-auth-endpoint',
  username: 'test-username',
  password: 'test-password',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
}

const defaultClientGrantResponse: AkeneoGrantResponse = {
  access_token: 'test-access-token',
  expires_in: 172800,
}

const defaultResponseToken: AkeneoGrantResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 172800,
}

function nockGetClientGrant(body = '') {
  return nock('https://test-auth-endpoint')
    .post(
      '/api/oauth/v1/token',
      body || {
        username: 'test-username',
        password: 'test-password',
        grant_type: 'password',
      },
    )
    .reply(200, defaultClientGrantResponse)
}

describe('AkeneoAuth', () => {
  beforeAll(() => {
    nock.disableNetConnect()
  })

  beforeEach(() => {
    nock.cleanAll()
  })

  describe('constructor', () => {
    it('should use the expected defaults for optional config properties', () => {
      const auth = new AkeneoAuth(defaultConfig)
      expect((auth as any).config).toMatchObject({
        endpoint: 'https://test-auth-endpoint',
        username: 'test-username',
        password: 'test-password',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshIfWithinSecs: 1800,
      })
    })

    it('should override the config defaults when config options are explicitly passed in', () => {
      const auth = new AkeneoAuth({
        ...defaultConfig,
        refreshIfWithinSecs: 2500,
      })
      expect((auth as any).config).toMatchObject({
        endpoint: 'https://test-auth-endpoint',
        username: 'test-username',
        password: 'test-password',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshIfWithinSecs: 2500,
      })
    })
  })

  describe('getClientGrant', () => {
    it('should directly make a request to get a new grant when no grant is cached', async () => {
      const clock = FakeTimers.install({ now: new Date('2020-01-01T09:35:23.000') })
      const auth = new AkeneoAuth(defaultConfig)
      const scope = nockGetClientGrant()

      const token = await auth.getClientGrant()

      scope.isDone()
      expect(token).toEqual({
        accessToken: 'test-access-token',
        expiresIn: 172800,
        expiresAt: new Date('2020-01-03T09:35:23.000'),
      })
      clock.uninstall()
    })

    it('should return the cached grant if it has not expired', async () => {
      const clock = FakeTimers.install({ now: new Date('2020-01-01T09:35:23.000') })
      const auth = new AkeneoAuth(defaultConfig)
      const scope = nockGetClientGrant()
      await auth.getClientGrant()
      // Set the date/time ahead by 1 day
      clock.setSystemTime(new Date('2020-01-02T09:35:23.000'))

      const token = await auth.getClientGrant()

      scope.isDone()
      expect(token).toEqual({
        accessToken: 'test-access-token',
        expiresIn: 172800,
        expiresAt: new Date(1578044123000),
      })
      clock.uninstall()
    })
  })

  describe('multiple simultaneous requests', () => {
    it('should make all requests wait for the pending client credentials', (done) => {
      const scope = nock('https://test-auth-endpoint')
        .post('/api/oauth/v1/token', {
          username: 'test-username',
          password: 'test-password',
          grant_type: 'password',
        })
        .delay(1500)
        .reply(200, defaultResponseToken)
      const auth = new AkeneoAuth(defaultConfig)

      const promises: Promise<any>[] = []

      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          promises.push(auth.getClientGrant())
        }, i * 10)
      }

      setTimeout(async () => {
        const token = await Promise.all(promises)
        expect(token.length).toBe(5)
        scope.isDone()
        done()
      }, 1000)
    })
  })
})
