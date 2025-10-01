export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://easybuybd.space";
const TOKEN_KEY = "app_token";
const USER_DATA_KEY = "user_data";

export function authHeaders(extra = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      ...options,
      headers: authHeaders(options.headers),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      console.error("JSON Parse Error:", err);
      throw new Error("Invalid JSON response");
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
      throw data || { error: res.statusText, status: res.status };
    }

    return data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

// Auth-specific API calls
export const authAPI = {
  login: async (email, password) => {
    const data = await fetchJSON("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  register: async (userData) => {
    const data = await fetchJSON("/auth/register", {
      method: "POST",
      body: userData,
    });

    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  forgotPassword: async (email) => {
    const data = await fetchJSON("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });

    return data;
  },

  resetPassword: async (token, password) => {
    const data = await fetchJSON("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword: password },
    });

    return data;
  },

  checkAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);

    if (!token || !userData) {
      return { authenticated: false };
    }

    try {
      // Verify token is still valid
      await fetchJSON("/products", {
        method: "GET",
      });

      // Return stored user data
      return {
        authenticated: true,
        user: { ...JSON.parse(userData), token },
      };
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      return { authenticated: false };
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
};
