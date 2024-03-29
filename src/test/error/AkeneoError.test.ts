import { AkeneoError } from '../../lib'
import { InternalAxiosRequestConfig } from 'axios'

describe('AkeneoError', () => {
  it('should return the expected string when stringified', async () => {
    expect(JSON.stringify(new AkeneoError('Test message', { test: 1 }))).toBe(
      '{"message":"Test message","data":{"test":1},"isAkeneoError":true}',
    )
  })

  it('should return the expected string when converted to a string', async () => {
    expect(new AkeneoError('Test message', { test: 1 }).toString()).toBe(
      '{"message":"Test message","data":{"test":1},"isAkeneoError":true}',
    )
  })

  it('should make the `status` property available directly on the error when passed in as a property on the `data` object', async () => {
    const error = new AkeneoError('Test message', null, 409)
    expect(error.toString()).toBe('{"status":409,"message":"Test message","data":null,"isAkeneoError":true}')
    expect(error.status).toBe(409)
  })

  it('should return an undefined value for the `status` property when no data `status` arg is passed in', async () => {
    const error = new AkeneoError('Test message')
    expect(error.status).toBeUndefined()
  })

  it('should have a `isAkeneoError` property set to `true`', async () => {
    const error = new AkeneoError('Test message')
    expect(error.isAkeneoError).toBe(true)
  })

  it('should have a `isAkeneoError` property set to `true`', async () => {
    const error = new AkeneoError('Test message')
    expect(error.isAkeneoError).toBe(true)
  })

  describe('parseRequestData', () => {
    it("should return the data passed in if it isn't a non-zero length string", () => {
      expect(AkeneoError.parseRequestData({} as InternalAxiosRequestConfig)).toBeUndefined()
      expect(AkeneoError.parseRequestData({ data: null } as InternalAxiosRequestConfig)).toBeNull()
      expect(AkeneoError.parseRequestData({ data: 123 } as InternalAxiosRequestConfig)).toBe(123)
    })

    it("should return the data passed in if it's a string but the Content-Type is missing", () => {
      expect(
        AkeneoError.parseRequestData({
          data: '{"test":1}',
          headers: {},
        } as InternalAxiosRequestConfig),
      ).toBe('{"test":1}')
    })

    it("should return the data passed in if it's a string but the Content-Type is empty", () => {
      expect(
        AkeneoError.parseRequestData({
          data: '{"test":1}',
          headers: {
            'Content-Type': '',
          },
        } as InternalAxiosRequestConfig),
      ).toBe('{"test":1}')
    })

    it("should return the data passed in if it's a string but the Content-Type is not recognised", () => {
      expect(
        AkeneoError.parseRequestData({
          data: '{"test":1}',
          headers: {
            'Content-Type': 'text/plain',
          },
        } as InternalAxiosRequestConfig),
      ).toBe('{"test":1}')
    })

    it("should return the data passed in if it's an invalid JSON string", () => {
      expect(
        AkeneoError.parseRequestData({
          data: '{"test"///:1}',
          headers: {
            'Content-Type': 'application/json',
          },
        } as InternalAxiosRequestConfig),
      ).toBe('{"test"///:1}')
    })

    it('should return the parsed JSON string if the string is valid JSON data and the `Content-Type` is `application/json`', () => {
      expect(
        AkeneoError.parseRequestData({
          data: '{"test":1}',
          headers: {
            'Content-Type': 'application/json',
          },
        } as InternalAxiosRequestConfig),
      ).toEqual({ test: 1 })
    })

    it("should return the data passed in the `Content-Type` is `application/x-www-form-urlencoded` but the data isn't valid", () => {
      expect(
        AkeneoError.parseRequestData({
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        } as InternalAxiosRequestConfig),
      ).toBeNull()
    })

    it('should return the data as an object if the `Content-Type` is `application/x-www-form-urlencoded` and the data is valid', () => {
      expect(
        AkeneoError.parseRequestData({
          data: 'single=1&double=2&double=3&novalue&blankvalue=',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        } as InternalAxiosRequestConfig),
      ).toEqual({
        single: '1',
        double: ['2', '3'],
        novalue: '',
        blankvalue: '',
      })
    })
  })
})
