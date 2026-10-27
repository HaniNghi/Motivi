import * as SecureStore from 'expo-secure-store'


const ACCESS = 'access_token';
const REFRESH  = 'refresh_token';
const USER = 'user_json';

export async function saveSession(access: string, refresh: string, user: object) {
    await SecureStore.setItemAsync(ACCESS, access);
    await SecureStore.setItemAsync(REFRESH, refresh);
    await SecureStore.setItemAsync(USER, JSON.stringify(user));
}

export async function clearSession() {
    await SecureStore.deleteItemAsync(ACCESS)
    await SecureStore.deleteItemAsync(REFRESH);
    await SecureStore.deleteItemAsync(USER);
}

export async function getAccessToken(){
    const accessToken = await SecureStore.getItemAsync(ACCESS);
    return accessToken;
}

export async function getRefreshToken() {
    const refreshToken = await SecureStore.getItemAsync(REFRESH);
    return refreshToken;
}

export async function getUser() {
    const user = await SecureStore.getItemAsync(USER);
    if (!user) {
        return null
    }
    return JSON.parse(user);
}