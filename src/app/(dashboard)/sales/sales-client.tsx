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
import { formatMoney } from "@/lib/utils";
import { Check } from "lucide-react";

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
  onSave: (result: { sale: Sale; stockLeft: number }) => void;
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
        const created = await createSale(result.data);
        if (!selectedMed) return;
        onSave({
          sale: {
            ...created,
            medicine: { name: selectedMed.name, unit: selectedMed.unit },
          },
          stockLeft: selectedMed.quantity - result.data.quantity,
        });
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
            setQty(1);
          }}
        >
          <SelectTrigger className="h-12">
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
          inputMode="numeric"
          min={1}
          max={selectedMed?.quantity}
          className="h-12"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        />
        {selectedMed && (
          <p className="text-muted-foreground text-xs">
            {selectedMed.quantity} {selectedMed.unit} in stock
          </p>
        )}
      </div>

      {selectedMed && (
        <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm">
          <span className="text-muted-foreground">Line total</span>
          <span className="text-lg font-bold">{formatMoney(total)}</span>
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
        <Button
          type="submit"
          className="h-12"
          disabled={pending || !selectedMed}
        >
          {pending
            ? "Saving…"
            : selectedMed
              ? `Confirm sale · ${formatMoney(total)}`
              : "Record Sale"}
        </Button>
      </div>
    </form>
  );
}

function SaleSuccess({
  sale,
  stockLeft,
  onDone,
  onAnother,
}: {
  sale: Sale;
  stockLeft: number;
  onDone: () => void;
  onAnother: () => void;
}) {
  return (
    <div className="space-y-6 py-2 text-center">
      <div className="bg-success/10 text-success mx-auto flex size-12 items-center justify-center rounded-full">
        <Check className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">Sale recorded</h3>
        <p className="text-muted-foreground text-sm">
          {sale.medicine.name} · {sale.quantity} {sale.medicine.unit} ·{" "}
          {formatMoney(sale.totalAmount)}
        </p>
      </div>
      <div className="border-t pt-4">
        <p className="text-sm">
          <strong>{stockLeft}</strong> {sale.medicine.unit} left in stock
        </p>
      </div>
      <div className="space-y-2">
        <Button className="h-12 w-full" onClick={onDone}>
          Done
        </Button>
        <Button
          variant="ghost"
          className="text-primary w-full"
          onClick={onAnother}
        >
          Record another
        </Button>
      </div>
    </div>
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
  const [success, setSuccess] = useState<{ sale: Sale; stockLeft: number } | null>(null);
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

  function handleSaved(result: { sale: Sale; stockLeft: number }) {
    setSuccess(result);
    router.refresh();
  }

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Today&apos;s Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(todayRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Filtered Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(filteredTotal)}</p>
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
        <Button
          className="ml-auto hidden md:inline-flex"
          onClick={() => setAddOpen(true)}
        >
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
                  No sales yet this shift — the first one starts the queue.
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
                    {formatMoney(sale.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(sale.totalAmount)}
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

      {/* Mobile sticky CTA — sits above bottom nav */}
      <div className="bg-background fixed inset-x-0 bottom-[57px] z-40 border-t p-3 md:hidden">
        <Button className="h-12 w-full text-base" onClick={() => setAddOpen(true)}>
          Record sale
        </Button>
      </div>

      {/* Record Sale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record a Sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            medicines={medicines}
            onSave={handleSaved}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Sale Success Dialog */}
      <Dialog
        open={!!success}
        onOpenChange={(open) => !open && setSuccess(null)}
      >
        <DialogContent className="max-w-sm">
          {success && (
            <SaleSuccess
              sale={success.sale}
              stockLeft={success.stockLeft}
              onDone={() => setSuccess(null)}
              onAnother={() => {
                setSuccess(null);
                setAddOpen(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
