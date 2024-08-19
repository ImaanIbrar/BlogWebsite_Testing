import axios from 'axios'
const baseUrl = '/api/users'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const register = async ({ name, username, password }) => {
  const response = await axios.post(`${baseUrl}`, { name, username, password })
  return response.data
}

export default { getAll, getOne, register }
