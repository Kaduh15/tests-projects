import { AxiosError } from 'axios'
import assert from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import { header, imageBase64 } from '../image'
import { api } from './utils/api'

describe('/confirm', async () => {
  describe('Casos de ERROS', () => {
    let randomCustomerCode = crypto.randomUUID()

    beforeEach(() => {
      randomCustomerCode = crypto.randomUUID()
    })

    it('Deve retornar um error 400 se não for enviado um "measure_uuid" no corpo da requisição', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch((error) => {
          console.error(error.response.data)
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)

      await api
        .patch('/confirm', {
          confirmed_value: 50,
        })
        .then(() => {
          throw new Error('Deve retornar um erro 400')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
          } else {
            throw new Error('Erro não esperado.')
          }
        })
    })

    it('Deve retornar um error 400 se o "measure_uuid" enviado não for válido', async () => {
      await api
        .patch('/confirm', {
          measure_uuid: '123',
          confirmed_value: 50,
        })
        .then(() => {
          throw new Error('Deve retornar um erro 400')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
          } else {
            throw new Error('Erro não esperado.')
          }
        })
    })

    it('Deve retornar um error 400 se não for enviado um "confirmed_value" no corpo da requisição', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch((error) => {
          console.error(error.response.data)
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)

      await api
        .patch('/confirm', {
          measure_uuid: data.measure_uuid,
        })
        .then(() => {
          throw new Error('Deve retornar um erro 400')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
          } else {
            throw new Error('Erro não esperado.')
          }
        })
    })

    it('Deve retornar um error 400 se o "confirmed_value" enviado não for válido', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)

      await api
        .patch('/confirm', {
          measure_uuid: data.measure_uuid,
          confirmed_value: '50',
        })
        .then((res) => {
          assert.strictEqual(res.status, 400)
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

    it('Deve retornar um error 404 se o a leitura não for encontrada', async () => {
      await api
        .patch('/confirm', {
          measure_uuid: '6b5f1c3d-a2d4-4f6e-bb72-9359e4f25d8e',
          confirmed_value: 50,
        })
        .then(() => {
          throw new Error('Deve retornar um erro 404')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 404)
            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro não esperado.')
        })
    })

    it('Deve retornar um error 409 se a leitura já estiver confirmada', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)

      await api
        .patch('/confirm', {
          measure_uuid: data.measure_uuid,
          confirmed_value: 50,
        })
        .then((res) => {
          assert.strictEqual(res.status, 200)
        })

      await api
        .patch('/confirm', {
          measure_uuid: data.measure_uuid,
          confirmed_value: 50,
        })
        .then(() => {
          throw new Error('Deve retornar um erro 409')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 409)
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

    it('Deve retornar 200 se o "measure_uuid" e o "confirmed_value" forem válidos', async () => {
      const { data } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)

      await api
        .patch('/confirm', {
          measure_uuid: data.measure_uuid,
          confirmed_value: 50,
        })
        .then((res) => {
          assert.strictEqual(res.status, 200)
        })
    })
  })
})
