import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./features/users/userSlice"
import preferencesSlice from "./features/users/preferencesSlice"

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userSlice,
            preferences: preferencesSlice
        }
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']