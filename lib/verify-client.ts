// Client helpers calling the server-side verification route.
// The real password and PIN codes only live on the server (lib/server/secrets.ts).

export interface PasswordPart {
  value: string;
  label: string;
}

export interface PasswordVerdict {
  result: "admin" | "guest" | "wrong";
  password?: string;
  parts?: PasswordPart[];
  feedback?: { correct: number; total: number };
}

async function post<T>(payload: unknown): Promise<T> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`verify failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function verifyPassword(value: string) {
  return post<PasswordVerdict>({ kind: "password", value });
}

export async function verifyPin(itemId: string, value: string) {
  const { result } = await post<{ result: "ok" | "wrong" }>({ kind: "pin", itemId, value });
  return result === "ok";
}
