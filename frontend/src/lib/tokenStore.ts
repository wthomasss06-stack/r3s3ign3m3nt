// Access token garde en memoire JS uniquement (jamais localStorage/sessionStorage).
// Perdu au rechargement de page par design -> restaure via useSilentSession()
// qui echange le cookie httpOnly de refresh contre un nouvel access token.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
