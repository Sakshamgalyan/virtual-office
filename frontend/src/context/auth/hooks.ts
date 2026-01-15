import { useContext } from "react";
import {
  AuthStateContext,
  AuthDispatchContext,
} from "@/context/auth/index";

export const useAuthStateContext = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error(
      "useAuthStateContext should be wrap under AuthContextProvider",
    );
  }
  const { state } = context;
  return { ...state };
};

export const useAuthDispatchContext = () => {
  const dispatchContext = useContext(AuthDispatchContext);
  if (!dispatchContext) {
    throw new Error(
      "useAuthDispatchContext should be wrap under AuthContextProvider",
    );
  }
  const { dispatch } = dispatchContext;
  return dispatch;
};
