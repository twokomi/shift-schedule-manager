// 뷰 모드 전용 JavaScript (모바일 최적화)

let schedulesData = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
});

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
            renderMobileView(schedulesData);
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

// 모바일 최적화 뷰 렌더링
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
