// 근무표 데이터 저장
let schedulesData = [];
let copiedData = null; // 복사된 데이터 저장
let pendingChanges = []; // 저장 대기 중인 변경사항

// 드래그 선택 관련 변수
let isDragging = false;
let dragStartCell = null;

// Undo/Redo 관련 변수
let undoStack = []; // 되돌리기 스택
let redoStack = []; // 다시 실행 스택

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
                <li><i class="fas fa-mouse-pointer mr-2"></i><strong>클릭</strong>: 셀을 선택합니다</li>
                <li><i class="fas fa-hand-pointer mr-2"></i><strong>드래그</strong>: 여러 셀을 드래그하여 선택합니다</li>
                <li><i class="fas fa-copy mr-2"></i><strong>Ctrl/Cmd + C</strong>: 선택한 셀을 복사합니다</li>
                <li><i class="fas fa-paste mr-2"></i><strong>Ctrl/Cmd + V</strong>: 복사한 내용을 붙여넣습니다</li>
                <li><i class="fas fa-undo mr-2"></i><strong>Ctrl/Cmd + Z</strong>: 되돌리기 (Undo)</li>
                <li><i class="fas fa-redo mr-2"></i><strong>Ctrl/Cmd + Y</strong>: 다시 실행 (Redo)</li>
                <li><i class="fas fa-check-square mr-2"></i><strong>Ctrl/Cmd + 클릭</strong>: 여러 셀을 개별 선택합니다</li>
                <li><i class="fas fa-trash mr-2"></i><strong>Delete 또는 Backspace</strong>: 선택한 셀의 작업자를 제거합니다</li>
                <li><i class="fas fa-edit mr-2"></i><strong>더블클릭</strong>: 직접 수정합니다</li>
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

    // 담당자별 근무시간 집계 추가
    html += renderEmployeeSummary(schedules);

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
            onmousedown="handleCellMouseDown(event, this)"
            onmouseenter="handleCellMouseEnter(event, this)"
            onmouseup="handleCellMouseUp(event, this)"
            ondblclick="handleCellDoubleClick(event, this)">
            <div class="flex flex-col items-center gap-1">
                ${assignment.team ? `<span class="team-badge-${assignment.team} px-2 py-1 rounded text-xs font-semibold">${assignment.team}</span>` : ''}
                <span class="font-medium">${assignment.employee_name || '-'}</span>
            </div>
        </td>
    `;
}

// 담당자별 근무시간 집계 렌더링
function renderEmployeeSummary(schedules) {
    // Day shift: 12.5시간 (05:30~18:00)
    // Night shift: 12.5시간 (17:30~06:00)
    const DAY_SHIFT_HOURS = 12.5;
    const NIGHT_SHIFT_HOURS = 12.5;
    
    // 담당자별 근무시간 집계
    const employeeHours = {};
    
    schedules.forEach(schedule => {
        schedule.assignments.forEach(assignment => {
            if (assignment.employee_name && assignment.employee_name.trim() !== '') {
                const name = assignment.employee_name;
                if (!employeeHours[name]) {
                    employeeHours[name] = {
                        dayCount: 0,
                        nightCount: 0,
                        totalHours: 0,
                        team: assignment.team || ''
                    };
                }
                
                if (schedule.shift_type === 'day') {
                    employeeHours[name].dayCount++;
                    employeeHours[name].totalHours += DAY_SHIFT_HOURS;
                } else {
                    employeeHours[name].nightCount++;
                    employeeHours[name].totalHours += NIGHT_SHIFT_HOURS;
                }
                
                // 팀 정보 업데이트 (가장 최근 팀 정보 사용)
                if (assignment.team) {
                    employeeHours[name].team = assignment.team;
                }
            }
        });
    });
    
    // 이름순 정렬 (기본값)
    let sortedEmployees = Object.entries(employeeHours).sort((a, b) => 
        a[0].localeCompare(b[0])
    );
    
    if (sortedEmployees.length === 0) {
        return '';
    }
    
    // 정렬 상태 저장을 위한 ID
    const tableId = 'employeeSummaryTable';
    
    let html = `
        <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-user-clock mr-2"></i>
                담당자별 근무시간 집계
            </h2>
            <div class="overflow-x-auto">
                <table id="${tableId}" class="min-w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 px-4 py-2 text-left font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('name')" title="클릭하여 정렬">
                                담당자 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                            <th class="border border-gray-300 px-4 py-2 text-center font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('team')" title="클릭하여 정렬">
                                팀 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                            <th class="border border-gray-300 px-4 py-2 text-center font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('dayCount')" title="클릭하여 정렬">
                                Day 근무 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                            <th class="border border-gray-300 px-4 py-2 text-center font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('nightCount')" title="클릭하여 정렬">
                                Night 근무 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                            <th class="border border-gray-300 px-4 py-2 text-center font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('totalDays')" title="클릭하여 정렬">
                                총 근무일 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                            <th class="border border-gray-300 px-4 py-2 text-center font-semibold cursor-pointer hover:bg-gray-200" 
                                onclick="sortTable('totalHours')" title="클릭하여 정렬">
                                총 근무시간 
                                <i class="fas fa-sort ml-1 text-gray-400"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="employeeSummaryBody">
    `;
    
    sortedEmployees.forEach(([name, data]) => {
        const totalDays = data.dayCount + data.nightCount;
        html += `
            <tr class="hover:bg-gray-50">
                <td class="border border-gray-300 px-4 py-2 font-medium">${name}</td>
                <td class="border border-gray-300 px-4 py-2 text-center">
                    ${data.team ? `<span class="team-badge-${data.team} px-2 py-1 rounded text-xs font-semibold">${data.team}</span>` : '-'}
                </td>
                <td class="border border-gray-300 px-4 py-2 text-center">${data.dayCount}일</td>
                <td class="border border-gray-300 px-4 py-2 text-center">${data.nightCount}일</td>
                <td class="border border-gray-300 px-4 py-2 text-center font-semibold">${totalDays}일</td>
                <td class="border border-gray-300 px-4 py-2 text-center font-semibold text-blue-600">${data.totalHours.toFixed(1)}시간</td>
            </tr>
        `;
    });
    
    // 합계 행 추가
    const totalDayCount = sortedEmployees.reduce((sum, [_, data]) => sum + data.dayCount, 0);
    const totalNightCount = sortedEmployees.reduce((sum, [_, data]) => sum + data.nightCount, 0);
    const totalDays = totalDayCount + totalNightCount;
    const totalHours = sortedEmployees.reduce((sum, [_, data]) => sum + data.totalHours, 0);
    
    html += `
                        <tr class="bg-blue-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2" colspan="2">합계</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">${totalDayCount}일</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">${totalNightCount}일</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">${totalDays}일</td>
                            <td class="border border-gray-300 px-4 py-2 text-center text-blue-600">${totalHours.toFixed(1)}시간</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
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
    
    // 드래그 종료 이벤트 (전역)
    document.addEventListener('mouseup', () => {
        isDragging = false;
        dragStartCell = null;
    });
}

