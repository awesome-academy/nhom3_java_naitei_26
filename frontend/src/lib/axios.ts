import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";

/**
 * Axios instance tập trung — toàn bộ API call trong app nên dùng instance này
 * thay vì gọi axios trực tiếp, để đảm bảo:
 * - baseURL luôn lấy từ biến môi trường
 * - Token tự động được gắn vào header
 * - Lỗi 401 được xử lý thống nhất
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor:
 * Tự động gắn Bearer token từ localStorage vào mọi request.
 * Token được lưu khi user login thành công.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chỉ truy cập localStorage ở client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * - Unwrap dữ liệu từ format ApiResponse { status, message, data } của Spring Boot
 * - Xử lý lỗi tập trung: 401 → redirect /login, lỗi khác → trả message chuẩn hóa
 *
 * 
 * - Thêm xử lý refresh token: khi nhận 401, nếu có refresh token, gọi API refresh để lấy access token mới và retry request.
 * - Nếu refresh token hết hạn hoặc không hợp lệ, xóa token và redirect về trang login.
 * TODO: Xác nhận format response thực tế với đội backend.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap: trả về trực tiếp phần data từ ApiResponse
    const apiResponse = response.data as ApiResponse<unknown>;
    return {
      ...response,
      data: apiResponse.data ?? response.data,
    };
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRequest = originalRequest.url?.includes("/auth/");
    const status = error.response?.status;

    // 401 Unauthorized - nếu không phải request auth, thử refresh token
    if (status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
          try {
            // Gọi API refresh token
            const refreshRes = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
              { refreshToken }
            );

            const newAccessToken = refreshRes.data.data?.accessToken || refreshRes.data.data?.token;
            const newRefreshToken = refreshRes.data.data?.refreshToken;

            if (newAccessToken) {
              localStorage.setItem("access_token", newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem("refresh_token", newRefreshToken);
              }

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
              // Refresh Token hết hạn hoặc không hợp lệ -> Đăng xuất
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");
              window.location.replace("/login");
              return Promise.reject(refreshError);
          }
        } else {
          // Không có refresh_token -> Đăng xuất
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          window.location.replace("/login");
        }
      }
    }

    const message = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
    return Promise.reject({
      status: status || 500,
      message,
      details: error.response?.data,
    });
  }
);

export default apiClient;
