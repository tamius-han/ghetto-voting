import axios, { AxiosInstance } from "axios";


const baseUrl = `${window.location.protocol}//${window.location.hostname}:6969/`
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
});
export default apiClient;
