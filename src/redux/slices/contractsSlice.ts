import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { getErrorMessage } from "../../lib/errors";
import { Contract } from "../../types/contracts";

interface ContractsState {
  contracts: Contract[];
  currentContract: Contract | null;
  otpDetails: { code: string; expiresAt: string; purpose: "checkout" | "return" } | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  currentContract: null,
  otpDetails: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchContracts = createAsyncThunk(
  "contracts/fetchContracts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get<any, Contract[]>("/contracts");
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch contracts"));
    }
  }
);

export const fetchContractById = createAsyncThunk(
  "contracts/fetchContractById",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await api.get<any, Contract>(`/contracts/${id}`);
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch contract details"));
    }
  }
);

export const confirmContract = createAsyncThunk(
  "contracts/confirmContract",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await api.post<any, Contract>(`/contracts/${id}/confirm`);
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to confirm agreement"));
    }
  }
);

export const cancelContract = createAsyncThunk(
  "contracts/cancelContract",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await api.post<any, Contract>(`/contracts/${id}/cancel`, { reason });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to cancel contract"));
    }
  }
);

export const generateOTP = createAsyncThunk(
  "contracts/generateOTP",
  async ({ id, purpose }: { id: string; purpose: "checkout" | "return" }, { rejectWithValue }) => {
    try {
      const data = await api.post<any, { code: string; expiresAt: string; purpose: "checkout" | "return" }>(
        `/contracts/${id}/generate-otp?purpose=${purpose}`
      );
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to generate security code"));
    }
  }
);

export const checkoutContract = createAsyncThunk(
  "contracts/checkoutContract",
  async ({ id, code }: { id: string; code: string }, { rejectWithValue }) => {
    try {
      const data = await api.post<any, Contract>(`/contracts/${id}/checkout`, { code });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Verification failed or incorrect security code"));
    }
  }
);

export const returnContract = createAsyncThunk(
  "contracts/returnContract",
  async ({ id, code }: { id: string; code: string }, { rejectWithValue }) => {
    try {
      const data = await api.post<any, Contract>(`/contracts/${id}/return`, { code });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Verification failed or incorrect security code"));
    }
  }
);

export const disputeCondition = createAsyncThunk(
  "contracts/disputeCondition",
  async (
    { id, reason, description }: { id: string; reason: string; description: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.post<any, Contract>(`/contracts/${id}/dispute-condition`, {
        reason,
        description,
      });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to submit dispute"));
    }
  }
);

export const rateContract = createAsyncThunk(
  "contracts/rateContract",
  async (
    { id, score, review }: { id: string; score: number; review: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.post<any, any>(`/contracts/${id}/rate`, { score, review });
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to submit rating"));
    }
  }
);

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearContractsError: (state) => {
      state.error = null;
    },
    clearOTPDetails: (state) => {
      state.otpDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchContracts
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchContractById
      .addCase(fetchContractById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContract = action.payload;
      })
      .addCase(fetchContractById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // confirmContract
      .addCase(confirmContract.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(confirmContract.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentContract = action.payload;
        state.contracts = state.contracts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(confirmContract.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // cancelContract
      .addCase(cancelContract.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelContract.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentContract = action.payload;
        state.contracts = state.contracts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(cancelContract.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // generateOTP
      .addCase(generateOTP.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(generateOTP.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.otpDetails = action.payload;
      })
      .addCase(generateOTP.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // checkoutContract
      .addCase(checkoutContract.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(checkoutContract.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentContract = action.payload;
        state.contracts = state.contracts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(checkoutContract.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // returnContract
      .addCase(returnContract.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(returnContract.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentContract = action.payload;
        state.contracts = state.contracts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(returnContract.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // disputeCondition
      .addCase(disputeCondition.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(disputeCondition.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentContract = action.payload;
        state.contracts = state.contracts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(disputeCondition.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContractsError, clearOTPDetails } = contractsSlice.actions;
export default contractsSlice.reducer;
