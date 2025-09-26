// services/apiExternaService.ts
export async function loginUsuario(email: string, password: string) {
  const res = await fetch('http://localhost:3000/api-externa/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login fallido');
  return await res.json();
}