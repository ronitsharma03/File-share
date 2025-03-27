"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardShell from "./dashborad-shell";
import DashboardHeader from "./dashboard-header";
import FileUploader from "../fileUploader/file-uploader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FilReceiver from "../fileReceiver/file-receiver";
import { useTransferStore } from "../atoms/fileTransferAtoms";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("send");
  const { connectionState } = useTransferStore();

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Manage and share your files securely."
      />
      <Tabs
        defaultValue="send"
        className="space-y-4 mt-10"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="send" className="space-y-4 lg:mr-56">
          <FileUploader />
        </TabsContent>
        <TabsContent value="receive" className="space-y-4 lg:mr-56">
          <Card>
            <CardHeader>
              {connectionState ? (
                ""
              ) : (
                <>
                  <CardTitle>Receive the file</CardTitle>
                  <CardDescription>
                    Paste the shared code here to receive your file
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <FilReceiver />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4 lg:mr-56">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent file sharing activity.
              </CardDescription>
            </CardHeader>
            <CardContent>Activity here</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
