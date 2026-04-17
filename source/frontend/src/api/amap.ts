import { http } from '@/api/request'

/**
 * 逆地理编码：经纬度转地址
 */
export function reverseGeocode(latitude: number, longitude: number): Promise<{
  latitude: number
  longitude: number
  address?: string
  province?: string
  city?: string
  district?: string
  street?: string
}> {
  return http.get('/geocode/reverse', { params: { latitude, longitude } })
}
