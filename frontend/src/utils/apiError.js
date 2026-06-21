const ERROR_MAP = {
  "Invalid username or password": "Tài khoản hoặc mật khẩu không đúng",
  "User not found": "Không tìm thấy tài khoản",
  "Network Error": "Không thể kết nối đến máy chủ",
  "Request failed with status code 401": "Sai tài khoản hoặc mật khẩu",
  "Request failed with status code 403": "Bạn không có quyền truy cập",
  "Request failed with status code 500": "Lỗi hệ thống, vui lòng thử lại sau",
};

// Map theo từng constraint -> message tiếng Việt cụ thể
const DUPLICATE_KEY_MAP = {
  uk_users_phone: "Số điện thoại này đã được sử dụng cho tài khoản khác.",
  uk_users_email: "Email này đã được sử dụng cho tài khoản khác.",
  uk_users_username: "Tên tài khoản này đã tồn tại, vui lòng chọn tên khác.",
  uk_classes_year_name: "Tên lớp này đã tồn tại trong năm học đã chọn.",
  uk_enrollment_student_class: "Học sinh này đã được ghi danh vào lớp này rồi.",
};

function getDuplicateKeyMessage(message) {
  if (!message) return null;

  // Bắt theo tên constraint cụ thể (chính xác nhất)
  for (const key in DUPLICATE_KEY_MAP) {
    if (message.includes(key)) return DUPLICATE_KEY_MAP[key];
  }

  // Fallback chung nếu là lỗi trùng dữ liệu nhưng không khớp constraint nào ở trên
  if (message.includes("Duplicate entry") || message.toLowerCase().includes("constraint")) {
    return "Thông tin bị trùng với dữ liệu đã tồn tại. Vui lòng kiểm tra lại.";
  }

  return null;
}

export function getApiErrorMessage(
    error,
    fallback = "Có lỗi xảy ra. Vui lòng thử lại."
) {
  if (!error) return fallback;

  let message = "";

  if (typeof error === "string") {
    message = error;
  } else if (error?.response?.data) {
    message = parseApiErrorPayload(error.response.data, error.response.status);
  } else if (error?.message) {
    message = error.message;
  }

  // Ưu tiên kiểm tra lỗi trùng key trước (vì message thường chứa câu SQL động)
  const duplicateMessage = getDuplicateKeyMessage(message);
  if (duplicateMessage) return duplicateMessage;

  return ERROR_MAP[message] || message || fallback;
}

export function parseApiErrorPayload(payload, status) {
  if (!payload) {
    return `Yêu cầu thất bại (${status})`;
  }

  if (typeof payload === "string") return payload;

  if (payload.message) return payload.message;

  if (payload.error && typeof payload.error === "string") {
    return payload.error;
  }

  return `Request failed (${status})`;
}