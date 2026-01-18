// 근무표 데이터 저장
let schedulesData = [];
let copiedData = null; // 복사된 데이터 저장

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
        <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-800 mb-2">
                <i class="fas fa-info-circle mr-2"></i>
                사용 방법
            </h3>
            <ul class="text-sm text-blue-700 space-y-1">
                <li><i class="fas fa-mouse-pointer mr-2"></i><strong>우클릭</strong>: 셀을 복사합니다</li>
                <li><i class="fas fa-paste mr-2"></i><strong>좌클릭</strong>: 복사한 내용을 붙여넣습니다</li>
                <li><i class="fas fa-edit mr-2"></i><strong>Shift + 좌클릭</strong>: 직접 수정합니다</li>
            </ul>
            <div class="mt-2 text-sm text-blue-600" id="copiedInfo" style="display: none;">
                <i class="fas fa-clipboard-check mr-2"></i>
                <span id="copiedText"></span>
            </div>
        </div>
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
                    return renderCell(daySchedule.id, position, assignment);
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
                    return renderCell(nightSchedule.id, position, assignment);
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

// 셀 렌더링 함수
function renderCell(scheduleId, position, assignment) {
    // 특수문자 이스케이프 (HTML 속성에서 사용하기 위해)
    const escapedEmployee = (assignment.employee_name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const escapedTeam = (assignment.team || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    return `
        <td class="border border-gray-300 px-2 py-2 text-center editable" 
            data-schedule-id="${scheduleId}"
            data-position="${position}"
            data-employee="${escapedEmployee}"
            data-team="${escapedTeam}"
            onclick="handleCellClick(event, this)"
            oncontextmenu="handleCellRightClick(event, this); return false;">
            <div class="flex flex-col items-center gap-1">
                ${assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold">${assignment.team}</span>` : ''}
                <span class="font-medium">${assignment.employee_name || '-'}</span>
            </div>
        </td>
    `;
}

// 셀 우클릭 - 복사
function handleCellRightClick(event, cellElement) {
    event.preventDefault();
    
    const employeeName = cellElement.getAttribute('data-employee');
    const team = cellElement.getAttribute('data-team');
    
    copiedData = {
        employee_name: employeeName,
        team: team
    };
    
    // 복사 완료 표시
    const copiedInfo = document.getElementById('copiedInfo');
    const copiedText = document.getElementById('copiedText');
    copiedText.textContent = `복사됨: ${team ? `[${team}] ` : ''}${employeeName || '(빈 셀)'}`;
    copiedInfo.style.display = 'block';
    
    // 3초 후 메시지 숨김
    setTimeout(() => {
        copiedInfo.style.display = 'none';
    }, 3000);
}

// 셀 클릭 - 붙여넣기 또는 수정
function handleCellClick(event, cellElement) {
    const scheduleId = cellElement.getAttribute('data-schedule-id');
    const position = cellElement.getAttribute('data-position');
    const currentEmployee = cellElement.getAttribute('data-employee');
    const currentTeam = cellElement.getAttribute('data-team');
    
    // Shift 키를 누르고 클릭하면 직접 수정 모드
    if (event.shiftKey) {
        editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam);
        return;
    }
    
    // 복사된 데이터가 있으면 붙여넣기
    if (copiedData) {
        pasteAssignment(cellElement, scheduleId, position, copiedData.employee_name, copiedData.team);
    } else {
        // 복사된 데이터가 없으면 직접 수정
        editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam);
    }
}

// 붙여넣기
async function pasteAssignment(cellElement, scheduleId, position, employeeName, team) {
    await updateAssignment(cellElement, scheduleId, position, employeeName, team);
}

// 배치 수정 (직접 입력)
function editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam) {
    const newEmployee = prompt(`직원 이름을 입력하세요 (현재: ${currentEmployee || '없음'}):`, currentEmployee);
    if (newEmployee === null) return; // 취소

    const newTeam = prompt(`팀을 입력하세요 (A, B, C, D) (현재: ${currentTeam || '없음'}):`, currentTeam);
    if (newTeam === null) return; // 취소

    updateAssignment(cellElement, scheduleId, position, newEmployee, newTeam);
}

// 배치 업데이트 API 호출
async function updateAssignment(cellElement, scheduleId, position, employeeName, team) {
    try {
        const response = await axios.put(`/api/assignments/${scheduleId}/${position}`, {
            employee_name: employeeName,
            team: team
        });

        if (response.data.success) {
            // 해당 셀만 업데이트 (스크롤 위치 유지)
            updateCellContent(cellElement, employeeName, team);
        } else {
            alert('오류: ' + response.data.error);
        }
    } catch (error) {
        console.error('Error updating assignment:', error);
        alert('근무 배치 업데이트에 실패했습니다.');
    }
}

// 셀 내용만 업데이트 (전체 새로고침 없이)
function updateCellContent(cellElement, employeeName, team) {
    // 데이터 속성 업데이트
    cellElement.setAttribute('data-employee', employeeName);
    cellElement.setAttribute('data-team', team);
    
    // 셀 내용 업데이트
    const teamBadge = team ? `<span class="team-badge-${team} px-2 py-1 rounded text-xs font-semibold">${team}</span>` : '';
    const employeeDisplay = employeeName || '-';
    
    cellElement.innerHTML = `
        <div class="flex flex-col items-center gap-1">
            ${teamBadge}
            <span class="font-medium">${employeeDisplay}</span>
        </div>
    `;
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
window.handleCellClick = handleCellClick;
window.handleCellRightClick = handleCellRightClick;
