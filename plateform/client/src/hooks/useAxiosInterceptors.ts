import { useEffect } from "react";
import { axiosConfig } from "@/config/axiosConfig";

export const useAxiosInterceptor = () => {
  useEffect(() => {
    const interceptor = axiosConfig.interceptors.response.use(
        (response) => response,
        (error) => {
          const isIgnored =
              error.message === "canceled" ||
              (error.response?.status === 401 && (
                  error.config.url?.includes("/config") ||
                  error.config.url?.includes("/auth/google-sync")
              ));

          if (isIgnored) {
            return new Promise(() => {});
          }

          if (error.response?.status === 401) {
          }

          return Promise.reject(error);
        }
    );

    return () => axiosConfig.interceptors.response.eject(interceptor);
  }, []);
};