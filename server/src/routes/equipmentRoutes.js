import express from 'express';
import { listEquipment,createEquipment,updateEquipment,listMaintenance,createMaintenance,listFuel,createFuel,listAssignments,createAssignment } from '../controllers/equipmentController.js';
const router=express.Router();
router.get('/',listEquipment); router.post('/',createEquipment); router.patch('/:id',updateEquipment);
router.get('/maintenance',listMaintenance); router.post('/maintenance',createMaintenance);
router.get('/fuel',listFuel); router.post('/fuel',createFuel);
router.get('/assignments',listAssignments); router.post('/assignments',createAssignment);
export default router;
