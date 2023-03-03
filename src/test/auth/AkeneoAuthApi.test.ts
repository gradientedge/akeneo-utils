import nock from 'nock'
import { AkeneoAuthConfig, AkeneoError } from '../../lib'
import { AkeneoAuthApi } from '../../lib/auth/AkeneoAuthApi'
import { AkeneoGrantResponse } from '../../lib/auth/types'

const defaultConfig: AkeneoAuthConfig = {
  endpoint: 'https://test-endpoint',
  username: 'test-username',
  password: 'test-password',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  timeoutMs: 1000,
}

const defaultResponseToken: AkeneoGrantResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 172800,
}

describe('AkeneoAuthApi', () => {
  beforeAll(() => {
    nock.disableNetConnect()
  })

  describe('getClientGrant', () => {
    it('should call akeneo with the expected request', async () => {
      const scope = nock('https://test-endpoint')
        .post('/api/oauth/v1/token', {
          username: 'test-username',
          password: 'test-password',
          grant_type: 'password',
        })
        .reply(200, defaultResponseToken)
      const auth = new AkeneoAuthApi(defaultConfig)

      const grant = await auth.getClientGrant()

      scope.isDone()
      expect(grant).toEqual(defaultResponseToken)
    })
  })

  describe('post', () => {
    it('should POST to the expected URL and return the result when no errors occurs', async () => {
      const scope = nock('https://test-endpoint')
        .post('/api/oauth/v1/test', { name: 'Adrian', age: 13.75 })
        .reply(200, { test: 1 })
      const auth = new AkeneoAuthApi(defaultConfig)

      const grant = await auth.post('/test', {
        name: 'Adrian',
        age: 13.75,
      })

      scope.isDone()
      expect(grant).toEqual({ test: 1 })
    })

    it('should throw an error when the underlying request errors', async () => {
      const scope = nock('https://test-endpoint', {
        encodedQueryParams: true,
      })
        .post('/api/oauth/v1/test', { name: 'Adrian', age: 13.75 })
        .reply(500, {})
      const auth = new AkeneoAuthApi(defaultConfig)

      await expect(
        auth.post('/test', {
          name: 'Adrian',
          age: 13.75,
        }),
      ).rejects.toThrow(new AkeneoError('Request failed with status code 500'))

      scope.isDone()
    })
  })

  describe('request timeout behaviour', () => {
    it('should timeout after the default timeout period', async () => {
      nock('https://test-endpoint')
        .post('/api/oauth/v1/token', {
          grant_type: 'password',
          username: 'test-username',
          password: 'test-password',
        })
        .delay(2000)
        .reply(200, defaultResponseToken)
      const auth = new AkeneoAuthApi(defaultConfig)

      try {
        await auth.getClientGrant()
      } catch (e: any) {
        expect(e).toBeInstanceOf(AkeneoError)
        expect(e.toJSON()).toMatchObject({
          data: {
            code: 'ECONNABORTED',
            request: {
              headers: {
                accept: 'application/json, text/plain, */*',
                'accept-encoding': 'gzip, compress, deflate, br',
                authorization: '********',
                'content-length': '79',
                'content-type': 'application/json',
                'user-agent': 'axios/1.3.4',
              },
              method: 'post',
              url: 'https://test-endpoint/api/oauth/v1/token',
            },
            response: {},
          },
          message: 'timeout of 1000ms exceeded',
        })
        return
      }

      fail('auth.getClientGrant should have thrown due to timeout')
    })
  })

  describe('masking', () => {
    it('should mask the Authorization header when an error is thrown', async () => {
      nock('https://test-endpoint')
        .post('/api/oauth/v1/token', {
          username: 'test-username',
          password: 'test-password',
          grant_type: 'password',
        })
        .reply(500)
      const auth = new AkeneoAuthApi(defaultConfig)

      try {
        await auth.getClientGrant()
      } catch (error: any) {
        expect(error?.toJSON()).toEqual({
          data: {
            code: 'ERR_BAD_RESPONSE',
            request: {
              data: {
                grant_type: 'password',
                password: '********',
                username: 'test-username',
              },
              headers: {
                accept: 'application/json, text/plain, */*',
                'accept-encoding': 'gzip, compress, deflate, br',
                authorization: '********',
                'content-length': '79',
                'content-type': 'application/json',
                'user-agent': 'axios/1.3.4',
              },
              method: 'post',
              url: 'https://test-endpoint/api/oauth/v1/token',
            },
            response: {
              data: '',
              status: 500,
            },
          },
          isAkeneoError: true,
          message: 'Request failed with status code 500',
          status: 500,
        })
      }
    })
  })
})
