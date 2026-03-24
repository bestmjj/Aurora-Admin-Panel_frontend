import decodeJwt from "jwt-decode";
import { useReducerAtom, atomWithStorage } from 'jotai/utils'

interface AuthPermissions {
    is_superuser?: boolean;
    is_ops?: boolean;
    user_id?: number;
}

export interface AuthState {
    token: string;
    permissions: AuthPermissions | '';
}

interface DecodedToken {
    permissions: AuthPermissions;
    [key: string]: unknown;
}

type AuthAction =
    | { type: 'login'; payload: { access_token: string } }
    | { type: 'logout' };

const authReducer = (prev: AuthState, action: AuthAction): AuthState => {
    if (action.type === 'login') {
        const decodedToken = decodeJwt<DecodedToken>(action.payload["access_token"]);
        // TODO: Maybe throw error here
        console.log(decodedToken)
        return {
            token: action.payload["access_token"],
            permissions: decodedToken["permissions"]
        }
    } else if (action.type === 'logout') {
        return {
            token: '',
            permissions: ''
        }
    } else {
        throw new Error(`unhandled action type: ${(action as { type: string }).type}`)
    }
}
export const authAtom = atomWithStorage<AuthState>('auth', {
    token: '',
    permissions: '',
})

export const useAuthReducer = () => {
    const [auth, dispatch] = useReducerAtom(authAtom, authReducer)
    return {
        auth,
        login: (response: { access_token: string }) => dispatch({ type: 'login', payload: response }),
        logout: () => dispatch({ type: 'logout' }),
    }
}
