import "@ethersproject/shims";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ethers } from "ethers";
import React from "react";

export enum AuthState {
  "success",
  "failure",
  "undefined",
}

export type ApplicationState = {
  auth: AuthState | undefined;
  provider: ethers.providers.JsonRpcProvider | undefined;
  wallet?: ethers.Wallet | undefined;
  balance: string;
  phoneNumber?: string | undefined;
  decimals: ethers.BigNumber | undefined;
  error: string | undefined;
};

type AppAction =
  | { type: "auth_success" }
  | { type: "auth_failure" }
  | { type: "set_decimals"; payload: ethers.BigNumber }
  | { type: "set_balance"; payload: string }
  | { type: "set_phone_number"; payload: string }
  | { type: "set_provider"; payload: ethers.providers.JsonRpcProvider }
  | { type: "set_wallet"; payload: ethers.Wallet }
  | { type: "error"; error: string | undefined };

type Dispatch = (action: AppAction) => void;

type AppStateProviderProps = {
  children: React.ReactNode;
  state?: ApplicationState;
};

const ApplicationStateContext = React.createContext<
  ApplicationState | undefined
>(undefined);
const AppDispatchContext = React.createContext<Dispatch | undefined>(undefined);

function AppStateReducer(
  state: ApplicationState,
  action: AppAction
): ApplicationState {
  switch (action.type) {
    case "set_provider": {
      return { ...state, provider: action.payload };
    }

    case "set_wallet": {
      return { ...state, wallet: action.payload };
    }

    case "set_balance": {
      AsyncStorage.setItem("pai.balance", action.payload);
      return { ...state, balance: action.payload };
    }
    case "set_phone_number": {
      AsyncStorage.setItem("user.phone_number", action.payload);
      return { ...state, phoneNumber: action.payload };
    }
    case "set_decimals": {
      AsyncStorage.setItem("pai.decimals", action.payload.toString());
      return { ...state, decimals: action.payload };
    }

    case "auth_success": {
      return { ...state, auth: AuthState.success };
    }

    case "auth_failure": {
      return { ...state, auth: AuthState.failure };
    }

    case "error": {
      return { ...state, error: action.error };
    }

    default: {
      throw new Error(`Invalid AppDispatch Action: '${action}'`);
    }
  }
}

const initialState: ApplicationState = {
  auth: AuthState.undefined,
  provider: undefined,
  error: undefined,
  balance: "0",
  phoneNumber: undefined,
  decimals: undefined,
};

const getInitialState = async () => {
  console.log("\n\nGETINITIALSTATE CALLED");
  const balance = await AsyncStorage.getItem("pai.balance");
  const phoneNumber = await AsyncStorage.getItem("user.phone_number");
  const decimals = await AsyncStorage.getItem("pai.decimals");

  return {
    auth: AuthState.undefined,
    provider: undefined,
    error: undefined,
    balance: balance || "0",
    phoneNumber: phoneNumber || undefined,
    decimals: decimals ? ethers.BigNumber.from(decimals) : undefined,
  };
};

function AppProvider({ children, state }: AppStateProviderProps) {
  // let appState, dispatch;

  // (async () => {
  //   if(!state) {
  //     await getInitialState()
  //     .then(initialState => {
  //       [appState, dispatch] = React.useReducer(AppStateReducer, initialState);
  //     })
  //   } else {
  //       [appState, dispatch] = React.useReducer(AppStateReducer, state);
  //   }
  // })();

  const [appState, dispatch] = React.useReducer(
    AppStateReducer,
    state || initialState
  );

  return (
    <ApplicationStateContext.Provider value={appState}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </ApplicationStateContext.Provider>
  );
}

const useAppState = () => {
  const context = React.useContext(ApplicationStateContext);
  if (context === undefined)
    throw new Error(
      "useAppState must be used within an ApplicationStateContext Provider"
    );

  return context;
};

const useAppDispatch = () => {
  const dispatch = React.useContext(AppDispatchContext);
  if (dispatch === undefined)
    throw new Error(
      "useAppDispatch must be used within an AppDispatchContext Provider"
    );

  return dispatch;
};

const useAppContext = (): [ApplicationState, React.Dispatch<AppAction>] => [
  useAppState(),
  useAppDispatch(),
];

export { useAppContext, useAppState, useAppDispatch, AppProvider };
