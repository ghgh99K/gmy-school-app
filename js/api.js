// ==========================================
// إعدادات API الموحدة للنظام (Client-Side Wrapper)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxa_DUAJ-zkz-QgxHsldd-mr-MGu1BBFX3slDhDSpYXmoIvwfoikO9bQAhNgnhBXbpz/exec";

/**
 * دالة مركزية لإرسال جميع الطلبات إلى Google Apps Script Web App
 */
async function apiCall(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow", 
      body: JSON.stringify({ action: action, payload: payload })
    });

    if (!response.ok) {
      throw new Error(`خطأ في الاتصال بالخادم: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "حدث خطأ في استجابة الخادم");
    }
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
  login: (u, p) => apiCall('checkSupervisorLogin', { u, p }),
  getDashboardData: () => apiCall('getSupervisorDashboardData'),
  saveMovement: (s, t, r) => apiCall('saveMovement', { s, t, r }),
  deleteMovement: (row) => apiCall('deleteMovement', { row }),
  saveVisitor: (d, n, l, s, h) => apiCall('saveVisitor', { d, n, l, s, h }),
  updateVisitor: (row, d, n, l, s, h) => apiCall('updateVisitor', { row, d, n, l, s, h }),
  deleteVisitor: (row) => apiCall('deleteVisitor', { row })
};

// ==========================================
// 2. خدمات بوابة المدير والإدارة (Admin)
// ==========================================
const AdminAPI = {
  login: (u, p) => apiCall('login', { u, p }),
  getOverviewStats: () => apiCall('getInitialDashboardData'),
  getArchiveByDate: (dateString) => apiCall('getArchiveDataByDate', { dateString }),
  
  // إدارة الموظفين والفئات
  getEmployeeDetails: (id) => apiCall('getEmployeeDetails', { id }),
  saveNewStaff: (id, name, phone, cat) => apiCall('saveNewStaff', { id, name, phone, cat }),
  removeStaff: (id) => apiCall('removeStaff', { id }),
  getAllStaff: () => apiCall('getAllStaff'),
  saveBulkStaff: (arr) => apiCall('saveBulkStaff', { arr }),
  
  updateConfigTime: (c, w, s) => apiCall('updateConfigTime', { c, w, s }),
  deleteConfigCategory: (n) => apiCall('deleteConfigCategory', { n }),
  renameConfigCategory: (o, n) => apiCall('renameConfigCategory', { o, n })
};

// ==========================================
// 3. خدمات بوابة الموظفين والتبريرات (Employee)
// ==========================================
const EmployeeAPI = {
  submitJustification: (id, name, type, reason) => apiCall('saveJustification', { id, name, type, reason })
};

// ==========================================
// 🔥 الجلب الأوتوماتيكي عند تحميل الصفحة فوراً
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. جلب تلقائي لبيانات الأرشيف في حال وجود حقل التاريخ
    const archiveDateInput = document.querySelector('input[type="date"]') || document.getElementById('archiveDate');
    if (archiveDateInput) {
      let selectedDate = archiveDateInput.value;
      if (!selectedDate) {
        const today = new Date();
        selectedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      
      if (typeof autoLoadArchive === "function") {
        autoLoadArchive(selectedDate);
      } else {
        const res = await AdminAPI.getArchiveByDate(selectedDate);
        if (res && res.data && typeof renderTableData === "function") {
          renderTableData(res.data);
        }
      }
    }
    
    // 2. جلب تلقائي للوحة التحكم الرئيسية
    if (typeof loadDashboardData === "function") {
      loadDashboardData();
    }
  } catch (err) {
    console.warn("Auto-load initialized notice:", err);
  }
});
