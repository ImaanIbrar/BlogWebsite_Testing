import { createSlice } from '@reduxjs/toolkit'

const initialState = { status: '', message: '' }

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    set(state, action) {
      return action.payload
    },
    clear() {
      return initialState
    },
  },
})

export const { set, clear } = notificationSlice.actions

export const setNotification = (notification, timeOut) => {
  const timeMiliseconds = timeOut * 1000
  return async (dispatch) => {
    dispatch(set(notification))
    setTimeout(() => {
      dispatch(clear())
    }, timeMiliseconds)
  }
}

export default notificationSlice.reducer
