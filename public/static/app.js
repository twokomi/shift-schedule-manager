// 근무표 데이터 저장
let schedulesData = [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadSchedules();
});

// 근무표 조회
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
            renderSchedules(schedulesData);
        } else {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                    <p>오류: ${response.data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                <p>근무표를 불러오는데 실패했습니다.</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// 근무표 렌더링
function renderSchedules(schedules) {
    const container = document.getElementById('scheduleContainer');

    if (!schedules || schedules.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-info-circle text-3xl mb-2"></i>
                <p>표시할 근무표가 없습니다.</p>
            </div>
        `;
        return;
    }

    // 날짜별로 그룹화
    const dateGroups = {};
    schedules.forEach(schedule => {
        if (!dateGroups[schedule.date]) {
            dateGroups[schedule.date] = {
                date: schedule.date,
                day_of_week: schedule.day_of_week,
                day: null,
                night: null
            };
        }
        if (schedule.shift_type === 'day') {
            dateGroups[schedule.date].day = schedule;
        } else {
            dateGroups[schedule.date].night = schedule;
        }
    });

    // 테이블 형식으로 렌더링
    let html = `
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border border-gray-300 px-4 py-2 text-left font-semibold">날짜</th>
                        ${Object.keys(dateGroups).map(date => {
                            const group = dateGroups[date];
                            return `
                                <th class="border border-gray-300 px-2 py-2 text-center min-w-[120px]">
                                    <div class="font-bold">${formatDate(date)}</div>
                                    <div class="text-sm text-gray-600">${group.day_of_week}</div>
                                </th>
                            `;
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    // Day Shift
    html += `
        <tr class="bg-yellow-50">
            <td colspan="${Object.keys(dateGroups).length + 1}" class="border border-gray-300 px-4 py-2 font-bold">
                <i class="fas fa-sun text-yellow-500 mr-2"></i>
                Day Shift (05:30~18:00)
            </td>
        </tr>
    `;

    // Day shift positions
    const dayPositions = ['Backend', 'Front#BT1', 'Front#BT2', 'Front#WT', 'Front#IM'];
    dayPositions.forEach(position => {
        html += `
            <tr>
                <td class="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">${position}</td>
                ${Object.keys(dateGroups).map(date => {
                    const group = dateGroups[date];
                    const daySchedule = group.day;
                    if (!daySchedule) {
                        return '<td class="border border-gray-300 px-2 py-2 text-center text-gray-400">-</td>';
                    }
                    const assignment = daySchedule.assignments.find(a => a.position === position);
                    if (!assignment) {
                        return '<td class="border border-gray-300 px-2 py-2 text-center text-gray-400">-</td>';
                    }
                    return `
                        <td class="border border-gray-300 px-2 py-2 text-center editable" 
                            onclick="editAssignment(${daySchedule.id}, '${position}', '${assignment.employee_name}', '${assignment.team}')">
                            <div class="flex flex-col items-center gap-1">
                                ${assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold">${assignment.team}</span>` : ''}
                                <span class="font-medium">${assignment.employee_name || '-'}</span>
                            </div>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    });

    // Night Shift
    html += `
        <tr class="bg-blue-50">
            <td colspan="${Object.keys(dateGroups).length + 1}" class="border border-gray-300 px-4 py-2 font-bold">
                <i class="fas fa-moon text-blue-500 mr-2"></i>
                Night Shift (17:30~06:00)
            </td>
        </tr>
    `;

    // Night shift positions
    const nightPositions = ['Backend', 'Front#BT', 'Front#WT'];
    nightPositions.forEach(position => {
        html += `
            <tr>
                <td class="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">${position}</td>
                ${Object.keys(dateGroups).map(date => {
                    const group = dateGroups[date];
                    const nightSchedule = group.night;
                    if (!nightSchedule) {
                        return '<td class="border border-gray-300 px-2 py-2 text-center text-gray-400">-</td>';
                    }
                    const assignment = nightSchedule.assignments.find(a => a.position === position);
                    if (!assignment) {
                        return '<td class="border border-gray-300 px-2 py-2 text-center text-gray-400">-</td>';
                    }
                    return `
                        <td class="border border-gray-300 px-2 py-2 text-center editable" 
                            onclick="editAssignment(${nightSchedule.id}, '${position}', '${assignment.employee_name}', '${assignment.team}')">
                            <div class="flex flex-col items-center gap-1">
                                ${assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold">${assignment.team}</span>` : ''}
                                <span class="font-medium">${assignment.employee_name || '-'}</span>
                            </div>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// 배치 수정
function editAssignment(scheduleId, position, currentEmployee, currentTeam) {
    const newEmployee = prompt(`직원 이름을 입력하세요 (현재: ${currentEmployee || '없음'}):`, currentEmployee);
    if (newEmployee === null) return; // 취소

    const newTeam = prompt(`팀을 입력하세요 (A, B, C, D) (현재: ${currentTeam || '없음'}):`, currentTeam);
    if (newTeam === null) return; // 취소

    updateAssignment(scheduleId, position, newEmployee, newTeam);
}

// 배치 업데이트 API 호출
async function updateAssignment(scheduleId, position, employeeName, team) {
    try {
        const response = await axios.put(`/api/assignments/${scheduleId}/${position}`, {
            employee_name: employeeName,
            team: team
        });

        if (response.data.success) {
            alert('근무 배치가 업데이트되었습니다.');
            loadSchedules(); // 새로고침
        } else {
            alert('오류: ' + response.data.error);
        }
    } catch (error) {
        console.error('Error updating assignment:', error);
        alert('근무 배치 업데이트에 실패했습니다.');
    }
}

// 날짜 포맷팅
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 전역 함수로 등록
window.loadSchedules = loadSchedules;
window.editAssignment = editAssignment;
