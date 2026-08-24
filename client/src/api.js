import axios from 'axios';

const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('accessToken');if(token)config.headers.Authorization=`Bearer ${token}`;return config});

export const tenantApi={
  list:params=>api.get('/tenants',{params}),
  create:data=>api.post('/tenants',data),
  update:(id,data)=>api.patch(`/tenants/${id}`,data),
  setStatus:(id,status)=>api.patch(`/tenants/${id}/status`,{status}),
  remove:id=>api.delete(`/tenants/${id}`,{data:{confirmation:'DELETE'}}),
  me:()=>api.get('/tenants/me'),
};

export const notificationApi={
  list:()=>api.get('/notifications-audit/notifications'),
  markRead:id=>api.patch(`/notifications-audit/notifications/${id}/read`),
};

export default api;
