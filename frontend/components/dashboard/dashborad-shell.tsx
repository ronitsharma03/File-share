import React from "react";

interface DashboardShellProps {
    children: React.ReactNode;
}

export default function DashboardShell({children}: DashboardShellProps){
    return (
        <div className="flex flex-col w-full">
            {children}
        </div>
    )
}