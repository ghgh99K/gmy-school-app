// ==========================================
// إعدادات API الموحدة للنظام
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxa_DUAJ-zkz-QgxHsldd-mr-MGu1BBFX3slDhDSpYXmoIvwfoikO9bQAhNgnhBXbpz/exec";

/**
 * دالة مركزية لإرسال جميع الطلبات إلى Google Apps Script Web App
 * @param {string} action - اسم الإجراء المطلوب في الخادم
 * @param {object} data - البيانات المراد إرسالها
 * @returns {Promise<object>} - النتيجة القادمة من الخادم
 */
async function apiCall(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: action, data: data })
    });

    if (!response.ok) {
      throw new Error(`خطأ في الاتصال بالخادم: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[API Error - ${action}]:`, error);
    alert("تعذر الاتصال بالخادم، يرجى التأكد من جودة اتصال الإنترنت والتجربة مجدداً.");
    throw error;
  }
}

// ==========================================
// 1. خدمات بوابة الحراسة العامة (Supervisor)
// ==========================================
const SupervisorAPI = {
  login: (su, sp) => apiCall('checkSupervisorLogin', { su, sp }),
  getDashboardData: () => apiCall('getSupervisorDashboardData'),
  saveMovement: (sup, teacher, reason) => apiCall('saveMovement', { sup, t: teacher, r: reason }),
  deleteMovement: (row) => apiCall('deleteMovement', { r: row }),
  saveVisitor: (d, n, l, s, h) => apiCall('saveVisitor', { d, n, l, s, h }),
  updateVisitor: (row, d, n, l, s, h) => apiCall('updateVisitor', { row, d, n, l, s, h }),
  deleteVisitor: (row) => apiCall('deleteVisitor', { r: row }),
  addSetting: (type, val) => apiCall('addVisitorSetting', { type, val }),
  deleteSetting: (type, val) => apiCall('deleteVisitorSetting', { type, val })
};

// ==========================================
// 2. خدمات بوابة المدير (Admin / Index)
// ==========================================
const AdminAPI = {
  login: (username, password) => apiCall('checkAdminLogin', { username, password }),
  getOverviewStats: () => apiCall('getAdminOverviewStats'),
  getReports: (filters) => apiCall('getAdminReports', filters)
};

// ==========================================
// 3. خدمات بوابة الموظفين والتبريرات (Employee)
// ==========================================
const EmployeeAPI = {
  login: (empId, password) => apiCall('checkEmployeeLogin', { empId, password }),
  submitJustification: (payload) => apiCall('submitEmployeeJustification', payload),
  getAttendanceHistory: (empId) => apiCall('getEmployeeAttendanceHistory', { empId })
};