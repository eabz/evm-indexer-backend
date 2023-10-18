import { OpenAPIRouter } from '@cloudflare/itty-router-openapi'
import { createCors } from 'itty-cors'

import { Status } from '@/handlers'
import { apiError } from '@/responses'
import { IEnv } from '@/types'

const { preflight } = createCors({
  maxAge: 3600,
  methods: ['GET', 'POST'],
  origins: ['*'],
})

const router = OpenAPIRouter({
  schema: {
    info: {
      description: 'Cloudflare worker API for the EVM Indexer Clickhouse DB',
      title: 'EVM Indexer API',
      version: '1.0',
    },
  },
})

router.all('*', preflight)

router.original.get('/', (request: { url: any }) => Response.redirect(`${request.url}docs`, 302))

router.get('/status', Status)

router.all('*', () => new Response('Not Found.', { status: 404 }))

export default {
  fetch: async (request: Request, env: IEnv, ctx: ExecutionContext): Promise<Response> => {
    try {
      const res = await router.handle(request, env, ctx)

      return res
    } catch (e) {
      return apiError('internal server error', 500)
    }
  },
}
