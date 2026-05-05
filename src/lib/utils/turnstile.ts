export async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY is not set. Skipping verification (DEV ONLY).');
    return true;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
    }),
  });

  const data = await response.json();
  return data.success;
}
