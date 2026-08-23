import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listRoles, listPermissions, createRole, updateRole } from '../controllers/roleController.js';
const router=Router();router.use(requireAuth);router.get('/',listRoles);router.get('/permissions',listPermissions);router.post('/',requireRole('SUPERADMIN','ADMIN'),createRole);router.patch('/:id',requireRole('SUPERADMIN','ADMIN'),updateRole);export default router;
