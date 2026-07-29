import { api } from "@/api/clients";

export const registerUser = async (data: { full_name: string; email: string; password: string }) => {
  const response = await api.post("/api/v1/auth/register/", data);
  return response.data;
};

export const verifyRegisterOtp = async (data: { email: string; otp: string }) => {
  const response = await api.post("/api/v1/otp/verify-register-otp/", data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/api/v1/auth/login/", data);
  return response.data;
};
