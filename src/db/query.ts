import { IEnv } from '@/types'

export async function querySingle<T>(env: IEnv, query: string): Promise<{ data?: T; success: boolean }> {
  const queryFormat = query + ' FORMAT JSON;'

  const headers = new Headers()
  headers.append('Content-Type', 'text/plain')
  headers.append('Authorization', 'Basic ' + btoa(env.DATABASE_USERNAME + ':' + env.DATABASE_PASSWORD))

  try {
    const res = await fetch(env.DATABASE_URL, {
      body: queryFormat,
      headers,
      method: 'POST',
    })

    const { data }: { data: T[] } = await res.json()

    if (data.length === 0) return { success: false }
    return { data: data[0], success: true }
  } catch (e) {
    return { success: false }
  }
}

export async function query<T>(env: IEnv, query: string): Promise<{ data?: T[]; success: boolean }> {
  const queryFormat = query + ' FORMAT JSON;'

  const headers = new Headers()
  headers.append('Content-Type', 'text/plain')
  headers.append('Authorization', 'Basic ' + btoa(env.DATABASE_USERNAME + ':' + env.DATABASE_PASSWORD))

  try {
    const res = await fetch(env.DATABASE_URL, {
      body: queryFormat,
      headers,
      method: 'POST',
    })
    const { data }: { data: T[] } = await res.json()

    return { data, success: true }
  } catch (e) {
    return { success: false }
  }
}
