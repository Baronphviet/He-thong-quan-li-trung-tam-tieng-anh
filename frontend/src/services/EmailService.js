// src/services/emailService.js

const API_BASE_URL = 'http://localhost:8080/api/admin/email';

export const emailService = {
    /**
     * Gửi email tùy chỉnh từ giao diện quản trị công văn/thông báo
     * @param {string} toEmail - Địa chỉ nhận thư
     * @param {string} subject - Tiêu đề thư
     * @param {string} content - Nội dung thư (Hỗ trợ HTML)
     */
    sendCustomEmail: async (toEmail, subject, content) => {
        try {
            const response = await fetch(`${API_BASE_URL}/send-custom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu hệ thống của bạn có JWT Token bảo mật, hãy thêm dòng dưới đây:
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    to: toEmail,
                    subject: subject,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error('Yêu cầu gửi mail thất bại từ phía Server');
            }

            return await response.json();
        } catch (error) {
            console.error("Lỗi kết nối API Email:", error);
            throw error;
        }
    }
};