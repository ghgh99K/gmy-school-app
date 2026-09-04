// ==========================================
// إعدادات API الموحدة للنظام
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxa_DUAJ-zkz-QgxHsldd-mr-MGu1BBFX3slDhDSpYXmoIvwfoikO9bQAhNgnhBXbpz/exec";

/**
 * دالة مركزية لإرسال جميع الطلبات إلى Google Apps Script Web App
 */
async function apiCall(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow", 
      body: JSON.stringify({ action: action, data: data })
    });

    if (!response.ok) {
      throw new Error(`خطأ في الاتصال بالخادم: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[API Error - ${action}]:`, error);
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
// 2. خدمات بوابة المدير والأرشيف (Admin / Index)
// ==========================================
const AdminAPI = {
  login: (username, password) => apiCall('checkAdminLogin', { username, password }),
  getOverviewStats: () => apiCall('getAdminOverviewStats'),
  getReports: (filters) => apiCall('getAdminReports', filters),
  getArchiveByDate: (dateString) => apiCall('getArchiveDataByDate', { date: dateString })
};

// ==========================================
// 3. خدمات بوابة الموظفين والتبريرات (Employee)
// ==========================================
const EmployeeAPI = {
  login: (empId, password) => apiCall('checkEmployeeLogin', { empId, password }),
  submitJustification: (payload) => apiCall('submitEmployeeJustification', payload),
  getAttendanceHistory: (empId) => apiCall('getEmployeeAttendanceHistory', { empId })
};

// ==========================================
// 🔥 الجلب الأوتوماتيكي عند تحميل الصفحة فوراً
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. إذا كنا في صفحة الأرشيف، نجلب بيانات تاريخ اليوم أوتوماتيكياً
    const archiveDateInput = document.querySelector('input[type="date"]') || document.getElementById('archiveDate');
    if (archiveDateInput) {
      let selectedDate = archiveDateInput.value;
      if (!selectedDate) {
        const today = new Date();
        selectedDate = today.toLocaleDateString('en-GB'); // dd/mm/yyyy
      }
      
      // استدعاء جلب بيانات الأرشيف تلقائياً
      if (typeof autoLoadArchive === "function") {
        autoLoadArchive(selectedDate);
      } else {
        const res = await AdminAPI.getArchiveByDate(selectedDate);
        if (res && res.data && typeof renderTableData === "function") {
          renderTableData(res.data);
        }
      }
    }
    
    // 2. إذا كنا في الصفحة الرئيسية (لوحة التحكم)، نجلب التقرير الشامل أوتوماتيكياً
    if (typeof loadDashboardData === "function") {
      loadDashboardData();
    }
  } catch (err) {
    console.log("Auto-load initialized:", err);
  }
});
