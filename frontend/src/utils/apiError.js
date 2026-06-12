export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra. Vui lòng thử lại.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return fallback;
}

export function parseApiErrorPayload(payload, status) {
  if (!payload) {
    return `Yêu cầu thất bại (${status})`;
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (payload.message) {
    return payload.message;
  }
  if (payload.error && typeof payload.error === "string") {
    return payload.error;
  }
  return `Yêu cầu thất bại (${status})`;
}
