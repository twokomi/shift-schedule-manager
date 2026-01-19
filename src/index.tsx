import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes

// 특정 날짜 범위의 근무표 조회 (없으면 자동 생성)
app.get('/api/schedules', async (c) => {
  const { env } = c;
  const startDate = c.req.query('start_date') || '2026-01-15';
  const endDate = c.req.query('end_date') || '2026-02-01';

  try {
    // 날짜 범위의 모든 날짜 생성
    const dates = [];
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = dayNames[d.getDay()];
      dates.push({ date: dateStr, day_of_week: dayOfWeek });
    }

    // 각 날짜에 대해 day/night shift 확인 및 생성
    const dayPositions = ['Backend', 'Front#BT1', 'Front#BT2', 'Front#WT', 'Front#IM'];
    const nightPositions = ['Backend', 'Front#BT', 'Front#WT'];

    for (const { date, day_of_week } of dates) {
      for (const shiftType of ['day', 'night']) {
        // 해당 날짜/shift가 있는지 확인
        const existing = await env.DB.prepare(`
          SELECT id FROM schedules WHERE date = ? AND shift_type = ?
        `).bind(date, shiftType).first();

        if (!existing) {
          // 스케줄 생성
          const scheduleResult = await env.DB.prepare(`
            INSERT INTO schedules (date, day_of_week, shift_type)
            VALUES (?, ?, ?)
          `).bind(date, day_of_week, shiftType).run();

          const scheduleId = scheduleResult.meta.last_row_id;

          // 포지션별 빈 배치 생성
          const positions = shiftType === 'day' ? dayPositions : nightPositions;
          for (const position of positions) {
            await env.DB.prepare(`
              INSERT INTO assignments (schedule_id, position, employee_name, team)
              VALUES (?, ?, '', '')
            `).bind(scheduleId, position).run();
          }
        }
      }
    }

    // 생성 후 다시 조회
    const schedules = await env.DB.prepare(`
      SELECT 
        s.id,
        s.date,
        s.day_of_week,
        s.shift_type,
        json_group_array(
          json_object(
            'position', a.position,
            'employee_name', a.employee_name,
            'team', a.team
          )
        ) as assignments
      FROM schedules s
      LEFT JOIN assignments a ON s.id = a.schedule_id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY s.id, s.date, s.day_of_week, s.shift_type
      ORDER BY s.date, s.shift_type
    `).bind(startDate, endDate).all();

    const result = schedules.results.map((schedule: any) => ({
      ...schedule,
      assignments: JSON.parse(schedule.assignments)
    }));

    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 특정 날짜와 교대의 근무표 조회
app.get('/api/schedules/:date/:shift', async (c) => {
  const { env } = c;
  const date = c.req.param('date');
  const shift = c.req.param('shift');

  try {
    const schedule = await env.DB.prepare(`
      SELECT 
        s.id,
        s.date,
        s.day_of_week,
        s.shift_type,
        json_group_array(
          json_object(
            'position', a.position,
            'employee_name', a.employee_name,
            'team', a.team
          )
        ) as assignments
      FROM schedules s
      LEFT JOIN assignments a ON s.id = a.schedule_id
      WHERE s.date = ? AND s.shift_type = ?
      GROUP BY s.id
    `).bind(date, shift).first();

    if (!schedule) {
      return c.json({ success: false, error: 'Schedule not found' }, 404);
    }

    const result = {
      ...schedule,
      assignments: JSON.parse((schedule as any).assignments)
    };

    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 근무 배치 업데이트
app.put('/api/assignments/:scheduleId/:position', async (c) => {
  const { env } = c;
  const scheduleId = c.req.param('scheduleId');
  const position = c.req.param('position');
  const { employee_name, team } = await c.req.json();

  try {
    await env.DB.prepare(`
      UPDATE assignments
      SET employee_name = ?, team = ?, updated_at = CURRENT_TIMESTAMP
      WHERE schedule_id = ? AND position = ?
    `).bind(employee_name || '', team || '', scheduleId, position).run();

    return c.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 새 근무 일정 생성
app.post('/api/schedules', async (c) => {
  const { env } = c;
  const { date, day_of_week, shift_type, assignments } = await c.req.json();

  try {
    // 스케줄 생성
    const scheduleResult = await env.DB.prepare(`
      INSERT INTO schedules (date, day_of_week, shift_type)
      VALUES (?, ?, ?)
    `).bind(date, day_of_week, shift_type).run();

    const scheduleId = scheduleResult.meta.last_row_id;

    // 배치 정보 생성
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        await env.DB.prepare(`
          INSERT INTO assignments (schedule_id, position, employee_name, team)
          VALUES (?, ?, ?, ?)
        `).bind(scheduleId, assignment.position, assignment.employee_name || '', assignment.team || '').run();
      }
    }

    return c.json({ success: true, message: 'Schedule created successfully', scheduleId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 근무 일정 삭제
app.delete('/api/schedules/:scheduleId', async (c) => {
  const { env } = c;
  const scheduleId = c.req.param('scheduleId');

  try {
    await env.DB.prepare(`
      DELETE FROM schedules WHERE id = ?
    `).bind(scheduleId).run();

    return c.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 직원 목록 조회
app.get('/api/employees', async (c) => {
  const { env } = c;

  try {
    const employees = await env.DB.prepare(`
      SELECT DISTINCT employee_name
      FROM assignments
      WHERE employee_name != ''
      ORDER BY employee_name
    `).all();

    return c.json({ success: true, data: employees.results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 비밀번호 검증 API
app.post('/api/auth/verify', async (c) => {
  const { password } = await c.req.json();
  const ADMIN_PASSWORD = 'admin1234'; // 실제로는 환경변수로 관리해야 함
  
  if (password === ADMIN_PASSWORD) {
    return c.json({ success: true, message: 'Authentication successful' });
  } else {
    return c.json({ success: false, message: 'Invalid password' }, 401);
  }
});

// Default route - 메인 페이지 (뷰 모드/편집 모드 자동 전환)
app.get('/', (c) => {
  const mode = c.req.query('mode') || 'view';
  
  if (mode === 'edit') {
    return renderEditMode(c);
  } else {
    return renderViewMode(c);
  }
});

// 뷰 모드 렌더링 (모바일 최적화)
function renderViewMode(c: any) {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>근무표 조회</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .team-badge-A { background-color: #3b82f6; color: white; }
            .team-badge-B { background-color: #10b981; color: white; }
            .team-badge-C { background-color: #f59e0b; color: white; }
            .team-badge-D { background-color: #ef4444; color: white; }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-4 max-w-2xl">
            <!-- 헤더 -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 mb-4 text-white">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            Schedule View
                        </h1>
                        <p class="text-sm text-blue-100 mt-1">Day/Night Shift Schedule</p>
                    </div>
                    <button onclick="promptEditMode()" class="bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                        <i class="fas fa-edit mr-1"></i>
                        Edit
                    </button>
                </div>
            </div>

            <!-- 조회 옵션 -->
            <div class="bg-white rounded-lg shadow p-4 mb-4">
                <!-- 뷰 타입 선택 -->
                <div class="flex gap-2 mb-4">
                    <button onclick="switchView('all')" id="viewAll" 
                            class="flex-1 py-2 px-3 rounded-lg font-semibold bg-blue-500 text-white transition">
                        <i class="fas fa-calendar-day mr-1"></i>
                        Daily
                    </button>
                    <button onclick="switchView('employee')" id="viewEmployee"
                            class="flex-1 py-2 px-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                        <i class="fas fa-calendar mr-1"></i>
                        Monthly
                    </button>
                </div>

                <!-- 직원 검색 (직원별 뷰에서만 표시) -->
                <div id="employeeFilter" class="hidden mb-4">
                    <label class="block text-xs font-medium text-gray-700 mb-2">
                        <i class="fas fa-search mr-1"></i>
                        Search Employees (Multiple Selection)
                    </label>
                    <div id="employeeCheckboxes" class="space-y-2 mb-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        <!-- JavaScript로 동적 생성 -->
                    </div>
                    <div class="text-xs text-gray-500 mb-3">
                        <i class="fas fa-info-circle mr-1"></i>
                        Selected: <span id="selectedCount" class="font-semibold">0</span>
                    </div>
                    
                    <!-- 월 선택 (직원별 뷰 전용) -->
                    <div class="mb-3">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Select Month</label>
                        <select id="monthSelect" 
                                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="2026-01">January 2026</option>
                            <option value="2026-02">February 2026</option>
                            <option value="2026-03">March 2026</option>
                            <option value="2026-04">April 2026</option>
                            <option value="2026-05">May 2026</option>
                            <option value="2026-06">June 2026</option>
                            <option value="2026-07">July 2026</option>
                            <option value="2026-08">August 2026</option>
                            <option value="2026-09">September 2026</option>
                            <option value="2026-10">October 2026</option>
                            <option value="2026-11">November 2026</option>
                            <option value="2026-12">December 2026</option>
                        </select>
                    </div>
                </div>

                <!-- 기간 선택 (전체 뷰에서만 표시) -->
                <div id="dateRangeFilter">
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                            <input type="date" id="startDate" value="" 
                                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                            <input type="date" id="endDate" value="" 
                                   class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                </div>
                
                <button onclick="loadSchedules()" 
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    <i class="fas fa-search mr-2"></i>
                    Search
                </button>
            </div>

            <!-- 팀 범례 -->
            <div class="bg-white rounded-lg shadow p-3 mb-4">
                <div class="flex gap-2 justify-center flex-wrap">
                    <span class="team-badge-A px-3 py-1 rounded-full text-xs">Team A</span>
                    <span class="team-badge-B px-3 py-1 rounded-full text-xs">Team B</span>
                    <span class="team-badge-C px-3 py-1 rounded-full text-xs">Team C</span>
                    <span class="team-badge-D px-3 py-1 rounded-full text-xs">Team D</span>
                </div>
            </div>

            <!-- 근무표 컨테이너 -->
            <div id="scheduleContainer">
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>Loading schedules...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/view.js"></script>
        <script>
            // Set today's date as default for Daily view
            document.addEventListener('DOMContentLoaded', () => {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('startDate').value = today;
                document.getElementById('endDate').value = today;
            });
            
            function promptEditMode() {
                const password = prompt('Enter edit mode password:');
                if (password) {
                    axios.post('/api/auth/verify', { password })
                        .then(response => {
                            if (response.data.success) {
                                window.location.href = '/?mode=edit';
                            } else {
                                alert('Incorrect password.');
                            }
                        })
                        .catch(error => {
                            alert('Authentication failed.');
                        });
                }
            }
        </script>
    </body>
    </html>
  `);
}

// 편집 모드 렌더링 (데스크톱 최적화)
function renderEditMode(c: any) {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>근무표 관리 시스템</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .team-badge-A { background-color: #3b82f6; color: white; }
            .team-badge-B { background-color: #10b981; color: white; }
            .team-badge-C { background-color: #f59e0b; color: white; }
            .team-badge-D { background-color: #ef4444; color: white; }
            .shift-day { background-color: #fef3c7; }
            .shift-night { background-color: #dbeafe; }
            .calendar-cell {
                min-height: 200px;
                border: 1px solid #e5e7eb;
            }
            .position-row {
                padding: 4px 8px;
                margin: 2px 0;
                border-radius: 4px;
                font-size: 0.875rem;
            }
            .editable:hover {
                background-color: #f3f4f6;
                cursor: pointer;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            근무표 관리 시스템
                            <span class="ml-3 text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full">편집 모드</span>
                        </h1>
                        <p class="text-gray-600">Day/Night 교대 근무 일정 관리</p>
                    </div>
                    <button onclick="window.location.href='/'" 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                        <i class="fas fa-eye mr-2"></i>
                        뷰 모드로
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-filter mr-2"></i>
                        기간 선택
                    </h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                        <input type="date" id="startDate" value="2026-01-15" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                        <input type="date" id="endDate" value="2026-02-01" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex items-end">
                        <button onclick="loadSchedules()" 
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                            <i class="fas fa-search mr-2"></i>
                            조회
                        </button>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-table mr-2"></i>
                        근무표
                    </h2>
                    <div class="flex gap-2">
                        <span class="team-badge-A px-3 py-1 rounded-full text-sm">Team A</span>
                        <span class="team-badge-B px-3 py-1 rounded-full text-sm">Team B</span>
                        <span class="team-badge-C px-3 py-1 rounded-full text-sm">Team C</span>
                        <span class="team-badge-D px-3 py-1 rounded-full text-sm">Team D</span>
                    </div>
                </div>
                <div id="scheduleContainer" class="overflow-x-auto">
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                        <p>근무표를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `);
}

export default app
