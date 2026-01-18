// 뷰 모드 전용 JavaScript (모바일 최적화)

let schedulesData = [];
let selectedEmployees = new Set();
let currentView = 'all'; // 'all' or 'employee'

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
    loadEmployeeList();
});

// 뷰 전환
function switchView(viewType) {
    currentView = viewType;
    
    // 버튼 스타일 업데이트
    const allBtn = document.getElementById('viewAll');
    const employeeBtn = document.getElementById('viewEmployee');
    const employeeFilter = document.getElementById('employeeFilter');
    
    if (viewType === 'all') {
        allBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-blue-500 text-white transition';
        employeeBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition';
        employeeFilter.classList.add('hidden');
    } else {
        allBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition';
        employeeBtn.className = 'flex-1 py-2 px-3 rounded-lg font-semibold bg-blue-500 text-white transition';
        employeeFilter.classList.remove('hidden');
    }
    
    // 데이터 다시 렌더링
    if (schedulesData.length > 0) {
        renderView();
    }
}

// 직원 목록 로드
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

// 직원 체크박스 렌더링
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
    container.innerHTML = html || '<p class="text-sm text-gray-500">직원 목록이 없습니다.</p>';
}

// 직원 선택/해제
function toggleEmployee(name) {
    if (selectedEmployees.has(name)) {
        selectedEmployees.delete(name);
    } else {
        selectedEmployees.add(name);
    }
    updateSelectedCount();
    
    // 선택된 직원이 있으면 다시 렌더링
    if (schedulesData.length > 0) {
        renderView();
    }
}

// 선택된 직원 수 업데이트
function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = `${selectedEmployees.size}명`;
    }
}

// 근무표 불러오기
async function loadSchedules() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const container = document.getElementById('scheduleContainer');
    
    container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
            <p>근무표를 불러오는 중...</p>
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
                    <p>오류: ${response.data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                <p>근무표를 불러오는데 실패했습니다.</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// 뷰 렌더링 (전체 또는 직원별)
function renderView() {
    if (currentView === 'employee' && selectedEmployees.size > 0) {
        renderEmployeeCalendarView();
    } else {
        renderMobileView(schedulesData);
    }
}

// 직원별 캘린더 뷰 렌더링
function renderEmployeeCalendarView() {
    const container = document.getElementById('scheduleContainer');
    
    if (selectedEmployees.size === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>직원을 선택해주세요.</p>
            </div>
        `;
        return;
    }

    // 선택된 직원의 근무일 수집
    const employeeWorkDays = {};
    selectedEmployees.forEach(emp => {
        employeeWorkDays[emp] = new Set();
    });

    schedulesData.forEach(schedule => {
        schedule.assignments.forEach(assignment => {
            if (selectedEmployees.has(assignment.employee_name)) {
                employeeWorkDays[assignment.employee_name].add(schedule.date);
            }
        });
    });

    // 날짜 범위 생성
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const dates = generateDateRange(startDate, endDate);

    // 캘린더 렌더링
    let html = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
                <h3 class="text-lg font-bold">
                    <i class="fas fa-calendar-check mr-2"></i>
                    근무 캘린더
                </h3>
                <p class="text-sm text-purple-100 mt-1">선택한 직원: ${Array.from(selectedEmployees).join(', ')}</p>
            </div>
            <div class="p-4">
                ${renderCalendar(dates, employeeWorkDays)}
            </div>
        </div>
    `;

    // 아래에 상세 근무표 추가
    html += '<div class="space-y-4">';
    
    const schedulesByDate = {};
    schedulesData.forEach(schedule => {
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

    Object.keys(schedulesByDate).sort().forEach(date => {
        const dayData = schedulesByDate[date];
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        // 이 날짜에 선택된 직원이 근무하는지 확인
        let hasSelectedEmployee = false;
        selectedEmployees.forEach(emp => {
            if (employeeWorkDays[emp].has(date)) {
                hasSelectedEmployee = true;
            }
        });

        // 선택된 직원이 근무하는 날만 표시
        if (hasSelectedEmployee) {
            html += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden border-2 border-purple-300">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-bold">${formattedDate} (${dayData.day_of_week})</h3>
                                <p class="text-sm text-blue-100">${date}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${dayData.day ? renderShiftCardFiltered('Day', '05:30-18:00', dayData.day.assignments, 'bg-yellow-50') : ''}
                    ${dayData.night ? renderShiftCardFiltered('Night', '17:30-06:00', dayData.night.assignments, 'bg-blue-50') : ''}
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 날짜 범위 생성
function generateDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push({
            dateStr: `${year}-${month}-${day}`,
            day: d.getDate(),
            dayOfWeek: d.getDay(),
            month: d.getMonth() + 1
        });
    }
    return dates;
}

// 캘린더 렌더링
function renderCalendar(dates, employeeWorkDays) {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    let html = `
        <div class="grid grid-cols-7 gap-1 text-center">
            ${dayNames.map((day, idx) => `
                <div class="text-xs font-semibold text-gray-600 py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : ''}">
                    ${day}
                </div>
            `).join('')}
    `;

    dates.forEach((date, idx) => {
        // 이 날짜에 선택된 직원이 근무하는지 확인
        let hasWork = false;
        let workingEmployees = [];
        selectedEmployees.forEach(emp => {
            if (employeeWorkDays[emp].has(date.dateStr)) {
                hasWork = true;
                workingEmployees.push(emp);
            }
        });

        const isToday = date.dateStr === new Date().toISOString().split('T')[0];
        const isSunday = date.dayOfWeek === 0;
        const isSaturday = date.dayOfWeek === 6;

        html += `
            <div class="relative aspect-square flex flex-col items-center justify-center rounded-lg border
                ${hasWork ? 'bg-purple-100 border-purple-400 border-2' : 'bg-gray-50 border-gray-200'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}">
                <div class="text-xs font-semibold ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-700'}">
                    ${date.day}
                </div>
                ${hasWork ? `
                    <div class="absolute bottom-0 w-full">
                        <div class="h-1 bg-purple-500 rounded-full"></div>
                    </div>
                ` : ''}
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
                        ` : '<span class="text-gray-400 text-sm">미배정</span>'}
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

// 전체 뷰 렌더링
function renderMobileView(schedules) {
    const container = document.getElementById('scheduleContainer');
    
    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>근무표가 없습니다.</p>
            </div>
        `;
        return;
    }

    // 날짜별로 그룹화
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

    // 카드 형식으로 렌더링
    let html = '<div class="space-y-4">';
    
    Object.keys(schedulesByDate).sort().forEach(date => {
        const dayData = schedulesByDate[date];
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        html += `
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <!-- 날짜 헤더 -->
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

// Shift 카드 렌더링
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
                        ` : '<span class="text-gray-400 text-sm">미배정</span>'}
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
