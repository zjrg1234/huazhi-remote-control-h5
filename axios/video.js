
import { get, post } from '@/utils/request'



export function LoginTop(data) {
  return post('https://xyvision.top/api/login',data)
}


export function DeviceDetails(data) {
  return post('https://xyvision.top/api/user/device/listAll',data ,{
  headers: {
    Authorization: `Bearer ${data.token}`,
  },
})
}