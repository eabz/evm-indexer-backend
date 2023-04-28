export const apiSuccess = (data?: any): Response => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  }

  const body = JSON.stringify({ data, success: true })

  const res = new Response(body, { headers })

  return res
}

export const apiError = (error: string, statusError: number): Response => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  }

  const body = JSON.stringify({ error, success: false })

  const res = new Response(body, { headers, status: statusError })

  return res
}
