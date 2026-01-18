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

// 특정 날짜 범위의 근무표 조회
app.get('/api/schedules', async (c) => {
  const { env } = c;
  const startDate = c.req.query('start_date') || '2026-01-15';
  const endDate = c.req.query('end_date') || '2026-02-01';

  try {
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

// Default route - 메인 페이지
app.get('/', (c) => {
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
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-calendar-alt mr-2"></i>
                    근무표 관리 시스템
                </h1>
                <p class="text-gray-600">Day/Night 교대 근무 일정 관리</p>
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
  `)
})

export default app
