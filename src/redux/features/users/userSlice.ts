import { IUser } from "@/types/user.types";
import { createSlice } from "@reduxjs/toolkit";
import { HydratedDocument } from "mongoose";

type User = {
    status: boolean,
    user: HydratedDocument<IUser> | null
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
        },
        updateProfile: (state, action) => {
            if(state.user !== null) {
                state.user.bio = action.payload.bio
                state.user.profile_pic = action.payload.profile_pic
            }
        }
    }
})

export default userSlice.reducer
export const { login, logout, updateProfile } = userSlice.actions