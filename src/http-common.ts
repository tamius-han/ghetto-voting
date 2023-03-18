import axios, { AxiosInstance } from "axios";


const baseUrl = `${window.location.protocol}//api.${window.location.hostname}/`
// const baseUrl = `https://api.glasovanje.d20.si/`
// const baseUrl = 'https://api.vote.amulet.tamius.net';
// const baseUrl = "https://localhost:6969"
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
});
export default apiClient;
