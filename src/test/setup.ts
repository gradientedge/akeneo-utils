import nock from 'nock'

export default function () {
  process.env.GEAKU_IS_BROWSER = '0'
  process.env.TZ = 'UTC'

  nock.disableNetConnect()
}
