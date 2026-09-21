/**
 * Robust Client API fetch wrapper that guarantees persistent student authentication
 * by automatically attaching the signed session token from localStorage to headers.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const localToken =
    typeof window !== "undefined"
      ? localStorage.getItem("gehu_student_session")
      : null;

  const headers = new Headers(init?.headers || {});

  if (localToken && !headers.has("x-student-session")) {
    headers.set("x-student-session", localToken);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
