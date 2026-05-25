import { Calculator, FileSpreadsheet, IndianRupee, Layers3, PackagePlus, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableCell, TableHead } from "../components/ui/table";
import { CalculationLine, CostBars, DoughnutMetric } from "../components/Charts";
import { Skeleton } from "../components/ui/skeleton";
import { adminDashboard, userDashboard } from "../data/fixtures";
import { useAuth } from "../context/auth";
import { useRemote } from "../hooks/useRemote";
import { inr, shortDate } from "../lib/utils";
import { getOrFixture } from "../services/api";
import type { Calculation } from "../types";

function Kpi({ label, value, icon: Icon, note }: { label: string; value: string; icon: typeof Calculator; note: string }) {
  return <Card><CardContent className="flex min-h-32 items-center justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--muted-foreground)]">{label}</p><strong className="mt-2 block text-3xl">{value}</strong><p className="mt-2 text-xs font-semibold text-[var(--success)]">{note}</p></div><Icon className="size-10 text-[var(--primary)]" /></CardContent></Card>;
}
function Status({ value }: { value: string }) {
  return <Badge className={value === "COMPLETED" ? "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]" : "border-[#f3daa5] bg-[#fff6e4] text-[#8a5900]"}>{value}</Badge>;
}

export function DashboardPage() {
  const { actor } = useAuth();
  return actor?.role === "Admin" ? <AdminDashboard /> : <UserDashboard />;
}

function AdminDashboard() {
  const { data, loading } = useRemote(() => getOrFixture("/dashboard/admin", adminDashboard), adminDashboard);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <header><p className="text-sm font-semibold text-[var(--primary)]">Administrative control center</p><h2 className="text-2xl font-bold">Admin Dashboard</h2></header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {loading ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-32" />) : <>
          <Kpi label="Total Calculations" value={data.kpis.calculations.toLocaleString("en-IN")} icon={Calculator} note="↑ 18.6% this month" />
          <Kpi label="Active Users" value={String(data.kpis.activeUsers)} icon={Users} note="Online access controlled" />
          <Kpi label="Total Alloys" value={String(data.kpis.alloys)} icon={Layers3} note="↑ 12.3% configured" />
          <Kpi label="Raw Materials" value={String(data.kpis.rawMaterials)} icon={PackagePlus} note="Master-locked prices" />
          <Kpi label="Total Est. Value" value={inr(data.kpis.estimatedValue)} icon={IndianRupee} note="Future calculations only" />
        </>}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.55fr_.8fr]">
        <Card><CardHeader><CardTitle>Calculations Overview</CardTitle></CardHeader><CardContent><CalculationLine points={data.series} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"><Button>Run Calculation</Button><Button variant="secondary">Add Alloy</Button><Button variant="outline">Add Grade</Button><Button variant="outline">Price Update</Button></CardContent></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_.92fr]">
        <Card><CardHeader><CardTitle>Top Used Alloys</CardTitle></CardHeader><CardContent><DoughnutMetric rows={data.topAlloys} center={String(data.kpis.alloys)} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Calculation Status</CardTitle></CardHeader><CardContent><DoughnutMetric rows={data.statuses} center={String(data.kpis.calculations)} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{data.activity.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm"><span><strong>{entry.entity}</strong><span className="block text-xs text-[var(--muted-foreground)]">{entry.action} by {entry.user?.name ?? "System"}</span></span><span className="text-xs">{shortDate(entry.createdAt)}</span></div>)}</CardContent></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <RecentTable rows={data.recent} />
        <Card><CardHeader><CardTitle>System Summary & Alerts</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{Object.entries(data.systemSummary).map(([name, value]) => <div key={name} className="rounded-md border bg-[#f7faff] p-3"><span className="text-xs uppercase text-[var(--muted-foreground)]">{name}</span><strong className="block text-2xl">{value}</strong></div>)}{data.notices.slice(0, 2).map((notice) => <div key={notice.id} className="rounded-md border border-[#f1caca] bg-[#fff6f6] p-3 text-sm font-medium">{notice.title}</div>)}</CardContent></Card>
      </div>
    </motion.div>
  );
}

