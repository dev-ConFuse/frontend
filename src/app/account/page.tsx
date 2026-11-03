'use client'

import { useState } from 'react'
import { UserCog } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthGuard } from '@/app/auth/components/AuthGuard'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileSettings } from '@/app/account/components/ProfileSettings'
import { SecuritySettings } from '@/app/account/components/SecuritySettings'
import { NotificationSettings } from '@/app/account/components/NotificationSettings'
import { AccountDeletion } from '@/app/account/components/AccountDeletion'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <AuthGuard>
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Account Settings"
        description="Manage your account preferences and security settings."
        icon={UserCog}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="danger">
          <AccountDeletion />
        </TabsContent>
      </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}