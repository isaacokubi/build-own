import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function Dashboard(){return <main><h1>Construction Management System</h1><p>Platform foundation is ready.</p><nav><Link to="/superadmin/companies">Companies</Link></nav></main>}
function Companies(){return <main><h1>Companies</h1><p>SuperAdmin company management will appear here.</p><p>Tenant APIs are ready for the next implementation phase.</p></main>}
export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Dashboard/>}/><Route path="/superadmin/companies" element={<Companies/>}/></Routes></BrowserRouter>}
