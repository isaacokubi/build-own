import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { requireTenant } from '../middleware/tenant.js';
import { listProjects,createProject,getProject,updateProject,deleteProject } from '../controllers/projectController.js';
const router=Router();
router.use(authenticate,requireTenant);
router.get('/',authorize('SUPERADMIN','ADMIN','DIRECTOR','PROJECT_MANAGER','SITE_MANAGER','ENGINEER','ARCHITECT','FOREMAN','ACCOUNTANT'),listProjects);
router.post('/',authorize('SUPERADMIN','ADMIN','DIRECTOR','PROJECT_MANAGER'),createProject);
router.get('/:id',listProjectsById);
router.patch('/:id',authorize('SUPERADMIN','ADMIN','DIRECTOR','PROJECT_MANAGER'),updateProject);
router.delete('/:id',authorize('SUPERADMIN','ADMIN','DIRECTOR'),deleteProject);
async function listProjectsById(req,res,next){return getProject(req,res,next)}
export default router;