function handleKeyDown(event) {
    // Ctrl+C / Cmd+C: 복사
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedCell();
        return;
    }
    
    // Ctrl+V / Cmd+V: 붙여넣기
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        pasteToSelectedCells();
        return;
    }
    
    // Ctrl+Z / Cmd+Z: 되돌리기 (Undo)
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        undo();
        return;
    }
    
    // Ctrl+Y / Cmd+Y: 다시 실행 (Redo)
    if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        redo();
        return;
    }
    
    // Delete 또는 Backspace: 삭제
    if (selectedCells.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        removeAssignments(selectedCells);
        return;
    }
}

// 선택된 셀 복사
function copySelectedCell() {
    if (selectedCells.length === 0) return;
    
    // 첫 번째 선택된 셀의 데이터 복사
    const cellElement = selectedCells[0];
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
}

// 선택된 셀들에 붙여넣기
function pasteToSelectedCells() {
    if (selectedCells.length === 0 || !copiedData) return;
    
    // Undo를 위해 이전 상태 저장
    const previousStates = selectedCells.map(cellElement => ({
        scheduleId: cellElement.getAttribute('data-schedule-id'),
        position: cellElement.getAttribute('data-position'),
        employeeName: cellElement.getAttribute('data-employee'),
        team: cellElement.getAttribute('data-team')
    }));
    
    // 변경 수행
    selectedCells.forEach(cellElement => {
        const scheduleId = cellElement.getAttribute('data-schedule-id');
        const position = cellElement.getAttribute('data-position');
        updateCellContentLocal(cellElement, copiedData.employee_name, copiedData.team);
        addPendingChange(scheduleId, position, copiedData.employee_name, copiedData.team);
    });
    
    // Undo 스택에 저장
    addToUndoStack({
        type: 'paste',
        cells: previousStates,
        newValue: { employeeName: copiedData.employee_name, team: copiedData.team }
    });
}

