"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardShell from "./dashborad-shell"
import DashboardHeader from "./dashboard-header"
import FileUploader from "../fileUploader/file-uploader"


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("files")

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage and share your files securely." />
      <Tabs defaultValue="files" className="space-y-4 mt-10" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="space-y-4">
          <FileUploader />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent file sharing activity.</CardDescription>
            </CardHeader>
            <CardContent>
              Activity here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

