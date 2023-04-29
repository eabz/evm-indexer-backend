import { Bool, Num, OpenAPIRoute, Str } from '@cloudflare/itty-router-openapi'

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
              chain: new Str(),
              indexed_blocks: new Num(),
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
      { data: receiptsIndexed },
      { data: logsIndexed },
      { data: dexTrades },
      { data: erc20Transfers },
      { data: erc721Transfers },
      { data: erc1155Transfers },
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
      query<{ chain: number; receipts: number }>(
        env,
        'SELECT count(*) as receipts, chain FROM indexer.receipts GROUP BY chain',
      ),
      query<{ chain: number; logs: number }>(env, 'SELECT count(*) as logs, chain FROM indexer.logs GROUP BY chain'),
      query<{ chain: number; dex_trades: number }>(
        env,
        'SELECT count(*) as dex_trades, chain FROM indexer.dex_trades GROUP BY chain',
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
    ])

    const fullChainData = blocksIndexed?.map((chainInfo) => {
      const chainsTransactionsIndex = transactionsIndexed?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsContractsIndex = contractsIndexed?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsReceiptsIndex = receiptsIndexed?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsLogsIndex = logsIndexed?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsDexTradesIndex = dexTrades?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsErc20TransfersIndex = erc20Transfers?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsErc721TransfersIndex = erc721Transfers?.findIndex((items) => items.chain === chainInfo.chain)
      const chainsErc1155TransfersIndex = erc1155Transfers?.findIndex((items) => items.chain === chainInfo.chain)

      return {
        ...chainInfo,
        contracts: chainsContractsIndex ? contractsIndexed?.[chainsContractsIndex].contracts : 0,
        dex_trades: chainsDexTradesIndex ? dexTrades?.[chainsDexTradesIndex].dex_trades : 0,
        erc20_transfers: chainsErc20TransfersIndex ? erc20Transfers?.[chainsErc20TransfersIndex].erc20_transfers : 0,
        erc721_transfers: chainsErc721TransfersIndex
          ? erc721Transfers?.[chainsErc721TransfersIndex].erc721_transfers
          : 0,
        erc1155_transfers: chainsErc1155TransfersIndex
          ? erc1155Transfers?.[chainsErc1155TransfersIndex].erc1155_transfers
          : 0,
        logs: chainsLogsIndex ? logsIndexed?.[chainsLogsIndex].logs : 0,
        receipts: chainsReceiptsIndex ? receiptsIndexed?.[chainsReceiptsIndex].receipts : 0,
        transactions: chainsTransactionsIndex ? transactionsIndexed?.[chainsTransactionsIndex].transactions : 0,
      }
    })

    return apiSuccess(fullChainData)
  }
}
