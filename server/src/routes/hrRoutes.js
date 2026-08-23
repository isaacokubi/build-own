import {Router} from 'express';
import {requireAuth,requireRole} from '../middleware/auth.js';
import {listEmployees,createEmployee,listAttendance,recordAttendance,listLeaves,createLeave,approveLeave,listTimesheets,createTimesheet} from '../controllers/hrController.js';
const r=Router();r.use(requireAuth);const managers=['SUPERADMIN','ADMIN','DIRECTOR','HR_MANAGER'];const supervisors=[...managers,'PROJECT_MANAGER','SITE_MANAGER'];
r.get('/employees',listEmployees);r.post('/employees',requireRole(...managers),createEmployee);
r.get('/attendance',listAttendance);r.post('/attendance',requireRole(...supervisors),recordAttendance);
r.get('/leave',listLeaves);r.post('/leave',createLeave);r.patch('/leave/:id/approval',requireRole(...managers),approveLeave);
r.get('/timesheets',listTimesheets);r.post('/timesheets',createTimesheet);
export default r;
