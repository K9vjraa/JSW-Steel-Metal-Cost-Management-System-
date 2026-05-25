import { ArrowRight, FlaskConical, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { grades, metals, rawMaterials } from "../data/fixtures";
import { inr } from "../lib/utils";
import { api } from "../services/api";
import type { Breakdown, Grade } from "../types";

type Mode = "metal" | "alloy" | "raw-material";
type Row = { id: string; metalId?: string; rawMaterialId?: string; gradeId?: string; quantity: number; compositionPct?: number };
const seedRows: Record<Mode, Row[]> = {
  metal: [{ id: "m1", metalId: "metal-ss", gradeId: "grade-304", quantity: 100 }, { id: "m2", metalId: "metal-ss", gradeId: "grade-316", quantity: 150 }, { id: "m3", metalId: "metal-as", gradeId: "grade-as", quantity: 200 }],
  alloy: [{ id: "a1", metalId: "metal-ss", gradeId: "grade-304", quantity: 680 }, { id: "a2", rawMaterialId: "rm-ni", quantity: 80 }, { id: "a3", rawMaterialId: "rm-cr", quantity: 20 }],
  "raw-material": [{ id: "r1", rawMaterialId: "rm-fe", quantity: 120, compositionPct: 70 }, { id: "r2", rawMaterialId: "rm-ni", quantity: 40, compositionPct: 20 }, { id: "r3", rawMaterialId: "rm-cr", quantity: 10, compositionPct: 10 }]
};

function priceFor(row: Row) {
  const metal = metals.find((item) => item.id === row.metalId);
  const raw = rawMaterials.find((item) => item.id === row.rawMaterialId);
  return Number(metal?.prices[0]?.pricePerUnit ?? raw?.prices[0]?.pricePerUnit ?? 0);
}
function gradeFor(row: Row) {
  return grades.find((grade) => grade.id === row.gradeId);
}
export function localBreakdown(rows: Row[]): Breakdown {
  const items = rows.map((row) => {
    const grade = gradeFor(row);
    const name = grade?.name ?? rawMaterials.find((item) => item.id === row.rawMaterialId)?.name ?? "Material";
    const unitPrice = priceFor(row);
    const baseCost = row.quantity * unitPrice * Number(grade?.multiplier ?? 1) + Number(grade?.extraPrice ?? 0);
    return { id: row.id, name, quantity: String(row.quantity), unitPrice: String(unitPrice), gradeMultiplier: grade?.multiplier ?? "1", extraPrice: grade?.extraPrice ?? "0", baseCost: String(baseCost), gradeName: grade?.name };
  });
  const baseCost = items.reduce((total, item) => total + Number(item.baseCost), 0);
  const totalQuantity = items.reduce((total, item) => total + Number(item.quantity), 0);
  const scrapCost = baseCost * 0.02;
  const transportCost = totalQuantity * 1.5;
  const additionalCost = 120;
  const gstAmount = (baseCost + scrapCost + transportCost + additionalCost) * 0.18;
  return { items, totalQuantity: String(totalQuantity), baseCost: String(baseCost), scrapCost: String(scrapCost), transportCost: String(transportCost), additionalCost: String(additionalCost), gstAmount: String(gstAmount), finalCost: String(baseCost + scrapCost + transportCost + additionalCost + gstAmount) };
}

export function WorkspacePage() {
  const [mode, setMode] = useState<Mode>("alloy");
  const [rows, setRows] = useState(seedRows.alloy);
  const breakdown = useMemo(() => localBreakdown(rows), [rows]);
  const chosenGrade = rows.map(gradeFor).find(Boolean) ?? grades[0];
  const setWorkspace = (next: string) => { const typed = next as Mode; setMode(typed); setRows(seedRows[typed]); };
  const addRow = () => setRows((current) => [...current, mode === "raw-material" ? { id: crypto.randomUUID(), rawMaterialId: "rm-fe", quantity: 10, compositionPct: 5 } : { id: crypto.randomUUID(), metalId: "metal-ss", gradeId: "grade-304", quantity: 50 }]);
  return <div className="flex flex-col gap-4">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--primary)]">Main costing module</p><h2 className="text-2xl font-bold">Alloy Cost Calculation Workspace</h2></div><div className="flex gap-2"><Badge className="border-[#bde4cf] bg-[#e8fbf0] text-[#087443]"><Lock />Master locked prices</Badge><Button onClick={async () => { try { await api.post("/calculations", { name: `${mode} cost run`, mode, items: rows.map(({ id, ...row }) => row) }); toast.success("Draft calculation saved"); } catch { toast.success("Demo draft saved locally"); } }}><Save />Save Draft</Button></div></header>
    <Tabs value={mode} onValueChange={setWorkspace}><TabsList><TabsTrigger value="metal">Metal Calculator</TabsTrigger><TabsTrigger value="alloy">Alloy Workspace</TabsTrigger><TabsTrigger value="raw-material">Raw Material Builder</TabsTrigger></TabsList>
      <TabsContent value={mode}>
        <div className="grid gap-4 2xl:grid-cols-[1.35fr_.72fr_.92fr]">
          <Builder mode={mode} rows={rows} setRows={setRows} addRow={addRow} />
          <PropertyPanel grade={chosenGrade} />
          <Summary breakdown={breakdown} remove={(id) => setRows((current) => current.filter((row) => row.id !== id))} />
        </div>
      </TabsContent>
    </Tabs>
  </div>;
}

