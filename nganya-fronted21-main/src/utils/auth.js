const TOKEN_KEY = "token";
const EMAIL_KEY = "userEmail";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserEmail = () => localStorage.getItem(EMAIL_KEY);

export const setAuth = ({ token, email }) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (email) localStorage.setItem(EMAIL_KEY, email);
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
};

export const isLoggedIn = () => Boolean(getToken());
