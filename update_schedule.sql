-- Update schedule data based on the latest table (2026-01-15 to 2026-02-01)

-- 1/15 (Thu) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Kwon', team = 'B' WHERE schedule_id = 1 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 1 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 1 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 1 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Junki', team = 'B' WHERE schedule_id = 1 AND position = 'Front#IM';

-- 1/15 (Thu) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'D' WHERE schedule_id = 19 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 19 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 19 AND position = 'Front#WT';

-- 1/16 (Fri) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Kwon', team = 'B' WHERE schedule_id = 2 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 2 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 2 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 2 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Junki', team = 'B' WHERE schedule_id = 2 AND position = 'Front#IM';

-- 1/16 (Fri) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 20 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 20 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 20 AND position = 'Front#WT';

-- 1/17 (Sat) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 3 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 3 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 3 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 3 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 3 AND position = 'Front#IM';

-- 1/17 (Sat) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Khan', team = 'C' WHERE schedule_id = 21 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 21 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 21 AND position = 'Front#WT';

-- 1/18 (Sun) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 4 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 4 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'A' WHERE schedule_id = 4 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 4 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 4 AND position = 'Front#IM';

-- 1/18 (Sun) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 22 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 22 AND position = 'Front#BT';
UPDATE assignments SET employee_name = '', team = 'C' WHERE schedule_id = 22 AND position = 'Front#WT';

-- 1/19 (Mon) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 5 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'A' WHERE schedule_id = 5 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'A' WHERE schedule_id = 5 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 5 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 5 AND position = 'Front#IM';

-- 1/19 (Mon) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 23 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 23 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 23 AND position = 'Front#WT';

-- 1/20 (Tue) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 6 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 6 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'B' WHERE schedule_id = 6 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 6 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'B' WHERE schedule_id = 6 AND position = 'Front#IM';

-- 1/20 (Tue) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 24 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 24 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 24 AND position = 'Front#WT';

-- 1/21 (Wed) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 7 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 7 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'B' WHERE schedule_id = 7 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 7 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'B' WHERE schedule_id = 7 AND position = 'Front#IM';

-- 1/21 (Wed) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 25 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 25 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 25 AND position = 'Front#WT';

-- 1/22 (Thu) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 8 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'A' WHERE schedule_id = 8 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 8 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 8 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 8 AND position = 'Front#IM';

-- 1/22 (Thu) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 26 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 26 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 26 AND position = 'Front#WT';

-- 1/23 (Fri) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 9 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'A' WHERE schedule_id = 9 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 9 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 9 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 9 AND position = 'Front#IM';

-- 1/23 (Fri) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 27 AND position = 'Backend';
UPDATE assignments SET employee_name = '', team = 'D' WHERE schedule_id = 27 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 27 AND position = 'Front#WT';

-- 1/24 (Sat) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 10 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 10 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 10 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 10 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 10 AND position = 'Front#IM';

-- 1/24 (Sat) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 28 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 28 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 28 AND position = 'Front#WT';

-- 1/25 (Sun) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 11 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 11 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'B' WHERE schedule_id = 11 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 11 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 11 AND position = 'Front#IM';

-- 1/25 (Sun) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 29 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 29 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 29 AND position = 'Front#WT';

-- 1/26 (Mon) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 12 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 12 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 12 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Jerry', team = 'B' WHERE schedule_id = 12 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'B' WHERE schedule_id = 12 AND position = 'Front#IM';

-- 1/26 (Mon) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 30 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 30 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 30 AND position = 'Front#WT';

-- 1/27 (Tue) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 13 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'A' WHERE schedule_id = 13 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'A' WHERE schedule_id = 13 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 13 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 13 AND position = 'Front#IM';

-- 1/27 (Tue) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 31 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 31 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 31 AND position = 'Front#WT';

-- 1/28 (Wed) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 14 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Chris', team = 'A' WHERE schedule_id = 14 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'A' WHERE schedule_id = 14 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 14 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'A' WHERE schedule_id = 14 AND position = 'Front#IM';

-- 1/28 (Wed) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 32 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'D' WHERE schedule_id = 32 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 32 AND position = 'Front#WT';

-- 1/29 (Thu) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 15 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 15 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 15 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 15 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'B' WHERE schedule_id = 15 AND position = 'Front#IM';

-- 1/29 (Thu) - Team D - Night Shift
UPDATE assignments SET employee_name = 'Joonbae', team = 'D' WHERE schedule_id = 33 AND position = 'Backend';
UPDATE assignments SET employee_name = '', team = 'D' WHERE schedule_id = 33 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'D' WHERE schedule_id = 33 AND position = 'Front#WT';

-- 1/30 (Fri) - Team B - Day Shift
UPDATE assignments SET employee_name = 'Melody', team = 'B' WHERE schedule_id = 16 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Khan', team = 'B' WHERE schedule_id = 16 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Chris', team = 'B' WHERE schedule_id = 16 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'B' WHERE schedule_id = 16 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Zach', team = 'B' WHERE schedule_id = 16 AND position = 'Front#IM';

-- 1/30 (Fri) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 34 AND position = 'Backend';
UPDATE assignments SET employee_name = '', team = 'C' WHERE schedule_id = 34 AND position = 'Front#BT';
UPDATE assignments SET employee_name = 'Don', team = 'C' WHERE schedule_id = 34 AND position = 'Front#WT';

-- 1/31 (Sat) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 17 AND position = 'Backend';
UPDATE assignments SET employee_name = '', team = 'A' WHERE schedule_id = 17 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = '', team = 'A' WHERE schedule_id = 17 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 17 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 17 AND position = 'Front#IM';

-- 1/31 (Sat) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 35 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 35 AND position = 'Front#BT';
UPDATE assignments SET employee_name = '', team = 'C' WHERE schedule_id = 35 AND position = 'Front#WT';

-- 2/1 (Sun) - Team A - Day Shift
UPDATE assignments SET employee_name = 'Junki', team = 'A' WHERE schedule_id = 18 AND position = 'Backend';
UPDATE assignments SET employee_name = '', team = 'A' WHERE schedule_id = 18 AND position = 'Front#BT1';
UPDATE assignments SET employee_name = 'Jerry', team = 'A' WHERE schedule_id = 18 AND position = 'Front#BT2';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 18 AND position = 'Front#WT';
UPDATE assignments SET employee_name = 'Cliff', team = 'A' WHERE schedule_id = 18 AND position = 'Front#IM';

-- 2/1 (Sun) - Team C - Night Shift
UPDATE assignments SET employee_name = 'Bumsoo', team = 'C' WHERE schedule_id = 36 AND position = 'Backend';
UPDATE assignments SET employee_name = 'Damian', team = 'C' WHERE schedule_id = 36 AND position = 'Front#BT';
UPDATE assignments SET employee_name = '', team = 'C' WHERE schedule_id = 36 AND position = 'Front#WT';
