// View Mode JavaScript (Mobile Optimized)

let schedulesData = [];
let selectedEmployees = new Set();
let currentView = 'all'; // 'all' or 'employee'

// Update current date and time display
function updateCurrentDateTime() {
    const now = new Date();
    
    // Format date: "Monday, January 19, 2026"
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    
    // Format time: "14:35:20"
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    const dateDisplay = document.getElementById('currentDateDisplay');
    const timeDisplay = document.getElementById('currentTimeDisplay');
    
    if (dateDisplay) dateDisplay.textContent = dateStr;
    if (timeDisplay) timeDisplay.textContent = timeStr;
}

// Execute on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default for Daily view
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = today;
    if (endDateInput) endDateInput.value = today;
    
    // Set current month for Monthly view
    const now = new Date();
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    // Update date/time display and refresh every second
    updateCurrentDateTime();
    setInterval(updateCurrentDateTime, 1000);
    
    // Load data after setting dates
    loadEmployeeList();
    loadSchedules();
});

// Switch view
function switchView(viewType) {
    currentView = viewType;
    
    // Update button styles
    const allBtn = document.getElementById('viewAll');
    const employeeBtn = document.getElementById('viewEmployee');
    const employeeFilter = document.getElementById('employeeFilter');
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    const currentDateTime = document.getElementById('currentDateTime');
    
    if (viewType === 'all') {
        allBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-blue-500 text-white transition';
        employeeBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition';
        employeeFilter.classList.add('hidden');
        dateRangeFilter.classList.remove('hidden');
        if (currentDateTime) currentDateTime.classList.remove('hidden');
    } else {
        allBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition';
        employeeBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-blue-500 text-white transition';
        employeeFilter.classList.remove('hidden');
        dateRangeFilter.classList.add('hidden');
        if (currentDateTime) currentDateTime.classList.add('hidden');
    }
    
    // Re-render data
    if (schedulesData.length > 0) {
        renderView();
    }
}

// Load employee list
async function loadEmployeeList() {
    try {
        const response = await axios.get('/api/employees');
        if (response.data.success) {
            const employees = response.data.data;
            renderEmployeeCheckboxes(employees);
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// Render employee checkboxes
function renderEmployeeCheckboxes(employees) {
    const container = document.getElementById('employeeCheckboxes');
    if (!container) return;
    
    let html = '';
    employees.forEach(emp => {
        const name = emp.employee_name;
        if (name && name.trim() !== '') {
            html += `
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input type="checkbox" value="${name}" onchange="toggleEmployee('${name}')"
                           class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                    <span class="text-sm font-medium text-gray-700">${name}</span>
                </label>
            `;
        }
    });
    container.innerHTML = html || '<p class="text-sm text-gray-500">No employees found.</p>';
}

// Toggle employee selection
function toggleEmployee(name) {
    if (selectedEmployees.has(name)) {
        selectedEmployees.delete(name);
    } else {
        selectedEmployees.add(name);
    }
    updateSelectedCount();
    
    // Re-render if employees selected
    if (schedulesData.length > 0) {
        renderView();
    }
}

// Update selected employee count
function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = `${selectedEmployees.size}`;
    }
}

// Load schedules
async function loadSchedules() {
    const container = document.getElementById('scheduleContainer');
    
    let startDate, endDate;
    
    if (currentView === 'employee') {
        // Monthly view: first day to last day of selected month
        const monthSelect = document.getElementById('monthSelect');
        const selectedMonth = monthSelect ? monthSelect.value : '2026-01';
        const [year, month] = selectedMonth.split('-');
        startDate = `${year}-${month}-01`;
        
        // Calculate last day of the month
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    } else {
        // Daily view: use start/end date
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    }
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
            <p>Loading schedules...</p>
        </div>
    `;

    try {
        const response = await axios.get('/api/schedules', {
            params: { start_date: startDate, end_date: endDate }
        });

        if (response.data.success) {
            schedulesData = response.data.data;
            renderView();
        } else {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                    <p>Error: ${response.data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                <p>Failed to load schedules.</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// Render view (Daily or Monthly)
function renderView() {
    if (currentView === 'employee' && selectedEmployees.size > 0) {
        renderEmployeeCalendarView();
    } else if (currentView === 'employee') {
        const container = document.getElementById('scheduleContainer');
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>Please select employees.</p>
            </div>
        `;
    } else {
        renderMobileView(schedulesData);
    }
}

