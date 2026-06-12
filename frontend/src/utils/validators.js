export const validators = {
  required: (value) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "Bắt buộc nhập";
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Email không hợp lệ";
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^(\d{10,11})$/;
    return phoneRegex.test(value.replace(/\D/g, "")) ? null : "Số điện thoại không hợp lệ";
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length < min ? `Tối thiểu ${min} ký tự` : null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length > max ? `Tối đa ${max} ký tự` : null;
  },

  number: (value) => {
    if (!value) return null;
    return Number.isNaN(Number(value)) ? "Phải là số" : null;
  },

  min: (min) => (value) => {
    if (!value) return null;
    return Number(value) < min ? `Tối thiểu ${min}` : null;
  },

  max: (max) => (value) => {
    if (!value) return null;
    return Number(value) > max ? `Tối đa ${max}` : null;
  }
};

export function createValidator(rules) {
  return (fieldName, value, allValues) => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value, allValues);
      if (error) return error;
    }
    return null;
  };
}
