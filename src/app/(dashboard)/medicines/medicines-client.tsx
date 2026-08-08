"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "@/features/medicines/actions";
import { medicineSchema } from "@/features/medicines/validators";
import type { MedicineInput } from "@/features/medicines/validators";
import { cn, formatMoney } from "@/lib/utils";
import { Plus } from "lucide-react";

type Medicine = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  costPrice?: number;
  expiryDate: Date | null;
  description: string | null;
};

const LOW_STOCK_THRESHOLD = 10;

type StockStatus = "OK" | "Low" | "Out";

function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "Out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "Low";
  return "OK";
}

function StockPill({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        status === "OK" && "leyu-status-ok",
        status === "Low" && "leyu-status-low",
        status === "Out" && "leyu-status-out",
      )}
    >
      {status}
    </span>
  );
}

function MedicineForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Medicine;
  onSave: (data: MedicineInput) => void;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      quantity: Number(fd.get("quantity")),
      unit: fd.get("unit") as string,
      unitPrice: Number(fd.get("unitPrice")),
      costPrice: Number(fd.get("costPrice")),
      expiryDate: (fd.get("expiryDate") as string) || null,
      description: (fd.get("description") as string) || null,
    };

    const result = medicineSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      if (initial) {
        await updateMedicine(initial.id, result.data);
      } else {
        await createMedicine(result.data);
      }
      onSave(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" className="h-11" defaultValue={initial?.name ?? ""} />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" className="h-11" defaultValue={initial?.category ?? ""} />
          {errors.category && <p className="text-destructive text-xs">{errors.category}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            name="unit"
            className="h-11"
            placeholder="e.g. tablet, bottle"
            defaultValue={initial?.unit ?? "unit"}
          />
          {errors.unit && <p className="text-destructive text-xs">{errors.unit}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            className="h-11"
            defaultValue={initial?.quantity ?? 0}
          />
          {errors.quantity && <p className="text-destructive text-xs">{errors.quantity}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="unitPrice">Sale Price (ETB)</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min={0}
            step={0.01}
            className="h-11"
            defaultValue={initial?.unitPrice ?? ""}
          />
          {errors.unitPrice && <p className="text-destructive text-xs">{errors.unitPrice}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="costPrice">Cost Price (ETB)</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            min={0}
            step={0.01}
            className="h-11"
            defaultValue={initial?.costPrice ?? ""}
          />
          {errors.costPrice && <p className="text-destructive text-xs">{errors.costPrice}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            className="h-11"
            defaultValue={
              initial?.expiryDate
                ? new Date(initial.expiryDate).toISOString().split("T")[0]
                : ""
            }
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            name="description"
            className="h-11"
            defaultValue={initial?.description ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="h-11" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save Changes" : "Add Medicine"}
        </Button>
      </div>
    </form>
  );
}

export function MedicinesClient({
  medicines,
  categories,
  searchQuery,
  selectedCategory,
  role,
  initialStockFilter,
  openAddOnMount = false,
}: {
  medicines: Medicine[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  role: "ADMIN" | "PHARMACIST";
  initialStockFilter?: "attention" | "expiring";
  openAddOnMount?: boolean;
}) {
  const isAdmin = role === "ADMIN";
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(openAddOnMount);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [stockFilter, setStockFilter] = useState<
    "all" | "attention" | "expiring"
  >(initialStockFilter ?? "all");
  const [, startTransition] = useTransition();

  function pushParams(
    q: string,
    category: string,
    stock: "all" | "attention" | "expiring",
  ) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (stock !== "all") params.set("stock", stock);
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/medicines");
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) ?? "";
    startTransition(() => pushParams(q, selectedCategory, stockFilter));
  }

  function handleCategoryChange(val: string | null) {
    const cat = !val || val === "all" ? "" : val;
    startTransition(() => pushParams(searchQuery, cat, stockFilter));
  }

  function setStock(next: "all" | "attention" | "expiring") {
    setStockFilter(next);
    startTransition(() => pushParams(searchQuery, selectedCategory, next));
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteMedicine(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  const now = new Date();
  const in90 = new Date();
  in90.setDate(in90.getDate() + 90);

  const visible = medicines.filter((m) => {
    if (stockFilter === "attention") {
      return getStockStatus(m.quantity) !== "OK";
    }
    if (stockFilter === "expiring") {
      if (!m.expiryDate || m.quantity <= 0) return false;
      const exp = new Date(m.expiryDate);
      return exp >= now && exp <= in90;
    }
    return true;
  });

  const lowCount = medicines.filter((m) => getStockStatus(m.quantity) === "Low").length;
  const outCount = medicines.filter((m) => getStockStatus(m.quantity) === "Out").length;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          name="q"
          placeholder="Search medicines…"
          defaultValue={searchQuery}
          className="h-11 flex-1 rounded-xl bg-card"
        />
        <Button type="submit" variant="outline" className="h-11 rounded-xl">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedCategory || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="h-10 w-[160px] rounded-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setStock(stockFilter === "attention" ? "all" : "attention")}
          className={cn(
            "h-10 rounded-full border px-3 text-xs font-medium transition-colors",
            stockFilter === "attention"
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          Low / out
        </button>

        <button
          type="button"
          onClick={() => setStock(stockFilter === "expiring" ? "all" : "expiring")}
          className={cn(
            "h-10 rounded-full border px-3 text-xs font-medium transition-colors",
            stockFilter === "expiring"
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          Expiring soon
        </button>

        {isAdmin && (
          <Button
            className="ml-auto h-10 rounded-xl"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            Add
          </Button>
        )}
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No medicines found.
          </p>
        ) : (
          visible.map((med) => {
            const status = getStockStatus(med.quantity);
            return (
              <div
                key={med.id}
                className={cn(
                  "leyu-list-row",
                  status === "Low" && "border-amber-200 bg-amber-50/40",
                  status === "Out" && "border-red-200 bg-red-50/40",
                )}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-semibold">{med.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {med.category} · Qty: {med.quantity} {med.unit}
                  </p>
                  <p className="leyu-money text-sm font-semibold">
                    Sell: {formatMoney(med.unitPrice)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StockPill status={status} />
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => setEditMedicine(med)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                        onClick={() => setDeleteTarget(med)}
                      >
                        Del
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="leyu-surface-card hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Sale Price</TableHead>
              {isAdmin && <TableHead className="text-right">Cost</TableHead>}
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 8 : 6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((med) => {
                const status = getStockStatus(med.quantity);
                return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell className="leyu-money text-right">
                      {med.quantity}
                    </TableCell>
                    <TableCell>{med.unit}</TableCell>
                    <TableCell className="leyu-money text-right">
                      {formatMoney(med.unitPrice)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="leyu-money text-right">
                        {formatMoney(med.costPrice ?? 0)}
                      </TableCell>
                    )}
                    <TableCell>
                      <StockPill status={status} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditMedicine(med)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(med)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Showing {visible.length} of {medicines.length} medicines. Low &lt;{" "}
        {LOW_STOCK_THRESHOLD} · Out = 0 · highlighted for review.
        {lowCount + outCount > 0
          ? ` (${lowCount} low, ${outCount} out)`
          : ""}
      </p>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <MedicineForm
            onSave={() => {
              setAddOpen(false);
              router.refresh();
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editMedicine}
        onOpenChange={(open) => !open && setEditMedicine(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          {editMedicine && (
            <MedicineForm
              initial={editMedicine}
              onSave={() => {
                setEditMedicine(null);
                router.refresh();
              }}
              onCancel={() => setEditMedicine(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This cannot be undone and
              will also delete associated sales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
