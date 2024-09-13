import assert from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import { api } from './utils/api'
import { header, imageBase64 } from '../image'
import { AxiosError } from 'axios'

describe('/:customer_code/list', () => {
  describe('Casos de ERROS', () => {
    let randomCustomerCode = crypto.randomUUID()
    beforeEach(() => {
      randomCustomerCode = crypto.randomUUID()
    })

    it('Deve retornar um error 400 se o parâmetro "measure_type" for diferente de WATER ou GAS', async () => {
      await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      await api
        .get(`/${randomCustomerCode}/list?measure_type=Other`)
        .then(() => {
          throw new Error('Deve retornar um erro 400')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro não esperado.')
        })
    })
  })

  describe('Casos de SUCESSO', () => {
    let randomCustomerCode = crypto.randomUUID()

    beforeEach(() => {
      randomCustomerCode = crypto.randomUUID()
    })

    it('Deve retornar um array de objetos com as leituras do cliente', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      assert.ok(data.measure_uuid)

      await api.get(`/${randomCustomerCode}/list`).then((res) => {
        assert.ok(res.data.measures.length === 1)
      })

      await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-02-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      await api.get(`/${randomCustomerCode}/list`).then((res) => {
        assert.ok(res.data.measures.length === 2)
      })
    })

    it('Deve retornar todas as leituras do cliente filtradas por tipo de medida', async () => {
      await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-02-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      await api
        .get(`/${randomCustomerCode}/list?measure_type=WATER`)
        .then((res) => {
          assert.ok(res.data.measures.length === 2)
        })

      await api.post('/upload', {
        image: `${header}${imageBase64}`,
        customer_code: randomCustomerCode,
        measure_datetime: '2023-03-01T00:00:00.000Z',
        measure_type: 'GAS',
      })

      await api
        .get(`/${randomCustomerCode}/list?measure_type=WATER`)
        .then((res) => {
          assert.ok(res.data.measures.length === 2)
        })

      await api
        .get(`/${randomCustomerCode}/list?measure_type=GAS`)
        .then((res) => {
          assert.ok(res.data.measures.length === 1)
        })
    })

    it('"measure_type" deve ser case insensitive', async () => {
      await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao fazer leitura.')
        })

      await api
        .get(`/${randomCustomerCode}/list?measure_type=wAtEr`)
        .then((res) => {
          assert.ok(res.data.measures.length === 1)
        })
    })
  })
})
