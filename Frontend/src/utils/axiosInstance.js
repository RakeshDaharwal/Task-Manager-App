import axios from 'axios';
import Swal from 'sweetalert2';


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
 
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.status === 201) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data?.message || 'Created successfully',
        timer: 1000,
        showConfirmButton: false,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
     
      if (isRefreshing) {
      
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
           
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            console.error('[401 Handler] Retry from queue failed:', err.message);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[Token Refresh] Requesting new access token...');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/refresh-token`, {
          withCredentials: true,
        });

        const newToken = res.data.accessToken;
       

        localStorage.setItem('accessToken', newToken);
        axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

        processQueue(null, newToken);

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('[Token Refresh] Failed:', err.message);
        processQueue(err, null);
        localStorage.removeItem('accessToken');

        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please login again.',
        });

        window.location.href = '/auth/signin';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic error
    console.error('[Generic Error Handler]', error.response?.data || error.message);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.',
    });

    return Promise.reject(error);
  }
);



export default axiosInstance;
