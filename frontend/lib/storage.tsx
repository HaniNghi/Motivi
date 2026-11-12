import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Profile } from './types';

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';
const USER = 'user_json';
const PROFILE = 'profile_json';

async function setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
}

async function getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
}

export async function saveSession(access: string, refresh: string, user: object) {
    await setItem(ACCESS, access);
    await setItem(REFRESH, refresh);
    await setItem(USER, JSON.stringify(user));
}

export async function saveProfile(profile: Profile) {
    await setItem(PROFILE, JSON.stringify(profile));
}

export async function getProfile(): Promise<Profile | null> {
    const profile = await getItem(PROFILE);
    if (!profile) {
        return null;
    }
    return JSON.parse(profile);
}

export async function clearSession() {
    await deleteItem(ACCESS);
    await deleteItem(REFRESH);
    await deleteItem(USER);
    await deleteItem(PROFILE);
}

export async function getAccessToken() {
    const accessToken = await getItem(ACCESS);
    return accessToken;
}

export async function getRefreshToken() {
    const refreshToken = await getItem(REFRESH);
    return refreshToken;
}

export async function getUser() {
    const user = await getItem(USER);
    if (!user) {
        return null;
    }
    return JSON.parse(user);
}