// 여러 작업자 제거
function removeAssignments(cellElements) {
    if (cellElements.length === 0) return;
    
    const count = cellElements.length;
    if (confirm(`선택한 ${count}개 셀의 작업자를 제거하시겠습니까?`)) {
        // Undo를 위해 이전 상태 저장
        const previousStates = cellElements.map(cellElement => ({
            scheduleId: cellElement.getAttribute('data-schedule-id'),
            position: cellElement.getAttribute('data-position'),
            employeeName: cellElement.getAttribute('data-employee'),
            team: cellElement.getAttribute('data-team')
        }));
        
        // 변경 수행
        cellElements.forEach(cellElement => {
            const scheduleId = cellElement.getAttribute('data-schedule-id');
            const position = cellElement.getAttribute('data-position');
            updateCellContentLocal(cellElement, '', '');
            addPendingChange(scheduleId, position, '', '');
        });
        
        // Undo 스택에 저장
        addToUndoStack({
            type: 'delete',
            cells: previousStates
        });
    }
}

// 셀 클릭 - 선택
function handleCellClick(event, cellElement) {
    // Ctrl/Cmd 키를 누르고 클릭하면 복수 선택 모드
    if (event.ctrlKey || event.metaKey) {
        const isMultiSelect = true;
        selectCell(cellElement, isMultiSelect);
        return;
    }
    
    // 일반 클릭: 단일 선택
    selectCell(cellElement, false);
}

// 셀 마우스 다운 - 드래그 시작
function handleCellMouseDown(event, cellElement) {
    // 더블클릭 방지를 위해 약간의 지연
    if (event.detail === 2) return; // 더블클릭이면 무시
    
    // Ctrl/Cmd 키를 누르고 있으면 개별 선택 모드
    if (event.ctrlKey || event.metaKey) {
        const isMultiSelect = true;
        selectCell(cellElement, isMultiSelect);
        return;
    }
    
    // 드래그 시작
    isDragging = true;
    dragStartCell = cellElement;
    
    // 이전 선택 모두 해제하고 시작 셀 선택
    selectedCells.forEach(cell => {
        cell.style.outline = '';
    });
    selectedCells = [cellElement];
    cellElement.style.outline = '2px solid #3b82f6';
    
    // 텍스트 선택 방지
    event.preventDefault();
}

// 셀 마우스 엔터 - 드래그 중
function handleCellMouseEnter(event, cellElement) {
    if (!isDragging || !dragStartCell) return;
    
    // 드래그 범위의 모든 셀 선택
    selectCellsInRange(dragStartCell, cellElement);
}

// 셀 마우스 업 - 드래그 종료
function handleCellMouseUp(event, cellElement) {
    isDragging = false;
}

// 범위 내의 모든 셀 선택
function selectCellsInRange(startCell, endCell) {
    // 모든 편집 가능한 셀 가져오기
    const allCells = Array.from(document.querySelectorAll('td.editable'));
    
    const startIndex = allCells.indexOf(startCell);
    const endIndex = allCells.indexOf(endCell);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    // 시작과 끝 인덱스 정렬
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // 이전 선택 모두 해제
    selectedCells.forEach(cell => {
        cell.style.outline = '';
    });
    
    // 범위 내의 셀들 선택
    selectedCells = [];
    
    // 같은 행에 있는 셀들만 선택 (좌우 드래그)
    const startRow = startCell.parentElement;
    const endRow = endCell.parentElement;
    
    if (startRow === endRow) {
        // 같은 행: 좌우 드래그
        const rowCells = Array.from(startRow.querySelectorAll('td.editable'));
        const startColIndex = rowCells.indexOf(startCell);
        const endColIndex = rowCells.indexOf(endCell);
        const minCol = Math.min(startColIndex, endColIndex);
        const maxCol = Math.max(startColIndex, endColIndex);
        
        for (let i = minCol; i <= maxCol; i++) {
            selectedCells.push(rowCells[i]);
            rowCells[i].style.outline = '2px solid #3b82f6';
        }
    } else {
        // 다른 행: 상하 드래그 또는 2D 영역
        const allRows = Array.from(document.querySelectorAll('tr'));
        const startRowIndex = allRows.indexOf(startRow);
        const endRowIndex = allRows.indexOf(endRow);
        
        if (startRowIndex === -1 || endRowIndex === -1) return;
        
        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        
        // 시작 셀과 끝 셀의 열 인덱스 구하기
        const startRowCells = Array.from(startRow.querySelectorAll('td.editable'));
        const endRowCells = Array.from(endRow.querySelectorAll('td.editable'));
        const startColIndex = startRowCells.indexOf(startCell);
        const endColIndex = endRowCells.indexOf(endCell);
        
        // 각 행에서 해당 열 범위의 셀들 선택
        for (let r = minRow; r <= maxRow; r++) {
            const row = allRows[r];
            const rowCells = Array.from(row.querySelectorAll('td.editable'));
            
            if (rowCells.length === 0) continue;
            
            const minCol = Math.min(startColIndex, endColIndex);
            const maxCol = Math.max(startColIndex, endColIndex);
            
            for (let c = minCol; c <= maxCol; c++) {
                if (c >= 0 && c < rowCells.length) {
                    selectedCells.push(rowCells[c]);
                    rowCells[c].style.outline = '2px solid #3b82f6';
                }
            }
        }
    }
}

