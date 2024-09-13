import { AxiosError } from 'axios'
import assert from 'node:assert'
import { beforeEach, describe, it } from 'node:test'
import { header, imageBase64 } from '../image'
import { api } from './utils/api'

describe('/upload', async () => {
  describe('Casos de ERROS', () => {
    let randomCustomerCode = crypto.randomUUID()

    beforeEach(() => {
      randomCustomerCode = crypto.randomUUID()
    })

    it('Deve retornar um error 400 se não for enviado uma imagem', async () => {
      await api
        .post('/upload')
        .then(() => {
          throw new Error('Foi possível não enviar uma imagem')
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)

            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 400 se a imagem enviada não for uma string', async () => {
      await api
        .post('/upload', {
          image: 123,
        })
        .then(() => {
          throw new Error('Foi possível enviar uma imagem inválida')
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 400 se a imagem enviada não for uma base64', async () => {
      await api
        .post('/upload', {
          image: '123',
        })
        .then(() => {
          throw new Error('Foi possível enviar uma imagem inválida')
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)

            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 400 se não for enviado um código de cliente', async () => {
      await api
        .post('/upload', {
          image: imageBase64,
        })
        .then(() => {
          throw new Error('Foi possível enviar um código de cliente inválido')
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 400 se a data enviada não for válida', async () => {
      await api
        .post('/upload', {
          image: imageBase64,
          customer_code: randomCustomerCode,
          measure_datetime: 'Data inválida',
          measure_type: 'WATER',
        })
        .then(() => {
          throw new Error('Foi possível enviar uma data inválida')
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)

            return
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 400 se o tipo de medida enviado não for válido', async () => {
      await api
        .post('/upload', {
          image: imageBase64,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'Type Invalido',
        })
        .then(() => {
          throw new Error('Foi possível enviar um tipo de medida inválido')
        })
        .catch((error) => {
          if (error instanceof AxiosError) {
            assert.strictEqual(error.status, 400)
          }

          if (error instanceof Error) {
            throw error
          }

          throw new Error('Erro inesperado')
        })
    })

    it('Deve retornar um error 409 se o cliente já tiver uma medição cadastrada para o mesmo mês', async () => {
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
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
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

          throw new Error('Erro inesperado')
        })
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
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'Other',
        })
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

    it('Deve retornar um uuid válido se a imagem enviada for uma base64 com cabeçalho', async () => {
      const image = Buffer.from(imageBase64, 'base64').toString('base64')
      const { data } = await api
        .post('/upload', {
          image: `${header}${image}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            console.error(error.toJSON())
          }
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)
    })

    it('Deve retornar um uuid válido se a imagem enviada for uma base64 sem cabeçalho', async () => {
      const { data } = await api
        .post('/upload', {
          image: imageBase64,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch(() => {
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.ok(data.measure_uuid)
    })

    it('Deve retornar status 200 se a data for válida', async () => {
      const { status } = await api
        .post('/upload', {
          image: `${header}${imageBase64}`,
          customer_code: randomCustomerCode,
          measure_datetime: '2023-01-01T00:00:00.000Z',
          measure_type: 'WATER',
        })
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            console.error(error.toJSON())
          }
          throw new Error('Falha ao enviar a imagem.')
        })

      assert.strictEqual(status, 200)
    })
  })
})
