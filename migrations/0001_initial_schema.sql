-- 근무표 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  shift_type TEXT NOT NULL, -- 'day' or 'night'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, shift_type)
);

-- 근무 배치 테이블
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL,
  position TEXT NOT NULL, -- 'Backend', 'Front#BT1', 'Front#BT2', 'Front#WT', 'Front#IM' (Day), 'Backend', 'Front#BT', 'Front#WT' (Night)
  employee_name TEXT,
  team TEXT, -- 'A', 'B', 'C', 'D' (팀 구분)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE(schedule_id, position)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_assignments_schedule_id ON assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_name);
