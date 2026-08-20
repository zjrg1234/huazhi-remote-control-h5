
import { get, post } from '@/utils/request'



export function LoginTop(data) {
  return post('https://xyvision.top/api/login',data)
}


export function DeviceDetails(data) {
  return post('https://xyvision.top/api/user/device/listAll',data ,{
  header: {
    Authorization: `Bearer ${data.token}`,
  },
})
}