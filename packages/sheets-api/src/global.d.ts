declare namespace google.accounts.oauth2 {
  interface TokenClientConfig {
    client_id: string
    scope: string
    callback: (response: { access_token: string; expires_in: number; scope: string; token_type: string }) => void
    error_callback?: () => void
  }
  interface TokenClient {
    callback: (response: { access_token: string; expires_in: number; scope: string; token_type: string }) => void
    requestAccessToken: (config?: { prompt?: string }) => void
  }
  function initTokenClient(config: TokenClientConfig): TokenClient
  function revoke(token: string, done: () => void, error?: () => void): void
}

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: typeof google.accounts.oauth2.initTokenClient
        revoke: typeof google.accounts.oauth2.revoke
        TokenClient: google.accounts.oauth2.TokenClient
      }
    }
  }
}

declare const google: {
  accounts: {
    oauth2: {
      TokenClient: google.accounts.oauth2.TokenClient
      initTokenClient: typeof google.accounts.oauth2.initTokenClient
      revoke: typeof google.accounts.oauth2.revoke
    }
  }
}
