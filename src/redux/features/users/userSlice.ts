import { createSlice } from "@reduxjs/toolkit";

type User = {
    status: boolean,
    user: any
}

const initialState: User = {
    status : false,
    user: null
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true
            state.user = action.payload
        },
        logout: (state) => {
            state.status = false
            state.user = null
        }
    }
})

export default userSlice.reducer
export const { login, logout } = userSlice.actions