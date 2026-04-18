import { Client, Account, Databases } from 'appwrite'

let _client: Client | null = null
let _account: Account | null = null
let _databases: Databases | null = null

function getClient() {
  if (!_client) {
    _client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  }
  return _client
}

export const account = new Proxy({} as Account, {
  get(_, prop) {
    if (!_account) _account = new Account(getClient())
    return (_account as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const databases = new Proxy({} as Databases, {
  get(_, prop) {
    if (!_databases) _databases = new Databases(getClient())
    return (_databases as unknown as Record<string | symbol, unknown>)[prop]
  },
})