// 셀 더블클릭 - 직접 수정
function handleCellDoubleClick(event, cellElement) {
    const scheduleId = cellElement.getAttribute('data-schedule-id');
    const position = cellElement.getAttribute('data-position');
    const currentEmployee = cellElement.getAttribute('data-employee');
    const currentTeam = cellElement.getAttribute('data-team');
    
    editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam);
}

// 배치 수정 (직접 입력)
function editAssignment(cellElement, scheduleId, position, currentEmployee, currentTeam) {
    const newEmployee = prompt(`직원 이름을 입력하세요 (현재: ${currentEmployee || '없음'}):`, currentEmployee);
    if (newEmployee === null) return; // 취소

    const newTeam = prompt(`팀을 입력하세요 (A, B, C, D) (현재: ${currentTeam || '없음'}):`, currentTeam);
    if (newTeam === null) return; // 취소

    // Undo를 위해 이전 상태 저장
    addToUndoStack({
        type: 'edit',
        cells: [{
            scheduleId: scheduleId,
            position: position,
            employeeName: currentEmployee,
            team: currentTeam
        }],
        newValue: { employeeName: newEmployee, team: newTeam }
    });

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
        
        // 저장 후 자동으로 스케줄 새로고침하여 집계 업데이트
        await loadSchedules();
    } else {
        alert(`저장 완료: ${successCount}개\n실패: ${failCount}개`);
        // 실패한 항목들만 남김
        pendingChanges = pendingChanges.slice(successCount);
        
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>모두 저장';
        updateSaveButtonState();
    }
}

// 날짜 포맷팅
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// Undo/Redo 기능
function addToUndoStack(action) {
    undoStack.push(action);
    redoStack = []; // 새로운 작업 시 Redo 스택 초기화
    
    // 스택 크기 제한 (최대 50개)
    if (undoStack.length > 50) {
        undoStack.shift();
    }
}

function undo() {
    if (undoStack.length === 0) {
        console.log('되돌릴 작업이 없습니다.');
        return;
    }
    
    const action = undoStack.pop();
    
    // 현재 상태를 Redo 스택에 저장
    const currentStates = action.cells.map(cell => {
        const cellElement = document.querySelector(
            `[data-schedule-id="${cell.scheduleId}"][data-position="${cell.position}"]`
        );
        return {
            scheduleId: cell.scheduleId,
            position: cell.position,
            employeeName: cellElement ? cellElement.getAttribute('data-employee') : '',
            team: cellElement ? cellElement.getAttribute('data-team') : ''
        };
    });
    
    redoStack.push({
        type: action.type,
        cells: currentStates,
        newValue: action.newValue
    });
    
    // 이전 상태로 복원
    action.cells.forEach(cell => {
        const cellElement = document.querySelector(
            `[data-schedule-id="${cell.scheduleId}"][data-position="${cell.position}"]`
        );
        if (cellElement) {
            updateCellContentLocal(cellElement, cell.employeeName, cell.team);
            addPendingChange(cell.scheduleId, cell.position, cell.employeeName, cell.team);
        }
    });
}

