import "@ethersproject/shims";
import { ethers } from "ethers";
import React from "react";
import { Recipient } from "./screens/payflow/payflow_context";
import { storeRecentContact } from "./services/data_service";

export enum AuthState {
  "success",
  "failure",
  "undefined",
}

export enum AppErrorCodes {
  "device_not_elegible",
  "biometric_auth_user_not_enrolled",
  "network_not_available",
}

export type AppError = {
  code: AppErrorCodes;
  description: string;
};


export type ApplicationState = {
  auth: AuthState | undefined;
  provider: ethers.providers.JsonRpcProvider | undefined;
  wallet?: ethers.Wallet | undefined;
  balance: string;
  phoneNumber: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  image: string | undefined;
  decimals: ethers.BigNumber | undefined;
  error: AppError | undefined;
  recentReceivers: Array<Recipient>;
};

export type AppAction =
  | { type: "auth_success" }
  | { type: "auth_failure" }
  | { type: "set_decimals"; payload: ethers.BigNumber }
  | { type: "set_balance"; payload: string }
  | {
      type: "set_user_details";
      payload: {
        phoneNumber: string;
        firstName: string;
        lastName: string;
      };
    }
  | { type: "clear_user_details"; payload: undefined }
  | { type: "set_profile_image"; payload: string }
  | { type: "clear_profile_image"; payload: undefined }
  | { type: "add_recent_receiver"; payload: Recipient}
  | { type: "clear_recent_receivers"; payload: undefined}
  | { type: "set_provider"; payload: ethers.providers.JsonRpcProvider }
  | { type: "set_wallet"; payload: ethers.Wallet }
  | { type: "error"; error: AppError | undefined };

export type Dispatch = (action: AppAction) => void;

type AppStateProviderProps = {
  children: React.ReactNode;
  state?: ApplicationState;
};

const ApplicationStateContext = React.createContext<ApplicationState | undefined>(undefined);
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
      return { ...state, balance: action.payload };
    }

    case "set_user_details": {
      return {
        ...state,
        phoneNumber: action.payload.phoneNumber,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
      };
    }

    case "clear_user_details": {
      return {
        ...state,
        phoneNumber: undefined,
        firstName: undefined,
        lastName: undefined,
      };
    }

    case "set_profile_image": {
      return {
        ...state,
        image: action.payload,
      };
    }

    case "clear_profile_image": {
      return {
        ...state,
        image: undefined,
      };
    }

    case "add_recent_receiver": {
      return {
        ...state,
        recentReceivers: state.recentReceivers.concat(action.payload)
      }
    }

    case "clear_recent_receivers": {
      return {
        ...state,
        recentReceivers: []
      }
    }

    case "set_decimals": {
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
  firstName: undefined,
  lastName: undefined,
  image: undefined,
  decimals: undefined,
  recentReceivers: []
};

function AppProvider({ children, state }: AppStateProviderProps) {
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
