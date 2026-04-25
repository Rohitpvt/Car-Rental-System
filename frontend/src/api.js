// src/api.js
// Base URL pointing to the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/backend/api";

const request = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {},
  };
  
  // Set json content type only if body is not FormData
  if (body && !(body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
      options.body = body;
  }

  // Inject JWT Token securely!
  const userStr = localStorage.getItem('user');
  if (userStr) {
     const user = JSON.parse(userStr);
     if (user.token) {
       options.headers['Authorization'] = `Bearer ${user.token}`;
     }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // RBAC Redirect Handling
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Attempt standard json response unpacking first
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Network error. Backend not reachable.', error };
  }
};

export const registerUser = (userData) => request('/register.php', 'POST', userData);
export const loginUser = (credentials) => request('/login.php', 'POST', credentials);
export const googleAuth = (userData) => request('/google_auth.php', 'POST', userData);
export const verifyIdentity = (formData) => request('/verify_identity.php', 'POST', formData);
export const getCars = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  );
  const qs = new URLSearchParams(cleanParams).toString();
  return request(`/cars.php${qs ? `?${qs}` : ''}`, 'GET');
};
export const addCar = (carFormData) => request('/add_car.php', 'POST', carFormData); // Passed as FormData!
export const updateCar = (carData) => request('/update_car.php', 'POST', carData);
export const bookCar = (bookingData) => request('/book_car.php', 'POST', bookingData);
export const getBookedCars = () => request('/booked_cars.php', 'GET');
export const getCarBookings = (carId) => request(`/car_bookings.php?car_id=${carId}`, 'GET');