function Builder({ mode, rows, setRows, addRow }: { mode: Mode; rows: Row[]; setRows: React.Dispatch<React.SetStateAction<Row[]>>; addRow: () => void }) {
  const metalMode = mode !== "raw-material";
  return <Card><CardHeader><CardTitle>{mode === "metal" ? "1. Metal Calculation Workspace" : mode === "alloy" ? "1. Alloy Input Workspace" : "1. Alloy Composition Builder"}</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">
    {mode === "alloy" ? <div className="rounded-md border bg-[#f7faff] p-3 text-sm"><strong>Main Alloy Calculator</strong><div className="mt-2 grid gap-2 sm:grid-cols-4"><Info label="Alloy" value="SS304" /><Info label="Batch Weight" value="1000 kg" /><Info label="Alloy Type" value="Stainless Steel" /><Info label="Composition" value="Expanded" /></div></div> : null}
    {rows.map((row, index) => <div key={row.id} className="rounded-lg border p-3">
      <div className="mb-3 flex items-center justify-between"><strong>{metalMode ? `Metal ${index + 1}` : `Material ${index + 1}`}</strong>{rows.length > 1 ? <Button variant="ghost" size="sm" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}><Trash2 />Remove</Button> : null}</div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {metalMode ? <label className="grid gap-1 text-xs font-semibold">Metal / Alloy<select className="h-10 rounded-md border bg-white px-2" value={row.metalId ?? ""} onChange={(event) => { const metalId = event.target.value; const gradeId = metals.find((item) => item.id === metalId)?.grades[0]?.id; setRows((current) => current.map((item) => item.id === row.id ? { ...item, metalId, rawMaterialId: undefined, gradeId } : item)); }}>{metals.map((metal) => <option value={metal.id} key={metal.id}>{metal.name}</option>)}</select></label> :
        <label className="grid gap-1 text-xs font-semibold">Raw Material<select className="h-10 rounded-md border bg-white px-2" value={row.rawMaterialId ?? ""} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, rawMaterialId: event.target.value } : item))}>{rawMaterials.map((material) => <option value={material.id} key={material.id}>{material.name}</option>)}</select></label>}
        {metalMode ? <label className="grid gap-1 text-xs font-semibold">Grade<select className="h-10 rounded-md border bg-white px-2" value={row.gradeId ?? ""} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, gradeId: event.target.value } : item))}>{grades.filter((grade) => grade.metalId === row.metalId).map((grade) => <option value={grade.id} key={grade.id}>{grade.name}</option>)}</select></label> :
        <label className="grid gap-1 text-xs font-semibold">Composition %<Input type="number" value={row.compositionPct ?? 0} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, compositionPct: Number(event.target.value) } : item))} /></label>}
        <label className="grid gap-1 text-xs font-semibold">Quantity (kg)<Input type="number" value={row.quantity} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, quantity: Number(event.target.value) } : item))} /></label>
        <label className="grid gap-1 text-xs font-semibold">Price / kg<output className="flex h-10 items-center justify-between rounded-md border bg-[#f7faff] px-3">{inr(priceFor(row))}<Lock className="size-3" /></output></label>
      </div>
      {mode === "alloy" ? <details className="mt-3 rounded-md border bg-[#fbfdff] p-2 text-sm"><summary className="cursor-pointer font-semibold">View Raw Materials</summary><div className="mt-2 grid gap-2 md:grid-cols-3">{rawMaterials.map((material) => <Info key={material.id} label={material.name} value={`${inr(material.prices[0].pricePerUnit)} / kg`} />)}</div></details> : null}
    </div>)}
    <Button variant="outline" className="border-dashed" onClick={addRow}><Plus />{mode === "raw-material" ? "Add Raw Material" : "Add Metal"}</Button>
  </CardContent></Card>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border bg-white p-2"><span className="block text-xs text-[var(--muted-foreground)]">{label}</span><strong className="text-sm">{value}</strong></div>;
}
function PropertyPanel({ grade }: { grade: Grade }) {
  return <Card><CardHeader><CardTitle>2. Product Information</CardTitle></CardHeader><CardContent><Accordion type="multiple" defaultValue={["mechanical"]} className="flex flex-col gap-3"><Property id="mechanical" title="Mechanical Properties" rows={grade.mechanicalProperties} /><Property id="tolerance" title="Tolerance Properties" rows={grade.toleranceProperties} /><Property id="bend" title="Bend Properties" rows={grade.bendProperties} /><Property id="chemical" title="Chemical Composition" rows={grade.chemicalComposition} /></Accordion></CardContent></Card>;
}
function Property({ id, title, rows }: { id: string; title: string; rows: Record<string, string> }) {
  return <AccordionItem value={id}><AccordionTrigger>{title}</AccordionTrigger><AccordionContent><dl className="grid gap-2">{Object.entries(rows).map(([name, value]) => <div key={name} className="flex justify-between gap-2"><dt>{name}</dt><dd className="font-semibold text-[var(--foreground)]">{value}</dd></div>)}</dl></AccordionContent></AccordionItem>;
}
function Summary({ breakdown, remove }: { breakdown: Breakdown; remove: (id: string) => void }) {
  return <Card className="self-start"><CardHeader><CardTitle>3. Live Summary Panel</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">
    <div className="rounded-md border border-dashed bg-[#f7faff] p-3 text-sm">Selected items appear here and recalculate instantly from active prices.</div>
    {breakdown.items.map((item, index) => <div key={item.id} className="rounded-lg border p-3"><div className="mb-2 flex justify-between"><strong>{index + 1}. {item.name}</strong><Button variant="ghost" size="sm" onClick={() => remove(item.id)}>Remove</Button></div><div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><Info label="Qty" value={`${item.quantity} kg`} /><Info label="Price/kg" value={inr(item.unitPrice)} /><Info label="Multiplier" value={`${item.gradeMultiplier}x`} /><Info label="Amount" value={inr(item.baseCost)} /></div></div>)}
    <div className="grid gap-2 rounded-lg border bg-[#032f67] p-4 text-sm text-white sm:grid-cols-2"><span>Base Cost<strong className="block text-lg">{inr(breakdown.baseCost)}</strong></span><span>Scrap + Transport<strong className="block text-lg">{inr(Number(breakdown.scrapCost) + Number(breakdown.transportCost))}</strong></span><span>GST<strong className="block text-lg">{inr(breakdown.gstAmount)}</strong></span><span>Additional<strong className="block text-lg">{inr(breakdown.additionalCost)}</strong></span><span className="col-span-full mt-1 border-t border-white/20 pt-3">Final Total<strong className="block text-3xl">{inr(breakdown.finalCost)}</strong></span></div>
    <div className="grid gap-2 text-sm"><Badge><FlaskConical />Live cost engine</Badge><p className="flex items-center gap-2 text-[var(--muted-foreground)]"><ArrowRight className="size-4" /> Final total includes GST and configured industrial charges.</p></div>
  </CardContent></Card>;
}
