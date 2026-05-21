import api from "./api";

type ApiError = {
  response?: unknown;
  message?: string;
};

export const postMethod = async (endpoint: string, payload: object) => {
  try {
    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getMethod = async (endpoint: string, params?: object) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.response || apiError.message) {
      throw error;
    }
    throw error;
  }
};





