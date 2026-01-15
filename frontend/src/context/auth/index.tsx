import React, { createContext, useReducer, useCallback } from "react";
import type { Dispatch, ReactNode } from "react";
import type {
  AuthAction,
  AuthState,
} from "@/context/auth/type";
import reducer, { initialState } from "@/context/auth/reducer";
import { useAppSelector } from "@/store/hooks";

type StateContext = {
  state: AuthState;
};

type DispatchContext = {
  dispatch: Dispatch<AuthAction>;
};

const AuthStateContext = createContext<StateContext | undefined>(
  undefined,
);

const AuthDispatchContext = createContext<
  DispatchContext | undefined
>(undefined);

const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const enhancedDispatch = useCallback(
    (action: AuthAction) => {
      try {
        // trackBusinessEvent(action);
      } catch (error) {
        console.error("❌ Business event tracking failed:", error);
      }
      return dispatch(action);
    },
    [dispatch],
  );

  return (
    <AuthDispatchContext.Provider
      value={{ dispatch: enhancedDispatch }}
    >
      <AuthStateContext.Provider value={{ state }}>
        {children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

export default AuthContextProvider;

// Export context objects for external use
export { AuthStateContext, AuthDispatchContext };

export function useAuth() {
    const { user, isLoading } = useAppSelector((state) => state.auth);
    return { user, loading: isLoading };
}
