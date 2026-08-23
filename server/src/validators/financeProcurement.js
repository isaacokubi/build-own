export const positiveAmount=v=>Number.isFinite(Number(v))&&Number(v)>=0;
export const validateExpense=(body)=>{if(!body?.category||!positiveAmount(body.amount))return 'Category and a non-negative amount are required';return null};
export const validatePurchaseOrder=(body)=>{if(!body?.number||!body?.supplierId)return 'PO number and supplier are required';if(!Array.isArray(body.items))return 'Items must be an array';if(body.items.some(i=>!positiveAmount(i.quantity)||!positiveAmount(i.unitPrice)))return 'Item quantities and prices must be non-negative';return null};
export const validateMaterial=(body)=>{if(!body?.name||!body?.unit)return 'Material name and unit are required';if(body.stock!==undefined&&!positiveAmount(body.stock))return 'Stock must be non-negative';return null};
