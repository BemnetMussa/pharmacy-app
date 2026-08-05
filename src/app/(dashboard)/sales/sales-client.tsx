"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSale } from "@/features/sales/actions";
import { saleSchema } from "@/features/sales/validators";
import type { SaleInput } from "@/features/sales/validators";

type Sale = {
  id: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  soldAt: Date;
  note: string | null;
  medicine: { name: string; unit: string };
};

type Medicine = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

function SaleForm({
  medicines,
  onSave,
  onCancel,
}: {
  medicines: Medicine[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const total = selectedMed ? selectedMed.unitPrice * qty : 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const raw: SaleInput = {
      medicineId: fd.get("medicineId") as string,
      quantity: qty,
      note: (fd.get("note") as string) || null,
    };

    const result = saleSchema.safeParse(raw);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      try {
        await createSale(result.data);
        onSave();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to record sale");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Medicine</Label>
        <Select
          name="medicineId"
          onValueChange={(val) => {
            const med = medicines.find((m) => m.id === val) ?? null;
            setSelectedMed(med);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a medicine…" />
          </SelectTrigger>
          <SelectContent>
            {medicines.map((med) => (
              <SelectItem
                key={med.id}
                value={med.id}
                disabled={med.quantity === 0}
              >
                {med.name} — {med.quantity} {med.unit} available
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="qty">Quantity</Label>
        <Input
          id="qty"
          type="number"
          min={1}
          max={selectedMed?.quantity}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        />
        {selectedMed && (
          <p className="text-muted-foreground text-xs">
            Max available: {selectedMed.quantity} {selectedMed.unit}
          </p>
        )}
      </div>

      {selectedMed && (
        <div className="bg-muted rounded-md px-3 py-2 text-sm">
          Unit price: <strong>${selectedMed.unitPrice.toFixed(2)}</strong>
          {" → "}
          Total: <strong>${total.toFixed(2)}</strong>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" name="note" placeholder="e.g. regular customer" />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !selectedMed}>
          {pending ? "Saving…" : "Record Sale"}
        </Button>
      </div>
    </form>
  );
}

export function SalesClient({
  sales,
  medicines,
  todayRevenue,
  from,
  to,
}: {
  sales: Sale[];
  medicines: Medicine[];
  todayRevenue: number;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  const filteredTotal = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const f = fd.get("from") as string;
    const t = fd.get("to") as string;
    if (f) params.set("from", f);
    else params.delete("from");
    if (t) params.set("to", t);
    else params.delete("to");
    startTransition(() => router.push(`?${params.toString()}`));
  }

  function clearFilter() {
    startTransition(() => router.push("/sales"));
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Today&apos;s Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Filtered Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${filteredTotal.toFixed(2)}</p>
            <p className="text-muted-foreground text-xs">
              {sales.length} transaction{sales.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label>From</Label>
            <Input name="from" type="date" defaultValue={from} />
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <Input name="to" type="date" defaultValue={to} />
          </div>
          <Button type="submit" variant="outline">
            Filter
          </Button>
          {(from || to) && (
            <Button type="button" variant="ghost" onClick={clearFilter}>
              Clear
            </Button>
          )}
        </form>
        <Button className="ml-auto" onClick={() => setAddOpen(true)}>
          Record Sale
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No sales found. Record your first sale.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.medicine.name}
                    <Badge variant="secondary" className="ml-2">
                      {sale.medicine.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${sale.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${sale.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(sale.soldAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.note ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Record Sale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record a Sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            medicines={medicines}
            onSave={() => {
              setAddOpen(false);
              router.refresh();
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
