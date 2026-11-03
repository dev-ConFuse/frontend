'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileAvatar } from '@/components/ui/ProfileAvatar'
import { Footer } from '@/components/layout/footer'
import { BillingDashboard } from '@/app/billing/components/BillingDashboard'
import { SubscriptionPlans } from '@/app/billing/components/SubscriptionPlans'
import { PaymentMethods } from '@/app/billing/components/PaymentMethods'
import { InvoiceHistory } from '@/app/billing/components/InvoiceHistory'
import { UsageTracking } from '@/app/billing/components/UsageTracking'
import { PricingPage } from '@/app/billing/components/PricingPage'

export default function BillingPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAuthenticated) {
    return <PricingPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, payment methods, and billing information."
        icon={CreditCard}
        actions={<ProfileAvatar />}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

      <TabsContent value="dashboard">
        <BillingDashboard />
      </TabsContent>

      <TabsContent value="plans">
        <SubscriptionPlans />
      </TabsContent>

      <TabsContent value="payment">
        <PaymentMethods />
      </TabsContent>

      <TabsContent value="invoices">
        <InvoiceHistory />
      </TabsContent>

      <TabsContent value="usage">
        <UsageTracking />
      </TabsContent>
      </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}
