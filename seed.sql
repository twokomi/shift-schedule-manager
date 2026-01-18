-- 샘플 데이터 삽입 (2026년 1월 15일 ~ 2월 1일)

-- Day Shift 데이터
INSERT INTO schedules (date, day_of_week, shift_type) VALUES 
('2026-01-15', 'Thu', 'day'),
('2026-01-16', 'Fri', 'day'),
('2026-01-17', 'Sat', 'day'),
('2026-01-18', 'Sun', 'day'),
('2026-01-19', 'Mon', 'day'),
('2026-01-20', 'Tue', 'day'),
('2026-01-21', 'Wed', 'day'),
('2026-01-22', 'Thu', 'day'),
('2026-01-23', 'Fri', 'day'),
('2026-01-24', 'Sat', 'day'),
('2026-01-25', 'Sun', 'day'),
('2026-01-26', 'Mon', 'day'),
('2026-01-27', 'Tue', 'day'),
('2026-01-28', 'Wed', 'day'),
('2026-01-29', 'Thu', 'day'),
('2026-01-30', 'Fri', 'day'),
('2026-01-31', 'Sat', 'day'),
('2026-02-01', 'Sun', 'day');

-- Night Shift 데이터
INSERT INTO schedules (date, day_of_week, shift_type) VALUES 
('2026-01-15', 'Thu', 'night'),
('2026-01-16', 'Fri', 'night'),
('2026-01-17', 'Sat', 'night'),
('2026-01-18', 'Sun', 'night'),
('2026-01-19', 'Mon', 'night'),
('2026-01-20', 'Tue', 'night'),
('2026-01-21', 'Wed', 'night'),
('2026-01-22', 'Thu', 'night'),
('2026-01-23', 'Fri', 'night'),
('2026-01-24', 'Sat', 'night'),
('2026-01-25', 'Sun', 'night'),
('2026-01-26', 'Mon', 'night'),
('2026-01-27', 'Tue', 'night'),
('2026-01-28', 'Wed', 'night'),
('2026-01-29', 'Thu', 'night'),
('2026-01-30', 'Fri', 'night'),
('2026-01-31', 'Sat', 'night'),
('2026-02-01', 'Sun', 'night');

-- Day Shift 배치 (2026-01-15)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(1, 'Backend', 'Kwon', 'B'),
(1, 'Front#BT1', 'Khan', 'B'),
(1, 'Front#BT2', 'Chris', 'B'),
(1, 'Front#WT', 'Cliff', 'B'),
(1, 'Front#IM', 'Junki', 'B');

-- Day Shift 배치 (2026-01-16)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(2, 'Backend', 'Kwon', 'B'),
(2, 'Front#BT1', 'Khan', 'B'),
(2, 'Front#BT2', 'Chris', 'B'),
(2, 'Front#WT', 'Cliff', 'B'),
(2, 'Front#IM', 'Junki', 'B');

-- Day Shift 배치 (2026-01-17)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(3, 'Backend', 'Junki', 'A'),
(3, 'Front#BT1', 'Zach', 'A'),
(3, 'Front#BT2', '', 'A'),
(3, 'Front#WT', 'Cliff', 'A'),
(3, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-01-18)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(4, 'Backend', 'Junki', 'A'),
(4, 'Front#BT1', 'Zach', 'A'),
(4, 'Front#BT2', 'Jerry', 'A'),
(4, 'Front#WT', 'Cliff', 'A'),
(4, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-01-19)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(5, 'Backend', 'Junki', 'A'),
(5, 'Front#BT1', 'Chris', 'A'),
(5, 'Front#BT2', 'Jerry', 'A'),
(5, 'Front#WT', 'Zach', 'A'),
(5, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-01-20)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(6, 'Backend', 'Melody/Khan', 'B'),
(6, 'Front#BT1', 'Chris', 'B'),
(6, 'Front#BT2', 'Jerry', 'B'),
(6, 'Front#WT', 'Cliff', 'B'),
(6, 'Front#IM', 'Zach', 'B');

-- Day Shift 배치 (2026-01-21)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(7, 'Backend', 'Melody/Khan', 'B'),
(7, 'Front#BT1', 'Chris', 'B'),
(7, 'Front#BT2', 'Jerry', 'B'),
(7, 'Front#WT', 'Cliff', 'B'),
(7, 'Front#IM', 'Zach', 'B');

-- Day Shift 배치 (2026-01-22)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(8, 'Backend', 'Junki', 'A'),
(8, 'Front#BT1', 'Chris', 'A'),
(8, 'Front#BT2', 'Zach', 'A'),
(8, 'Front#WT', 'Cliff', 'A'),
(8, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-01-23)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(9, 'Backend', 'Junki', 'A'),
(9, 'Front#BT1', 'Chris', 'A'),
(9, 'Front#BT2', 'Zach', 'A'),
(9, 'Front#WT', 'Cliff', 'A'),
(9, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-01-24)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(10, 'Backend', 'Melody', 'B'),
(10, 'Front#BT1', 'Khan', 'B'),
(10, 'Front#BT2', '', 'B'),
(10, 'Front#WT', 'Cliff', 'B'),
(10, 'Front#IM', '', 'B');

-- Day Shift 배치 (2026-01-25)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(11, 'Backend', 'Melody', 'B'),
(11, 'Front#BT1', 'Khan', 'B'),
(11, 'Front#BT2', 'Jerry', 'B'),
(11, 'Front#WT', 'Cliff', 'B'),
(11, 'Front#IM', '', 'B');

