import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    ApiError,
    CreateUser,
    LoginUser,
    MeSession,
    User,
    UserSession,
} from "../lib/types";
import { getAccessToken, getUser, saveSession } from "../lib/storage";
import { getMe } from "../services/me";
import { router } from "expo-router";

type AuthState = {
    loading: boolean;
    user: User | null;
    onboardingCompleted: boolean;
    login: (session: UserSession | any) => Promise<void>;
    logout: () => Promise<void>;
    refreshMe: () => Promise<MeSession | null>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshMe = useCallback(async () => {
        const token = await getAccessToken();
        if (!token) {
            setUser(null);
            setOnboardingCompleted(false);
            return null;
        }
        try {
            const me = await getMe();
            setUser(me.user);
            setOnboardingCompleted(me.onboarding_completed);
            return me;
        } catch (error) {
            setUser(null)
            setOnboardingCompleted(false)
            return null;
        };
    }, []);

    useEffect(() => {
        (async () => {
            const stored = await getUser();
            if (stored) setUser(stored);
            await refreshMe();
            setLoading(false);
        })();
    }, [refreshMe]);

    const login = useCallback(async (session: UserSession | any) => {
        if (!session) {
            return;
        }
        await saveSession(session.access_token, session.refresh_token, session.user);

        setUser(session.user);

        //check if onboarding completed or not
        const me = await refreshMe();
        //completed, navigate to tabs
        if (me?.onboarding_completed) {
            router.replace("/(tabs)")
        } 
        //incompleted, navigate to onboarding
        else {
            router.replace("/(onboarding)/calculator")
        }
    }, []);

    const logout = useCallback(async () => { }, []);

    return (
        <AuthContext.Provider value={{ loading, user, onboardingCompleted, login, logout, refreshMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider")
    }
    return context
}