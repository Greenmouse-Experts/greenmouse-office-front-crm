import apiClient, { new_url } from "@/api/simpleApi";

export interface ApiResponse {
  payload?: any;
  message?: string;
}

export { new_url };
export default apiClient;