-- Day Shift 배치 (2026-01-26)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(12, 'Backend', 'Melody', 'B'),
(12, 'Front#BT1', 'Khan', 'B'),
(12, 'Front#BT2', 'Chris', 'B'),
(12, 'Front#WT', 'Jerry', 'B'),
(12, 'Front#IM', 'Zach', 'B');

-- Day Shift 배치 (2026-01-27)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(13, 'Backend', 'Junki', 'A'),
(13, 'Front#BT1', 'Chris', 'A'),
(13, 'Front#BT2', 'Jerry', 'A'),
(13, 'Front#WT', 'Cliff', 'A'),
(13, 'Front#IM', 'Zach', 'A');

-- Day Shift 배치 (2026-01-28)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(14, 'Backend', 'Junki', 'A'),
(14, 'Front#BT1', 'Chris', 'A'),
(14, 'Front#BT2', 'Jerry', 'A'),
(14, 'Front#WT', 'Cliff', 'A'),
(14, 'Front#IM', 'Zach', 'A');

-- Day Shift 배치 (2026-01-29)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(15, 'Backend', 'Melody', 'B'),
(15, 'Front#BT1', 'Khan', 'B'),
(15, 'Front#BT2', 'Chris', 'B'),
(15, 'Front#WT', 'Cliff', 'B'),
(15, 'Front#IM', 'Zach', 'B');

-- Day Shift 배치 (2026-01-30)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(16, 'Backend', 'Melody', 'B'),
(16, 'Front#BT1', 'Khan', 'B'),
(16, 'Front#BT2', 'Chris', 'B'),
(16, 'Front#WT', 'Cliff', 'B'),
(16, 'Front#IM', '', 'B');

-- Day Shift 배치 (2026-01-31)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(17, 'Backend', 'Junki', 'A'),
(17, 'Front#BT1', '', 'A'),
(17, 'Front#BT2', '', 'A'),
(17, 'Front#WT', 'Cliff', 'A'),
(17, 'Front#IM', '', 'A');

-- Day Shift 배치 (2026-02-01)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(18, 'Backend', 'Junki', 'A'),
(18, 'Front#BT1', '', 'A'),
(18, 'Front#BT2', 'Jerry', 'A'),
(18, 'Front#WT', 'Cliff', 'A'),
(18, 'Front#IM', '', 'A');

-- Night Shift 배치 (2026-01-15)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(19, 'Backend', 'Bumsoo', 'D'),
(19, 'Front#BT', 'Damian', 'D'),
(19, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-16)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(20, 'Backend', 'Bumsoo', 'C'),
(20, 'Front#BT', 'Damian', 'C'),
(20, 'Front#WT', '', 'C');

-- Night Shift 배치 (2026-01-17)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(21, 'Backend', 'Khan', 'C'),
(21, 'Front#BT', 'Damian', 'C'),
(21, 'Front#WT', '', 'C');

-- Night Shift 배치 (2026-01-18)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(22, 'Backend', 'Bumsoo', 'C'),
(22, 'Front#BT', 'Don', 'C'),
(22, 'Front#WT', '', 'C');

-- Night Shift 배치 (2026-01-19)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(23, 'Backend', 'Joonbae', 'D'),
(23, 'Front#BT', 'Damian', 'D'),
(23, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-20)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(24, 'Backend', 'Joonbae', 'D'),
(24, 'Front#BT', 'Damian', 'D'),
(24, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-21)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(25, 'Backend', 'Bumsoo', 'C'),
(25, 'Front#BT', 'Damian', 'C'),
(25, 'Front#WT', 'Don', 'C');

-- Night Shift 배치 (2026-01-22)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(26, 'Backend', 'Bumsoo', 'C'),
(26, 'Front#BT', 'Damian', 'C'),
(26, 'Front#WT', 'Don', 'C');

-- Night Shift 배치 (2026-01-23)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(27, 'Backend', 'Joonbae', 'D'),
(27, 'Front#BT', '', 'D'),
(27, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-24)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(28, 'Backend', 'Joonbae', 'D'),
(28, 'Front#BT', '', 'D'),
(28, 'Front#WT', 'Damian', 'D');

-- Night Shift 배치 (2026-01-25)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(29, 'Backend', 'Joonbae', 'D'),
(29, 'Front#BT', '', 'D'),
(29, 'Front#WT', 'Damian', 'D');

-- Night Shift 배치 (2026-01-26)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(30, 'Backend', 'Bumsoo', 'C'),
(30, 'Front#BT', 'Damian', 'C'),
(30, 'Front#WT', 'Don', 'C');

-- Night Shift 배치 (2026-01-27)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(31, 'Backend', 'Bumsoo', 'C'),
(31, 'Front#BT', 'Damian', 'C'),
(31, 'Front#WT', 'Don', 'C');

-- Night Shift 배치 (2026-01-28)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(32, 'Backend', 'Joonbae', 'D'),
(32, 'Front#BT', 'Damian', 'D'),
(32, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-29)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(33, 'Backend', 'Joonbae', 'D'),
(33, 'Front#BT', '', 'D'),
(33, 'Front#WT', 'Don', 'D');

-- Night Shift 배치 (2026-01-30)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(34, 'Backend', 'Bumsoo', 'C'),
(34, 'Front#BT', '', 'C'),
(34, 'Front#WT', 'Don', 'C');

-- Night Shift 배치 (2026-01-31)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(35, 'Backend', 'Bumsoo', 'C'),
(35, 'Front#BT', 'Damian', 'C'),
(35, 'Front#WT', '', 'C');

-- Night Shift 배치 (2026-02-01)
INSERT INTO assignments (schedule_id, position, employee_name, team) VALUES 
(36, 'Backend', 'Bumsoo', 'C'),
(36, 'Front#BT', 'Damian', 'C'),
(36, 'Front#WT', '', 'C');
