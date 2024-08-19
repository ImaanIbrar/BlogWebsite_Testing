import { useDispatch } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import { useState } from 'react'

export const useNotification = () => {
  const dispatch = useDispatch()

  const setSuccessNotification = (message, timeOut = 5) => {
    dispatch(setNotification({ status: 'success', message }, timeOut))
  }

  const setErrorNotification = (message, timeOut = 5) => {
    dispatch(setNotification({ status: 'error', message }, timeOut))
  }

  return { setSuccessNotification, setErrorNotification }
}

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (e) => {
    setValue(e.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    value,
    type,
    onChange,
    reset,
  }
}
