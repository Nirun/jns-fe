import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const API_KEY_KEY = 'admin_api_key';

export const setAuthSession = (token: string, apiKey: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    Cookies.set(API_KEY_KEY, apiKey, { expires: 1, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
};

export const clearAuthSession = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(API_KEY_KEY);
};

export const getAccessToken = () => Cookies.get(TOKEN_KEY);
export const getAdminApiKey = () => Cookies.get(API_KEY_KEY);

export const isAuthenticated = () => !!getAccessToken();
