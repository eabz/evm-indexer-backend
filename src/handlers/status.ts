import { Bool, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

import { query } from '@/db'
import { apiSuccess } from '@/responses'
import { IEnv } from '@/types'

export class Status extends OpenAPIRoute {
  static schema = {
    responses: {
      '200': {
        description: 'Success response',
        schema: {
          data: [
            {
              blocks: new Str(),
              chain: new Str(),
              contracts: new Str(),
              dexTrades: new Str(),
              erc20Transfers: new Str(),
              erc721Transfers: new Str(),
              erc1155Transfers: new Str(),
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
        description: 'Failed response',
        schema: {
          error: new Str({ example: 'internal server error' }),
          success: new Bool({ example: false }),
        },
      },
    },
    summary: 'Return the list of all agreements for this tutor.',
    tags: ['Tutor & Parent'],
  }

  async handle(request: Request, env: IEnv) {
    const [
      { data: blocksIndexed },
      { data: transactionsIndexed },
      { data: contractsIndexed },
      { data: logsIndexed },
      { data: tracesIndexed },
      { data: withdrawalsIndexed },
      { data: erc20Transfers },
      { data: erc721Transfers },
      { data: erc1155Transfers },
      { data: dexTrades },
    ] = await Promise.all([
      query<{ blocks: number; chain: number }>(
        env,
        'SELECT count(*) as blocks, chain FROM indexer.blocks WHERE is_uncle = false GROUP BY chain',
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
      query<{ chain: number; erc20_transfers: number }>(
        env,
        'SELECT count(*) as erc20_transfers, chain FROM indexer.erc20_transfers GROUP BY chain',
      ),
      query<{ chain: number; erc721_transfers: number }>(
        env,
        'SELECT count(*) as erc721_transfers, chain FROM indexer.erc721_transfers GROUP BY chain',
      ),
      query<{ chain: number; erc1155_transfers: number }>(
        env,
        'SELECT count(*) as erc1155_transfers, chain FROM indexer.erc1155_transfers GROUP BY chain',
      ),
      query<{ chain: number; dex_trades: number }>(
        env,
        'SELECT count(*) as dex_trades, chain FROM indexer.dex_trades GROUP BY chain',
      ),
    ])

    console.log(blocksIndexed)

    const fullChainData = blocksIndexed?.map((chainInfo) => {
      const chainTransactions = transactionsIndexed?.find((items) => items.chain === chainInfo.chain)?.transactions || 0

      const chainContracts = contractsIndexed?.find((items) => items.chain === chainInfo.chain)?.contracts || 0

      const chainLogs = logsIndexed?.find((items) => items.chain === chainInfo.chain)?.logs || 0

      const chainTraces = tracesIndexed?.find((items) => items.chain === chainInfo.chain)?.traces || 0

      const chainWithdrawals = withdrawalsIndexed?.find((items) => items.chain === chainInfo.chain)?.withdrawals || 0

      const chainErc20Transfers = erc20Transfers?.find((items) => items.chain === chainInfo.chain)?.erc20_transfers || 0

      const chainErc721Transfers =
        erc721Transfers?.find((items) => items.chain === chainInfo.chain)?.erc721_transfers || 0

      const chainErc1155Transfers =
        erc1155Transfers?.find((items) => items.chain === chainInfo.chain)?.erc1155_transfers || 0

      const chainDexTrades = dexTrades?.find((items) => items.chain === chainInfo.chain)?.dex_trades || 0

      return {
        ...chainInfo,
        contracts: chainContracts,
        dexTrades: chainDexTrades,
        erc20Transfers: chainErc20Transfers,
        erc721Transfers: chainErc721Transfers,
        erc1155Transfers: chainErc1155Transfers,
        logs: chainLogs,
        traces: chainTraces,
        transactions: chainTransactions,
        withdrawals: chainWithdrawals,
      }
    })

    return apiSuccess(fullChainData)
  }
}
