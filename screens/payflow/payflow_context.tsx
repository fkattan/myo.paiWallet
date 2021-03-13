import "@ethersproject/shims";
import { ethers } from "ethers";
import React from "react";

export enum TransactionStatus {
  "UNDEFINED",
  "SUCCESS",
  "ERROR",
  "IN_PROGRESS",
}
export interface Recipient {
  id?:string;
  name: string;
  address: string;
}
export type PayflowState = {
  recipient: Recipient | undefined;
  amount: string | undefined;
  memo: string | undefined;
  txStatus: TransactionStatus;
  receipt: ethers.providers.TransactionReceipt | undefined;
  error: string | undefined;
};

type PayflowAction =
  | { type: "set_recipient"; payload: Recipient }
  | { type: "set_amount"; payload: string }
  | { type: "set_memo"; payload: string }
  | { type: "set_tx_status"; payload: TransactionStatus }
  | { type: "set_tx_receipt"; payload: ethers.providers.TransactionReceipt }
  | { type: "error"; error: string | undefined };

type Dispatch = (action: PayflowAction) => void;

type PayflowStateProviderProps = {
  children: React.ReactNode;
  state?: PayflowState;
};

const PayflownStateContext = React.createContext<PayflowState | undefined>(
  undefined
);
const PayflowDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);

function AppStateReducer(
  state: PayflowState,
  action: PayflowAction
): PayflowState {
  switch (action.type) {
    case "set_recipient": {
      return { ...state, recipient: action.payload };
    }

    case "set_amount": {
      return { ...state, amount: action.payload };
    }

    case "set_memo": {
      return { ...state, memo: action.payload };
    }

    case "set_tx_status": {
      return { ...state, txStatus: action.payload };
    }

    case "set_tx_receipt": {
      return { ...state, receipt: action.payload };
    }

    case "error": {
      return { ...state, error: action.error };
    }

    default: {
      throw new Error(`Invalid AppDispatch Action: '${action}'`);
    }
  }
}

const initialState: PayflowState = {
  recipient: undefined,
  amount: undefined,
  memo: undefined,
  txStatus: TransactionStatus.UNDEFINED,
  receipt: undefined,
  error: undefined,
};

function PayflowProvider({ children, state }: PayflowStateProviderProps) {
  const [payflowState, dispatch] = React.useReducer(
    AppStateReducer,
    state || initialState
  );

  return (
    <PayflownStateContext.Provider value={payflowState}>
      <PayflowDispatchContext.Provider value={dispatch}>
        {children}
      </PayflowDispatchContext.Provider>
    </PayflownStateContext.Provider>
  );
}

const usePayflowState = (): PayflowState => {
  const context = React.useContext(PayflownStateContext);
  if (context === undefined)
    throw new Error(
      "useAppState must be used within an ApplicationStateContext Provider"
    );

  return context;
};

const usePayflowDispatch = (): React.Dispatch<PayflowAction> => {
  const dispatch = React.useContext(PayflowDispatchContext);
  if (dispatch === undefined)
    throw new Error(
      "useAppDispatch must be used within an AppDispatchContext Provider"
    );

  return dispatch;
};

const usePayflowContext = (): [PayflowState, React.Dispatch<PayflowAction>] => [
  usePayflowState(),
  usePayflowDispatch(),
];

export {
  usePayflowContext,
  usePayflowState,
  usePayflowDispatch,
  PayflowProvider,
};
