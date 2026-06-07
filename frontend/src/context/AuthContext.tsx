import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { User, AuthState, LoginFormData, RegisterFormData } from "@/types";
import { tokenStorage } from "@/utils/storage";
import api from "@/services/api";

// ─── Actions ──────────────────────────────────────────────────────────────

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; accessToken: string } }
  | { type: "AUTH_FAILURE" }
  | { type: "AUTH_LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, isLoading: true };
    case "AUTH_SUCCESS":
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "AUTH_FAILURE":
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "AUTH_LOGOUT":
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: validate existing token by fetching current user
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      dispatch({ type: "AUTH_FAILURE" });
      return;
    }

    api
      .get<{ data: User }>("/auth/me")
      .then(({ data }) => {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: data.data, accessToken: token },
        });
      })
      .catch(() => {
        tokenStorage.clearTokens();
        dispatch({ type: "AUTH_FAILURE" });
      });
  }, []);

  const login = useCallback(async (formData: LoginFormData) => {
    const { data } = await api.post<{
      data: { user: User; accessToken: string; refreshToken: string };
    }>("/auth/login", formData);

    const { user, accessToken, refreshToken } = data.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    dispatch({ type: "AUTH_SUCCESS", payload: { user, accessToken } });
  }, []);

  const register = useCallback(async (formData: RegisterFormData) => {
    const { data } = await api.post<{
      data: { user: User; accessToken: string; refreshToken: string };
    }>("/auth/register", formData);

    const { user, accessToken, refreshToken } = data.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    dispatch({ type: "AUTH_SUCCESS", payload: { user, accessToken } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: tokenStorage.getRefreshToken(),
      });
    } finally {
      tokenStorage.clearTokens();
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
