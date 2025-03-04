import axios from "axios";
import { logout } from "./functions/logout";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const axiosInstance = (router: AppRouterInstance) => {
  const instance = axios.create({
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      if (error.status == 401 && error?.config?.url != "/api/auth") {
        logout(router);
      } else if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      } else return Promise.reject(error.message);
    }
  );

  return instance;
};
