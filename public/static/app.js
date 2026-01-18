// 근무표 데이터 저장
let schedulesData = [];
let copiedData = null; // 복사된 데이터 저장
let pendingChanges = []; // 저장 대기 중인 변경사항

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
            pendingChanges = []; // 조회 시 대기 중인 변경사항 초기화
            renderSchedules(schedulesData);
            updateSaveButtonState();
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
                <li><i class="fas fa-check-square mr-2"></i><strong>Ctrl/Cmd + 좌클릭</strong>: 여러 셀을 선택합니다</li>
                <li><i class="fas fa-trash mr-2"></i><strong>Delete 또는 Backspace 키</strong>: 선택한 모든 셀의 작업자를 제거합니다</li>
            </ul>
            <div class="mt-2 flex items-center justify-between">
                <div class="text-sm text-blue-600" id="copiedInfo" style="display: none;">
                    <i class="fas fa-clipboard-check mr-2"></i>
                    <span id="copiedText"></span>
                </div>
                <div class="flex gap-2 items-center">
                    <span class="text-sm text-gray-600" id="pendingCount">저장되지 않은 변경사항: 0개</span>
                    <button id="saveAllBtn" onclick="saveAllChanges()" disabled
                            class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                        <i class="fas fa-save mr-2"></i>
                        모두 저장
                    </button>
                </div>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse" id="scheduleTable">
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
    
    // 키보드 이벤트 리스너 추가
    setupKeyboardListeners();
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
            tabindex="0"
            onclick="handleCellClick(event, this)"
            oncontextmenu="handleCellRightClick(event, this); return false;"
            onfocus="selectCell(this)">
            <div class="flex flex-col items-center gap-1">
                ${assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold">${assignment.team}</span>` : ''}
                <span class="font-medium">${assignment.employee_name || '-'}</span>
            </div>
        </td>
    `;
}

// 선택된 셀들 추적 (복수 선택 지원)
let selectedCells = [];

function selectCell(cellElement, isMultiSelect = false) {
    if (!isMultiSelect) {
        // 단일 선택: 이전 선택 모두 해제
        selectedCells.forEach(cell => {
            cell.style.outline = '';
        });
        selectedCells = [cellElement];
    } else {
        // 복수 선택: 이미 선택되어 있으면 해제, 아니면 추가
        const index = selectedCells.indexOf(cellElement);
        if (index !== -1) {
            selectedCells.splice(index, 1);
            cellElement.style.outline = '';
        } else {
            selectedCells.push(cellElement);
        }
    }
    
    // 선택된 모든 셀에 테두리 표시
    selectedCells.forEach(cell => {
        cell.style.outline = '2px solid #3b82f6';
    });
}

// 키보드 이벤트 리스너 설정
function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event) {
    if (selectedCells.length === 0) return;
    
    // Delete 또는 Backspace 키로 작업자 제거
    if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeAssignments(selectedCells);
    }
}

// 여러 작업자 제거
function removeAssignments(cellElements) {
    if (cellElements.length === 0) return;
    
    const count = cellElements.length;
    if (confirm(`선택한 ${count}개 셀의 작업자를 제거하시겠습니까?`)) {
        cellElements.forEach(cellElement => {
            const scheduleId = cellElement.getAttribute('data-schedule-id');
            const position = cellElement.getAttribute('data-position');
            updateCellContentLocal(cellElement, '', '');
            addPendingChange(scheduleId, position, '', '');
        });
    }
}

// 셀 우클릭 - 복사
function handleCellRightClick(event, cellElement) {
    event.preventDefault();
    
    // Ctrl/Cmd 키가 눌려있지 않으면 단일 선택
    const isMultiSelect = event.ctrlKey || event.metaKey;
    selectCell(cellElement, isMultiSelect);
    
    const employeeName = cellElement.getAttribute('data-employee');
    const team = cellElement.getAttribute('data-team');
    
    copiedData = {
        employee_name: employeeName,
        team: team
    };
    
    // 복사 완료 표시 (타임아웃 제거)
    const copiedInfo = document.getElementById('copiedInfo');
    const copiedText = document.getElementById('copiedText');
    copiedText.textContent = `복사됨: ${team ? `[${team}] ` : ''}${employeeName || '(빈 셀)'}`;
    copiedInfo.style.display = 'block';
}

// 셀 클릭 - 붙여넣기 또는 수정
function handleCellClick(event, cellElement) {
    const scheduleId = cellElement.getAttribute('data-schedule-id');
    const position = cellElement.getAttribute('data-position');
    const currentEmployee = cellElement.getAttribute('data-employee');
    const currentTeam = cellElement.getAttribute('data-team');
    
    // Ctrl/Cmd 키를 누르고 클릭하면 복수 선택 모드
    if (event.ctrlKey || event.metaKey) {
        const isMultiSelect = true;
        selectCell(cellElement, isMultiSelect);
        return;
    }
    
    // Shift 키를 누르고 클릭하면 직접 수정 모드
    if (event.shiftKey) {
        selectCell(cellElement, false);
        editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam);
        return;
    }
    
    // 일반 클릭
    selectCell(cellElement, false);
    
    // 복사된 데이터가 있으면 붙여넣기
    if (copiedData) {
        pasteAssignment(cellElement, scheduleId, position, copiedData.employee_name, copiedData.team);
    } else {
        // 복사된 데이터가 없으면 직접 수정
        editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam);
    }
}

// 붙여넣기
function pasteAssignment(cellElement, scheduleId, position, employeeName, team) {
    updateCellContentLocal(cellElement, employeeName, team);
    addPendingChange(scheduleId, position, employeeName, team);
}

// 배치 수정 (직접 입력)
function editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam) {
    const newEmployee = prompt(`직원 이름을 입력하세요 (현재: ${currentEmployee || '없음'}):`, currentEmployee);
    if (newEmployee === null) return; // 취소

    const newTeam = prompt(`팀을 입력하세요 (A, B, C, D) (현재: ${currentTeam || '없음'}):`, currentTeam);
    if (newTeam === null) return; // 취소

    updateCellContentLocal(cellElement, newEmployee, newTeam);
    addPendingChange(scheduleId, position, newEmployee, newTeam);
}

// 로컬에서 셀 내용만 업데이트 (서버 저장 전)
function updateCellContentLocal(cellElement, employeeName, team) {
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
    
    // 변경 표시 (노란색 배경)
    cellElement.style.backgroundColor = '#fef3c7';
}

// 대기 중인 변경사항 추가
function addPendingChange(scheduleId, position, employeeName, team) {
    // 이미 있는 변경사항이면 업데이트
    const existingIndex = pendingChanges.findIndex(
        change => change.scheduleId === scheduleId && change.position === position
    );
    
    if (existingIndex !== -1) {
        pendingChanges[existingIndex] = { scheduleId, position, employeeName, team };
    } else {
        pendingChanges.push({ scheduleId, position, employeeName, team });
    }
    
    updateSaveButtonState();
}

// 저장 버튼 상태 업데이트
function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveAllBtn');
    const countSpan = document.getElementById('pendingCount');
    
    if (saveBtn && countSpan) {
        countSpan.textContent = `저장되지 않은 변경사항: ${pendingChanges.length}개`;
        saveBtn.disabled = pendingChanges.length === 0;
    }
}

// 모든 변경사항 저장
async function saveAllChanges() {
    if (pendingChanges.length === 0) return;
    
    const saveBtn = document.getElementById('saveAllBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
    
    let successCount = 0;
    let failCount = 0;
    
    for (const change of pendingChanges) {
        try {
            const response = await axios.put(`/api/assignments/${change.scheduleId}/${change.position}`, {
                employee_name: change.employeeName,
                team: change.team
            });
            
            if (response.data.success) {
                successCount++;
                // 저장 완료된 셀의 배경색 제거
                const cell = document.querySelector(
                    `[data-schedule-id="${change.scheduleId}"][data-position="${change.position}"]`
                );
                if (cell) {
                    cell.style.backgroundColor = '';
                }
            } else {
                failCount++;
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            failCount++;
        }
    }
    
    // 결과 표시
    if (failCount === 0) {
        alert(`모든 변경사항이 저장되었습니다. (${successCount}개)`);
        pendingChanges = [];
    } else {
        alert(`저장 완료: ${successCount}개\n실패: ${failCount}개`);
        // 실패한 항목들만 남김
        pendingChanges = pendingChanges.slice(successCount);
    }
    
    saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>모두 저장';
    updateSaveButtonState();
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
window.saveAllChanges = saveAllChanges;
