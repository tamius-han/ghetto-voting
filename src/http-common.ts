import axios, { AxiosInstance } from "axios";


const baseUrl = `${window.location.protocol}//api.${window.location.hostname}/`
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
});
export default apiClient;
