import { http } from "./http";

export const login = async (data: { email: string; password: string }) => {
  const response = await http.post("/auth/login", data);
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  fullName: string;
  role: "STUDENT" | "ADMIN";
}) => {
  const response = await http.post("/auth/register", data);
  return response.data;
};
