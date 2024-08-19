import { Alert } from '@mui/material'
import { useSelector } from 'react-redux'

const Notification = () => {
  const { status, message } = useSelector((state) => state.notification)

  if (!message) return null

  return (
    <Alert sx={{ position: 'absolute', right: 32, top: 96 }} severity={status}>
      {message}
    </Alert>
  )
}

export default Notification
