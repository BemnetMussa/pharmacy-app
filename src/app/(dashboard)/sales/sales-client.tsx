"use client";

import { useMemo, useState, useTransition } from "react";
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
import { createSale } from "@/features/sales/actions";
import { saleSchema } from "@/features/sales/validators";
import type { SaleInput } from "@/features/sales/validators";
import { formatMoney } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter((m) => m.name.toLowerCase().includes(q));
  }, [medicines, query]);

  const total = selectedMed ? selectedMed.unitPrice * qty : 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!selectedMed) {
      setError("Medicine is required");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const raw: SaleInput = {
      medicineId: selectedMed.id,
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
        <Label htmlFor="med-search">Medicine</Label>
        <Input
          id="med-search"
          className="h-12"
          placeholder="Search medicines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          onValueChange={(val) => {
            const med = medicines.find((m) => m.id === val) ?? null;
            setSelectedMed(med);
            setQty(1);
          }}
        >
          <SelectTrigger className="h-12">
            <SelectValue
              placeholder={
                selectedMed ? selectedMed.name : "Select a medicine…"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((med) => (
              <SelectItem
                key={med.id}
                value={med.id}
                disabled={med.quantity === 0}
              >
                {med.name} — {med.quantity} {med.unit}
                {med.quantity === 0
                  ? " (Out)"
                  : med.quantity <= 10
                    ? " (Low)"
                    : ""}
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
            {selectedMed.quantity} {selectedMed.unit} in stock ·{" "}
            {formatMoney(selectedMed.unitPrice)} each
          </p>
        )}
      </div>

      {selectedMed && (
        <div className="bg-secondary flex items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">Line total</span>
          <span className="text-lg font-bold tabular-nums">
            {formatMoney(total)}
          </span>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          name="note"
          className="h-11"
          placeholder="e.g. regular customer"
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-12" onClick={onCancel}>
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
              : "Record sale"}
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
      <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
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
  const [success, setSuccess] = useState<{
    sale: Sale;
    stockLeft: number;
  } | null>(null);
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
    setAddOpen(false);
    setSuccess(result);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Sales</h1>
          <p className="text-muted-foreground text-sm">
            Record sales and view today&apos;s activity.
          </p>
        </div>
        <Button
          className="hidden h-11 rounded-xl md:inline-flex"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          Record sale
        </Button>
      </div>

      <Button
        className="h-12 w-full rounded-xl text-base font-semibold md:hidden"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="size-4" aria-hidden />
        Record sale
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Today&apos;s revenue
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums md:text-2xl">
            {formatMoney(todayRevenue)}
          </p>
        </div>
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Transactions
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums md:text-2xl">
            {sales.length}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Filtered · {formatMoney(filteredTotal)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input name="from" type="date" defaultValue={from} className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input name="to" type="date" defaultValue={to} className="h-10" />
        </div>
        <Button type="submit" variant="outline" className="h-10 rounded-xl">
          Filter
        </Button>
        {(from || to) && (
          <Button type="button" variant="ghost" className="h-10" onClick={clearFilter}>
            Clear
          </Button>
        )}
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Recent sales</h2>

        <div className="space-y-2 md:hidden">
          {sales.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No sales yet this shift — record the first one.
            </p>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="leyu-list-row">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-muted-foreground text-xs">
                    {new Date(sale.soldAt).toLocaleString()}
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {sale.medicine.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Qty {sale.quantity} {sale.medicine.unit}
                    {sale.note ? ` · ${sale.note}` : ""}
                  </p>
                </div>
                <p className="text-primary shrink-0 text-sm font-bold tabular-nums">
                  {formatMoney(sale.totalAmount)}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="leyu-surface-card hidden overflow-hidden md:block">
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
                    No sales yet this shift — record the first one.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.medicine.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {sale.quantity} {sale.medicine.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(sale.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
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
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record a sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            medicines={medicines}
            onSave={handleSaved}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
