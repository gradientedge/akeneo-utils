import nock from 'nock'
import { AkeneoApi, AkeneoApiConfig, AkeneoError } from '../../lib'
import { AkeneoGrantResponse } from '../../lib/auth/types'
import * as https from 'https'

const defaultConfig: AkeneoApiConfig = {
  username: 'test-username',
  password: 'test-password',
  endpoint: 'https://test-endpoint',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  timeoutMs: 1000,
}

const defaultClientGrantResponse: AkeneoGrantResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 172800,
}

describe('AkeneoApi', () => {
  let originalProcessEnv = {}

  beforeAll(() => {
    nock.disableNetConnect()
    nock('https://test-endpoint')
      .persist()
      .post('/api/oauth/v1/token', {
        grant_type: 'password',
        username: 'test-username',
        password: 'test-password',
      })
      .reply(200, defaultClientGrantResponse)

    originalProcessEnv = { ...process.env }
  })

  beforeEach(() => {
    process.env = { ...originalProcessEnv }
  })

  describe('constructor', () => {
    it('should set the `config` member property with the correct values', () => {
      const api = new AkeneoApi({ ...defaultConfig })

      expect(api.config).toEqual({
        username: 'test-username',
        password: 'test-password',
        endpoint: 'https://test-endpoint',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        timeoutMs: 1000,
      })
    })

    it('should set the `config` member property of the local `AkeneoAuth` instance with the correct values', () => {
      const api = new AkeneoApi({ ...defaultConfig })

      expect(api.auth.config).toEqual({
        username: 'test-username',
        password: 'test-password',
        endpoint: 'https://test-endpoint',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        timeoutMs: 1000,
        refreshIfWithinSecs: 1800,
      })
    })

    it('should bubble up the error if `validateConfig` method throws an error', () => {
      expect(() => new AkeneoApi({ ...defaultConfig, endpoint: '' })).toThrowError()
    })
  })

  describe('createAxiosInstance', () => {
    it('should have the User-Agent header set using the userAgent property when using the default value', () => {
      const api = new AkeneoApi(defaultConfig)

      const result = api.createAxiosInstance()

      expect(result.defaults.headers['common']).toMatchObject({
        Accept: 'application/json',
      })
    })

    it('should not set the User-Agent header if not in a nodejs environment', () => {
      process.env.GEAKU_IS_BROWSER = '1'
      const api = new AkeneoApi(defaultConfig)

      const result = api.createAxiosInstance()

      expect(result.defaults.headers['common']?.['UserAgent']).toBeUndefined()
    })

    it('should set the timeout to the given value', () => {
      const api = new AkeneoApi({ ...defaultConfig, timeoutMs: 1234 })

      const result = api.createAxiosInstance()

      expect(result.defaults.timeout).toBe(1234)
    })

    it('should set the https agent when in a nodejs environment', () => {
      const api = new AkeneoApi(defaultConfig)

      const result = api.createAxiosInstance()

      expect(result.defaults.httpsAgent).toBeDefined()
    })

    it('should set the given https agent when in a nodejs environment', () => {
      const api = new AkeneoApi({ ...defaultConfig, httpsAgent: new https.Agent() })

      const result = api.createAxiosInstance()

      expect(result.defaults.httpsAgent).toBeDefined()
    })

    it('should not set the https agent when not in a nodejs environment', () => {
      process.env.GEAKU_IS_BROWSER = '1'
      const api = new AkeneoApi(defaultConfig)

      const result = api.createAxiosInstance()

      expect(result.defaults.httpsAgent).toBeUndefined()
    })
  })

  describe('request', () => {
    it('should timeout after the default timeout period', async () => {
      nock('https://test-endpoint').get('/api/rest/v1/products').delay(2000).reply(200, { success: true })
      const api = new AkeneoApi(defaultConfig)

      try {
        await api.getListOfProducts()
      } catch (e: any) {
        expect(e).toBeInstanceOf(AkeneoError)
        expect(e.toJSON()).toEqual({
          data: {
            code: 'ECONNABORTED',
            request: {
              headers: {
                accept: 'application/json',
                'accept-encoding': 'gzip, compress, deflate, br',
                authorization: '********',
                'user-agent': '',
              },
              method: 'get',
              url: 'https://test-endpoint/api/rest/v1/products',
            },
            response: {},
          },
          isAkeneoError: true,
          message: 'timeout of 1000ms exceeded',
        })
        return
      }
      fail('api.getProductById should have thrown due to timeout')
    })

    describe('retry mechanism', () => {
      describe('with 500 status code response', () => {
        it('should not retry when no retry configuration is passed in to the constructor or method call', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const api = new AkeneoApi(defaultConfig)

          expect(scope1.isDone())
          await expect(api.getListOfProducts()).rejects.toThrow()
        })

        it('should retry once when the appropriate constructor retry configuration is passed in', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: true })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 1,
            },
          })

          const startTime = Date.now()
          const result = await api.getListOfProducts()
          const endTime = Date.now()

          scope1.isDone()
          scope2.isDone()
          expect(endTime - startTime).toBeGreaterThanOrEqual(300)
          expect(result).toEqual({ success: true })
        })

        it('should retry twice when the appropriate constructor retry configuration is passed in', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope3 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: true })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 2,
            },
          })

          const startTime = Date.now()
          const result = await api.getListOfProducts()
          const endTime = Date.now()

          scope1.isDone()
          scope2.isDone()
          scope3.isDone()
          expect(endTime - startTime).toBeGreaterThanOrEqual(900)
          expect(result).toEqual({ success: true })
        })

        it('should only retry once if the first retry request succeeds, even when the retry config allows for more retries', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: true })

          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 4,
            },
          })

          const startTime = Date.now()
          const result = await api.getListOfProducts()
          const endTime = Date.now()

          scope1.isDone()
          scope2.isDone()
          expect(endTime - startTime).toBeGreaterThanOrEqual(300)
          expect(result).toEqual({ success: true })
        })
      })

      describe('with 400 response status code', () => {
        it('should not retry', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(400)
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 4,
            },
          })

          scope1.isDone()
          await expect(api.getListOfProducts()).rejects.toThrow()
        })
      })

      describe('with 200 response status code', () => {
        it('should not retry', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: true })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 4,
            },
          })

          const result = await api.getListOfProducts()

          scope1.isDone()
          await expect(result).toEqual({ success: true })
        })
      })

      describe('method level retry config override', () => {
        it('should use the retry config provided in the method', async () => {
          const scope1 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope3 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(500)
          const scope4 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: true })

          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 100,
              maxRetries: 2,
            },
          })

          const startTime = Date.now()
          const result = await api.getListOfProducts({
            retry: {
              maxRetries: 4,
              delayMs: 500,
            },
          })
          const endTime = Date.now()

          scope1.isDone()
          scope2.isDone()
          scope3.isDone()
          scope4.isDone()
          expect(endTime - startTime).toBeGreaterThanOrEqual(3500)
          expect(result).toEqual({ success: true })
        })
      })

      describe('with 429 response status code', function () {
        it('should retry after 2 seconds when a 2 second delay is indicated', async () => {
          const startTime = Date.now()
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '2' })
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: 1 })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 0,
              max429Retries: 4,
            },
          })

          scope1.isDone()
          scope2.isDone()
          await expect(api.getListOfProducts()).resolves.toEqual({ success: 1 })
          const duration = Date.now() - startTime
          expect(duration).toBeGreaterThanOrEqual(2000)
        })

        it('should retry after 3 seconds when a 3 second delay is indicated', async () => {
          const startTime = Date.now()
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '3' })
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: 1 })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 0,
              max429Retries: 4,
            },
          })

          scope1.isDone()
          scope2.isDone()
          await expect(api.getListOfProducts()).resolves.toEqual({ success: 1 })
          const duration = Date.now() - startTime
          expect(duration).toBeGreaterThanOrEqual(3000)
        })

        it('should retry after 4 seconds when a 4 second delay is indicated', async () => {
          const startTime = Date.now()
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '4' })
          const scope2 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: 1 })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 0,
              max429Retries: 4,
            },
          })

          scope1.isDone()
          scope2.isDone()
          await expect(api.getListOfProducts()).resolves.toEqual({ success: 1 })
          const duration = Date.now() - startTime
          expect(duration).toBeGreaterThanOrEqual(4000)
        })

        it('should retry 3 times, waiting 2 seconds each when a 2 second delay is indicated and max retries is 4', async () => {
          const startTime = Date.now()
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '2' })
          const scope2 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '2' })
          const scope3 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '2' })
          const scope4 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: 1 })
          const api = new AkeneoApi({
            ...defaultConfig,
            retry: {
              delayMs: 300,
              maxRetries: 0,
              max429Retries: 4,
            },
          })

          scope1.isDone()
          scope2.isDone()
          scope3.isDone()
          scope4.isDone()
          await expect(api.getListOfProducts()).resolves.toEqual({ success: 1 })
          const duration = Date.now() - startTime
          expect(duration).toBeGreaterThanOrEqual(6000)
        })

        it('should throw a 429 error after failing to get a successful response after the default 5 retry attempts', async () => {
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope2 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope3 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope4 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope5 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope6 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const api = new AkeneoApi({
            ...defaultConfig,
          })

          scope1.isDone()
          scope2.isDone()
          scope3.isDone()
          scope4.isDone()
          scope5.isDone()
          scope6.isDone()
          await expect(api.getListOfProducts()).rejects.toThrow('Request failed with status code 429')
        })

        it('should throw 200 after getting a successful response after the default 5 retry attempts', async () => {
          const scope1 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope2 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope3 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope4 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope5 = nock('https://test-endpoint')
            .get('/api/rest/v1/products')
            .reply(429, {}, { 'Retry-After': '1' })
          const scope6 = nock('https://test-endpoint').get('/api/rest/v1/products').reply(200, { success: 1 })
          const api = new AkeneoApi({
            ...defaultConfig,
          })

          scope1.isDone()
          scope2.isDone()
          scope3.isDone()
          scope4.isDone()
          scope5.isDone()
          scope6.isDone()
          await expect(api.getListOfProducts()).resolves.toEqual({ success: 1 })
        })
      })
    })

    describe('masking', () => {
      it('should mask the Authorization header when an error is thrown', async () => {
        nock('https://test-endpoint', {
          reqheaders: {
            authorization: 'Bearer test-access-token',
          },
        })
          .get('/api/rest/v1/products')
          .reply(500, { success: false })
        const api = new AkeneoApi(defaultConfig)

        try {
          await api.getListOfProducts()
        } catch (error: any) {
          expect(error?.toJSON()).toEqual({
            data: {
              code: 'ERR_BAD_RESPONSE',
              request: {
                headers: {
                  accept: 'application/json',
                  'accept-encoding': 'gzip, compress, deflate, br',
                  authorization: '********',
                  'user-agent': '',
                },
                method: 'get',
                url: 'https://test-endpoint/api/rest/v1/products',
              },
              response: {
                data: {
                  success: false,
                },
                headers: {
                  'content-type': 'application/json',
                },
                status: 500,
              },
            },
            isAkeneoError: true,
            status: 500,
            message: 'Request failed with status code 500',
          })
        }
      })
    })
  })

  describe('isRetryableError', () => {
    it('should return true when the error is not an axios error', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { test: 1 }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios error is missing a request object', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, response: {} }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios error is missing a response object', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {} }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios response status code is 500', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 500 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios response status code is 501', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 501 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios response status code is 502', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 502 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios response status code is 503', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 503 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return true when the axios response status code is 504', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 504 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(true)
    })

    it('should return false when the axios response status code is 400', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, request: {}, response: { status: 400 } }

      const result = api.isRetryableError(error)

      expect(result).toBe(false)
    })
  })

  describe('transformError', () => {
    it("should return the object passed in when it's not an axios error object", async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { test: 1 }

      const result = api.transformError(error)

      expect(result).toBe(error)
    })

    it('should return a AkeneoError object when an axios error is passed in', async () => {
      const api = new AkeneoApi(defaultConfig)
      const error = { isAxiosError: true, message: 'Testing' }

      const result = api.transformError(error)

      expect(result).toBeInstanceOf(AkeneoError)
    })
  })
})
