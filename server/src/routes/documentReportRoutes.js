import express from 'express';
import {
  documents,
  createDocument,
  reports,
  createReport,
  analyticsSummary,
} from '../controllers/documentReportController.js';

const r = express.Router();

r.get('/documents', documents);
r.post('/documents', createDocument);
r.get('/reports', reports);
r.post('/reports', createReport);
r.get('/analytics', analyticsSummary);

export default r;