function redo() {
    if (redoStack.length === 0) {
        console.log('다시 실행할 작업이 없습니다.');
        return;
    }
    
    const action = redoStack.pop();
    
    // 현재 상태를 Undo 스택에 저장
    const currentStates = action.cells.map(cell => {
        const cellElement = document.querySelector(
            `[data-schedule-id="${cell.scheduleId}"][data-position="${cell.position}"]`
        );
        return {
            scheduleId: cell.scheduleId,
            position: cell.position,
            employeeName: cellElement ? cellElement.getAttribute('data-employee') : '',
            team: cellElement ? cellElement.getAttribute('data-team') : ''
        };
    });
    
    undoStack.push({
        type: action.type,
        cells: currentStates,
        newValue: action.newValue
    });
    
    // 다시 실행
    action.cells.forEach(cell => {
        const cellElement = document.querySelector(
            `[data-schedule-id="${cell.scheduleId}"][data-position="${cell.position}"]`
        );
        if (cellElement) {
            updateCellContentLocal(cellElement, cell.employeeName, cell.team);
            addPendingChange(cell.scheduleId, cell.position, cell.employeeName, cell.team);
        }
    });
}

// 전역 함수로 등록
window.loadSchedules = loadSchedules;
window.handleCellMouseDown = handleCellMouseDown;
window.handleCellMouseEnter = handleCellMouseEnter;
window.handleCellMouseUp = handleCellMouseUp;
window.handleCellDoubleClick = handleCellDoubleClick;
window.saveAllChanges = saveAllChanges;
window.sortTable = sortTable;

// 테이블 정렬 기능
let currentSortColumn = 'name';
let currentSortDirection = 'asc';

function sortTable(column) {
    // 같은 컬럼을 다시 클릭하면 방향 전환
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // 테이블 본문 가져오기
    const tbody = document.getElementById('employeeSummaryBody');
    if (!tbody) return;
    
    // 합계 행 제외하고 데이터 행만 가져오기
    const rows = Array.from(tbody.querySelectorAll('tr:not(.bg-blue-50)'));
    const summaryRow = tbody.querySelector('tr.bg-blue-50');
    
    // 정렬
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch(column) {
            case 'name':
                aValue = a.cells[0].textContent.trim();
                bValue = b.cells[0].textContent.trim();
                return currentSortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
                
            case 'team':
                aValue = a.cells[1].textContent.trim();
                bValue = b.cells[1].textContent.trim();
                return currentSortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
                
            case 'dayCount':
                aValue = parseInt(a.cells[2].textContent);
                bValue = parseInt(b.cells[2].textContent);
                return currentSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
                
            case 'nightCount':
                aValue = parseInt(a.cells[3].textContent);
                bValue = parseInt(b.cells[3].textContent);
                return currentSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
                
            case 'totalDays':
                aValue = parseInt(a.cells[4].textContent);
                bValue = parseInt(b.cells[4].textContent);
                return currentSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
                
            case 'totalHours':
                aValue = parseFloat(a.cells[5].textContent);
                bValue = parseFloat(b.cells[5].textContent);
                return currentSortDirection === 'asc' 
                    ? aValue - bValue
                    : bValue - aValue;
                
            default:
                return 0;
        }
    });
    
    // 테이블 다시 구성
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    if (summaryRow) {
        tbody.appendChild(summaryRow);
    }
    
    // 정렬 아이콘 업데이트
    updateSortIcons(column);
}

function updateSortIcons(sortedColumn) {
    // 모든 헤더의 정렬 아이콘 초기화
    const headers = document.querySelectorAll('#employeeSummaryTable thead th');
    headers.forEach(header => {
        const icon = header.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sort ml-1 text-gray-400';
        }
    });
    
    // 현재 정렬된 컬럼의 아이콘 업데이트
    const columnMap = {
        'name': 0,
        'team': 1,
        'dayCount': 2,
        'nightCount': 3,
        'totalDays': 4,
        'totalHours': 5
    };
    
    const columnIndex = columnMap[sortedColumn];
    if (columnIndex !== undefined) {
        const header = headers[columnIndex];
        const icon = header.querySelector('i');
        if (icon) {
            if (currentSortDirection === 'asc') {
                icon.className = 'fas fa-sort-up ml-1 text-blue-600';
            } else {
                icon.className = 'fas fa-sort-down ml-1 text-blue-600';
            }
        }
    }
}
