import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout({children}) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-content">
                { children || <Outlet />}
            </div>
        </div>
    );
}