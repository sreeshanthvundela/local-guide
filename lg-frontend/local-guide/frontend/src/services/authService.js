const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function getErrorMessage(response, fallback) {
  try {
    const body = await response.json();

    if (typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // Use the request-specific fallback if the response cannot be parsed.
  }

  return fallback;
}

async function authRequest(path, body, fallback) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Cannot reach the Local Guide API. Start the backend or check VITE_API_URL."
    );
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }

  return response.json();
}

export async function register(name, email, password) {
  return authRequest(
    "/auth/register",
    { name, email, password },
    "Unable to create your account"
  );
}

export async function login(email, password) {
  return authRequest(
    "/auth/login",
    { email, password },
    "Invalid email or password"
  );
}
