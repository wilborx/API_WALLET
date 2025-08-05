"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { UsageChart } from "@/components/usage-chart";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyCard } from "@/components/key-card";
import { EmptyState } from "@/components/empty-state";
import { KeyRound, Bell, DollarSign, Timer } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_API_KEYS, GET_DASHBOARD_STATS } from "@/lib/graphql/queries";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const { loading: keysLoading, error: keysError, data: keysData } = useQuery(GET_API_KEYS, {
    variables: { status: activeTab === "all" ? null : activeTab },
    pollInterval: 5000, // Refetch every 5 seconds
  });

  const { data: statsData } = useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 5000,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const stats = [
    {
      title: "Total Keys",
      value: statsData?.getDashboardStats?.totalKeys ?? 0,
      change: "+2 from last month", // Placeholder
      icon: KeyRound,
    },
    {
      title: "Active Alerts",
      value: statsData?.getDashboardStats?.activeAlerts ?? 0,
      change: "No critical alerts", // Placeholder
      icon: Bell,
    },
    {
      title: "Monthly Cost",
      value: `$${statsData?.getDashboardStats?.monthlyCost.toFixed(2) ?? '0.00'}`,
      change: "Usage data not available",
      icon: DollarSign,
    },
    {
      title: "Avg. Response Time",
      value: `${statsData?.getDashboardStats?.avgResponseTime ?? 'N/A'} ms`,
      change: "Usage data not available",
      icon: Timer,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-20">
        <Header />
        <main className="flex-1 grid items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">{stat.title}</h3>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <UsageChart />
            </motion.div>
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <div className="flex items-center px-6 pt-6">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="invalid">Invalid</TabsTrigger>
                      <TabsTrigger value="verifying">Verifying</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value={activeTab} className="p-6">
                    {keysLoading && <p>Loading keys...</p>}
                    {keysError && <p>Error loading keys: {keysError.message}</p>}
                    {keysData && keysData.apiKeys.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {keysData &&
                          keysData.apiKeys.map((key: { id: string; name: string; provider: string; maskedKey: string; status: string; createdAt: string; }) => (
                            <KeyCard key={key.id} apiKey={key} />
                          ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </GlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
