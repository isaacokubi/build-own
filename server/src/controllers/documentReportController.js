import mongoose from 'mongoose';
import { Document, Report } from '../models/Document.js';
import Project from '../models/Project.js';
import { Expense, PurchaseOrder, Material } from '../models/FinanceProcurement.js';
import { Employee } from '../models/HR.js';

const tid = (req) => req.user?.tenantId;

const guard = (req, res) => {
  if (!tid(req)) {
    res.status(403).json({ success: false, message: 'Tenant context required', code: 'TENANT_REQUIRED' });
    return false;
  }
  return true;
};

const scoped = (req, extra = {}) => ({ tenantId: tid(req), ...extra });

export const documents = async (req, res, next) => {
  try {
    if (!guard(req, res)) return;
    res.json({ success: true, data: await Document.find(scoped(req)).sort({ createdAt: -1 }).lean() });
  } catch (error) { next(error); }
};

export const createDocument = async (req, res, next) => {
  try {
    if (!guard(req, res)) return;
    const body = req.body || {};
    if (!body.name || !body.url) return res.status(400).json({ success: false, message: 'Document name and URL are required', code: 'VALIDATION_ERROR' });
    res.status(201).json({ success: true, data: await Document.create({ ...body, tenantId: tid(req), uploadedBy: req.user.id }) });
  } catch (error) { next(error); }
};

export const reports = async (req, res, next) => {
  try {
    if (!guard(req, res)) return;
    res.json({ success: true, data: await Report.find(scoped(req)).sort({ createdAt: -1 }).lean() });
  } catch (error) { next(error); }
};

export const createReport = async (req, res, next) => {
  try {
    if (!guard(req, res)) return;
    const body = req.body || {};
    if (!body.type) return res.status(400).json({ success: false, message: 'Report type is required', code: 'VALIDATION_ERROR' });
    res.status(201).json({ success: true, data: await Report.create({ ...body, tenantId: tid(req), generatedBy: req.user.id }) });
  } catch (error) { next(error); }
};

export const analyticsSummary = async (req, res, next) => {
  try {
    if (!guard(req, res)) return;

    const tenantId = tid(req);
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const [projectStats, projectStatuses, expensesByCurrency, purchaseOrders, lowStockMaterials, activeEmployees, documentCount, reportCount] = await Promise.all([
      Project.aggregate([
        { $match: { tenantId: tenantObjectId, isDeleted: { $ne: true } } },
        { $group: { _id: null, count: { $sum: 1 }, averageProgress: { $avg: '$progress' }, contractValue: { $sum: '$contractValue' }, budget: { $sum: '$budget' } } },
      ]),
      Project.aggregate([
        { $match: { tenantId: tenantObjectId, isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: { tenantId: tenantObjectId } },
        { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1, _id: 1 } },
      ]),
      PurchaseOrder.aggregate([
        { $match: { tenantId: tenantObjectId, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, committedValue: { $sum: '$totalAmount' }, pendingApproval: { $sum: { $cond: [{ $eq: ['$status', 'Pending Approval'] }, 1, 0] } } } },
      ]),
      Material.countDocuments({ tenantId: tenantObjectId, $expr: { $lt: ['$stock', '$minimumStock'] } }),
      Employee.countDocuments({ tenantId: tenantObjectId, status: 'Active' }),
      Document.countDocuments({ tenantId }),
      Report.countDocuments({ tenantId }),
    ]);

    const projects = projectStats[0] || { count: 0, averageProgress: 0, contractValue: 0, budget: 0 };
    const procurement = purchaseOrders[0] || { count: 0, committedValue: 0, pendingApproval: 0 };

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        projects: {
          count: projects.count,
          averageProgress: Math.round((projects.averageProgress || 0) * 10) / 10,
          contractValue: projects.contractValue || 0,
          budget: projects.budget || 0,
          variance: (projects.budget || 0) - (projects.contractValue || 0),
          statuses: projectStatuses.map((item) => ({ status: item._id || 'Unknown', count: item.count })),
        },
        finance: { expensesByCurrency: expensesByCurrency.map((item) => ({ currency: item._id || 'N/A', total: item.total || 0, count: item.count })) },
        procurement: { purchaseOrders: procurement.count || 0, committedValue: procurement.committedValue || 0, pendingApproval: procurement.pendingApproval || 0 },
        workforce: { activeEmployees },
        inventory: { lowStockMaterials },
        records: { documents: documentCount, reports: reportCount },
      },
    });
  } catch (error) { next(error); }
};