// Render monthly calendar view
function renderEmployeeCalendarView() {
    const container = document.getElementById('scheduleContainer');
    
    if (selectedEmployees.size === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>Please select employees.</p>
            </div>
        `;
        return;
    }

    // Collect work days for selected employees (employee list by date)
    const workDaysByDate = {}; // { '2026-01-15': ['Bumsoo', 'Chris'], ... }

    schedulesData.forEach(schedule => {
        schedule.assignments.forEach(assignment => {
            if (selectedEmployees.has(assignment.employee_name)) {
                if (!workDaysByDate[schedule.date]) {
                    workDaysByDate[schedule.date] = [];
                }
                if (!workDaysByDate[schedule.date].includes(assignment.employee_name)) {
                    workDaysByDate[schedule.date].push(assignment.employee_name);
                }
            }
        });
    });

    // Generate dates from 1st to last day of selected month
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect ? monthSelect.value : '2026-01';
    const [year, month] = selectedMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    const dates = [];
    for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr + 'T00:00:00');
        dates.push({
            dateStr: dateStr,
            day: day,
            dayOfWeek: dateObj.getDay(),
            month: parseInt(month)
        });
    }

    // Render calendar
    const selectedNames = Array.from(selectedEmployees).join(', ');
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
                <h3 class="text-lg font-bold">
                    <i class="fas fa-calendar-check mr-2"></i>
                    Work Calendar
                </h3>
                <p class="text-sm text-purple-100 mt-1">Selected: ${selectedNames}</p>
            </div>
            <div class="p-4">
                ${renderCalendar(dates, workDaysByDate)}
            </div>
        </div>
    `;

    // Remove detailed schedule below (only show calendar)
    container.innerHTML = html;
}

// Render calendar (Outlook style)
function renderCalendar(dates, workDaysByDate) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Check day of week for first day
    const firstDayOfWeek = dates[0].dayOfWeek;
    
    let html = `
        <div class="grid grid-cols-7 gap-1 text-center">
            ${dayNames.map((day, idx) => `
                <div class="text-xs font-semibold text-gray-600 py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : ''}">
                    ${day}
                </div>
            `).join('')}
    `;

    // Add empty cells (before 1st day)
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="aspect-square"></div>';
    }

    // Render dates
    dates.forEach((date) => {
        const workingEmployees = workDaysByDate[date.dateStr] || [];
        const hasWork = workingEmployees.length > 0;

        const isToday = date.dateStr === new Date().toISOString().split('T')[0];
        const isSunday = date.dayOfWeek === 0;
        const isSaturday = date.dayOfWeek === 6;

        // Outlook style: show each employee separately when multiple work on same day
        let employeeLabels = '';
        if (hasWork) {
            workingEmployees.slice(0, 3).forEach((emp, idx) => {
                const colors = ['bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-blue-400', 'bg-green-400'];
                const colorClass = colors[idx % colors.length];
                employeeLabels += `
                    <div class="${colorClass} text-white text-[8px] px-1 rounded mb-0.5 truncate">
                        ${emp}
                    </div>
                `;
            });
            if (workingEmployees.length > 3) {
                employeeLabels += `
                    <div class="text-[8px] text-gray-600">+${workingEmployees.length - 3}</div>
                `;
            }
        }

        html += `
            <div class="relative aspect-square flex flex-col items-start justify-start p-1 rounded-lg border
                ${hasWork ? 'bg-purple-50 border-purple-300 border-2' : 'bg-gray-50 border-gray-200'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}">
                <div class="text-xs font-semibold ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'}">
                    ${date.day}
                </div>
                <div class="w-full mt-1 space-y-0.5">
                    ${employeeLabels}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// 필터링된 Shift 카드 렌더링 (선택된 직원만 하이라이트)
function renderShiftCardFiltered(shiftName, shiftTime, assignments, bgClass) {
    let html = `
        <div class="${bgClass} p-4">
            <div class="flex items-center mb-3">
                <i class="fas ${shiftName === 'Day' ? 'fa-sun' : 'fa-moon'} mr-2 text-lg"></i>
                <h4 class="font-bold text-lg">${shiftName} Shift</h4>
                <span class="ml-auto text-sm text-gray-600">${shiftTime}</span>
            </div>
            <div class="space-y-2">
    `;
    
    assignments.forEach(assignment => {
        const hasEmployee = assignment.employee_name && assignment.employee_name.trim() !== '';
        const isSelected = selectedEmployees.has(assignment.employee_name);
        const teamBadge = assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold mr-2">${assignment.team}</span>` : '';
        
        html += `
            <div class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm ${isSelected ? 'ring-2 ring-purple-400' : ''}">
                <div class="flex items-center">
                    <span class="text-xs font-semibold text-gray-500 w-24">${assignment.position}</span>
                    <div class="ml-2">
                        ${hasEmployee ? `
                            <div class="flex items-center">
                                ${teamBadge}
                                <span class="font-medium ${isSelected ? 'text-purple-700' : 'text-gray-800'}">${assignment.employee_name}</span>
                                ${isSelected ? '<i class="fas fa-check-circle text-purple-500 ml-2"></i>' : ''}
                            </div>
                        ` : '<span class="text-gray-400 text-sm">Unassigned</span>'}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Render daily view
function renderMobileView(schedules) {
    const container = document.getElementById('scheduleContainer');
    
    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>No schedules found.</p>
            </div>
        `;
        return;
    }

    // Group by date
    const schedulesByDate = {};
    schedules.forEach(schedule => {
        if (!schedulesByDate[schedule.date]) {
            schedulesByDate[schedule.date] = {
                date: schedule.date,
                day_of_week: schedule.day_of_week,
                day: null,
                night: null
            };
        }
        
        if (schedule.shift_type === 'day') {
            schedulesByDate[schedule.date].day = schedule;
        } else {
            schedulesByDate[schedule.date].night = schedule;
        }
    });

    // Render as cards
    let html = '<div class="space-y-4">';
    
    Object.keys(schedulesByDate).sort().forEach(date => {
        const dayData = schedulesByDate[date];
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        html += `
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <!-- Date Header -->
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold">${formattedDate} (${dayData.day_of_week})</h3>
                            <p class="text-sm text-blue-100">${date}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Day Shift -->
                ${dayData.day ? renderShiftCard('Day', '05:30-18:00', dayData.day.assignments, 'bg-yellow-50') : ''}
                
                <!-- Night Shift -->
                ${dayData.night ? renderShiftCard('Night', '17:30-06:00', dayData.night.assignments, 'bg-blue-50') : ''}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Render shift card
function renderShiftCard(shiftName, shiftTime, assignments, bgClass) {
    let html = `
        <div class="${bgClass} p-4">
            <div class="flex items-center mb-3">
                <i class="fas ${shiftName === 'Day' ? 'fa-sun' : 'fa-moon'} mr-2 text-lg"></i>
                <h4 class="font-bold text-lg">${shiftName} Shift</h4>
                <span class="ml-auto text-sm text-gray-600">${shiftTime}</span>
            </div>
            <div class="space-y-2">
    `;
    
    assignments.forEach(assignment => {
        const hasEmployee = assignment.employee_name && assignment.employee_name.trim() !== '';
        const teamBadge = assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold mr-2">${assignment.team}</span>` : '';
        
        html += `
            <div class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                <div class="flex items-center">
                    <span class="text-xs font-semibold text-gray-500 w-24">${assignment.position}</span>
                    <div class="ml-2">
                        ${hasEmployee ? `
                            <div class="flex items-center">
                                ${teamBadge}
                                <span class="font-medium text-gray-800">${assignment.employee_name}</span>
                            </div>
                        ` : '<span class="text-gray-400 text-sm">Unassigned</span>'}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}