function UserDashboard() {
  const { data } = useRemote(() => getOrFixture("/dashboard/user", userDashboard), userDashboard);
  return <div className="flex flex-col gap-4">
    <header><p className="text-sm font-semibold text-[var(--primary)]">Saved alloys and cost workflow</p><h2 className="text-2xl font-bold">User Dashboard</h2></header>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Kpi label="Total Calculations" value={String(data.kpis.calculations)} icon={Calculator} note="↑ 12% vs last 30 days" /><Kpi label="Saved Alloys" value={String(data.kpis.savedAlloys)} icon={Layers3} note="↑ 8% saved" /><Kpi label="Estimated Cost" value={inr(data.kpis.estimatedValue)} icon={IndianRupee} note="Master prices applied" /><Kpi label="Recent Activity" value={String(data.kpis.recentActivity)} icon={TrendingUp} note="Live notifications" /></div>
    <div className="grid gap-4 xl:grid-cols-[1.5fr_.75fr]"><RecentTable rows={data.recent} /><Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"><Button>New Calculation</Button><Button variant="secondary">Add Alloy</Button><Button variant="outline"><FileSpreadsheet />Reports</Button><Button variant="outline">Download Invoice</Button></CardContent></Card></div>
    <div className="grid gap-4 xl:grid-cols-[.8fr_1.15fr_.8fr]"><Card><CardHeader><CardTitle>Calculation Overview</CardTitle></CardHeader><CardContent><CalculationLine points={data.series} /></CardContent></Card><Card><CardHeader><CardTitle>Saved Alloys</CardTitle></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2">{data.saved.map((alloy) => <div key={alloy.id} className="rounded-md border p-3"><strong>{alloy.name}</strong><p className="text-sm text-[var(--muted-foreground)]">{alloy.type}</p><Button size="sm" variant="outline" className="mt-3">Open</Button></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{data.notices.map((notice) => <div key={notice.id} className="rounded-md border p-2 text-sm"><strong>{notice.title}</strong><p className="text-xs text-[var(--muted-foreground)]">{notice.message}</p></div>)}</CardContent></Card></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_.75fr]"><Card><CardHeader><CardTitle>Cost Trend Analysis</CardTitle></CardHeader><CardContent><CostBars points={data.series} /></CardContent></Card><Card><CardHeader><CardTitle>Workflow Overview</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm sm:grid-cols-4 xl:grid-cols-2"><Flow title="Create" note="Alloy calculation" /><Flow title="Update" note="Live costing" /><Flow title="Report" note="PDF or Excel" /><Flow title="Audit" note="Price snapshot" /></CardContent></Card></div>
  </div>;
}

function Flow({ title, note }: { title: string; note: string }) {
  return <div className="rounded-md border border-dashed bg-[#f7faff] p-3"><strong className="block">{title}</strong><span className="text-xs text-[var(--muted-foreground)]">{note}</span></div>;
}
function RecentTable({ rows }: { rows: Calculation[] }) {
  return <Card><CardHeader><CardTitle>Recent Calculations</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><Table><thead><tr><TableHead>Batch</TableHead><TableHead>Alloy</TableHead><TableHead>Weight</TableHead><TableHead>Estimated Cost</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><TableCell className="font-semibold">{row.batchId}</TableCell><TableCell>{row.alloy?.name ?? row.name}</TableCell><TableCell>{Number(row.totalQuantity).toLocaleString("en-IN")} kg</TableCell><TableCell>{inr(row.finalCost)}</TableCell><TableCell><Status value={row.status} /></TableCell><TableCell>{shortDate(row.updatedAt)}</TableCell></tr>)}</tbody></Table></CardContent></Card>;
}
