import { Bool, Header, Num, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { apiSuccess } from '@/responses'
import { IEnv } from '@/types'
import { query, querySingle } from '@/db'

export class Status extends OpenAPIRoute {
  static schema = {
    responses: {
      '200': {
        schema: {
          success: new Bool(),
          data: [
            {
              chain: new Str(),
              indexed_blocks: new Num(),
            },
          ],
        },
      },
      '500': {
        schema: {
          error: new Str({ example: 'internal server error' }),
          success: new Bool({ example: false }),
        },
      },
    },
    summary: 'Returns the status and the latest working version of the app',
    tags: ['Global'],
  }

  async handle(request: Request, env: IEnv, ctx: any, data: Record<string, any>) {
    const blocksIndexed = await query<{blocks: number, chain: number}>(env, "SELECT count(*) as indexed_blocks, chain FROM indexer.blocks GROUP BY chain");

    return apiSuccess(blocksIndexed.data)
  }
}
