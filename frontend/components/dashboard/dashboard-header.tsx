import React from "react";

interface DashboardHeaderProps {
  heading: string;
  text: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        <p className="text-muted-foreground">{text}</p>
      </div>
      {children}
    </div>
  );
}
