import { createSlice } from "@reduxjs/toolkit";

export const preferencesSlice = createSlice({
    name: "preferences",
    initialState: {
        wallpapers: []
    },
    reducers: {
        uploadPreferences: (state, action) => state = action.payload
    }
})

export default preferencesSlice.reducer
export const { uploadPreferences } = preferencesSlice.actions
