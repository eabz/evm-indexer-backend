import { Bool, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { query } from '@/db'
import { apiSuccess } from '@/responses'
import { IEnv } from '@/types'

export class Status extends OpenAPIRoute {
  static schema = {
    responses: {
      '200': {
        schema: {
          data: [
            {
              blocks: new Str(),
              chain: new Str(),
              contracts: new Str(),
              logs: new Str(),
              traces: new Str(),
              transactions: new Str(),
              withdrawals: new Str(),
            },
          ],
          success: new Bool(),
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

  async handle(request: Request, env: IEnv) {
    const [
      { data: blocksIndexed },
      { data: transactionsIndexed },
      { data: contractsIndexed },
      { data: logsIndexed },
      { data: tracesIndexed },
      { data: withdrawalsIndexed },
    ] = await Promise.all([
      query<{ blocks: number; chain: number }>(
        env,
        'SELECT count(*) as blocks, chain FROM indexer.blocks GROUP BY chain',
      ),
      query<{ chain: number; transactions: number }>(
        env,
        'SELECT count(*) as transactions, chain FROM indexer.transactions GROUP BY chain',
      ),
      query<{ chain: number; contracts: number }>(
        env,
        'SELECT count(*) as contracts, chain FROM indexer.contracts GROUP BY chain',
      ),
      query<{ chain: number; logs: number }>(env, 'SELECT count(*) as logs, chain FROM indexer.logs GROUP BY chain'),

      query<{ chain: number; traces: number }>(
        env,
        'SELECT count(*) as traces, chain FROM indexer.traces GROUP BY chain',
      ),
      query<{ chain: number; withdrawals: number }>(
        env,
        'SELECT count(*) as withdrawals, chain FROM indexer.withdrawals GROUP BY chain',
      ),
    ])

    const fullChainData = blocksIndexed?.map((chainInfo) => {
      const chainTransactions = transactionsIndexed?.find((items) => items.chain === chainInfo.chain)?.transactions || 0

      const chainContracts = contractsIndexed?.find((items) => items.chain === chainInfo.chain)?.contracts || 0

      const chainLogs = logsIndexed?.find((items) => items.chain === chainInfo.chain)?.logs || 0

      const chainTraces = tracesIndexed?.find((items) => items.chain === chainInfo.chain)?.traces || 0

      const chainWithdrawals = withdrawalsIndexed?.find((items) => items.chain === chainInfo.chain)?.withdrawals || 0

      return {
        ...chainInfo,
        contracts: chainContracts,
        logs: chainLogs,
        traces: chainTraces,
        transactions: chainTransactions,
        withdrawals: chainWithdrawals,
      }
    })

    return apiSuccess(fullChainData)
  }
}
