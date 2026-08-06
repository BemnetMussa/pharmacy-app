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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "@/features/medicines/actions";
import { medicineSchema } from "@/features/medicines/validators";
import type { MedicineInput } from "@/features/medicines/validators";
import { formatMoney } from "@/lib/utils";

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
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={initial?.name ?? ""} />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={initial?.category ?? ""}
          />
          {errors.category && (
            <p className="text-destructive text-xs">{errors.category}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            name="unit"
            placeholder="e.g. tablet, bottle"
            defaultValue={initial?.unit ?? "unit"}
          />
          {errors.unit && (
            <p className="text-destructive text-xs">{errors.unit}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            defaultValue={initial?.quantity ?? 0}
          />
          {errors.quantity && (
            <p className="text-destructive text-xs">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="unitPrice">Sale Price</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min={0}
            step={0.01}
            defaultValue={initial?.unitPrice ?? ""}
          />
          {errors.unitPrice && (
            <p className="text-destructive text-xs">{errors.unitPrice}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            min={0}
            step={0.01}
            defaultValue={initial?.costPrice ?? ""}
          />
          {errors.costPrice && (
            <p className="text-destructive text-xs">{errors.costPrice}</p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            defaultValue={
              initial?.expiryDate
                ? new Date(initial.expiryDate).toISOString().split("T")[0]
                : ""
            }
          />
          {errors.expiryDate && (
            <p className="text-destructive text-xs">{errors.expiryDate}</p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            name="description"
            defaultValue={initial?.description ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
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
}: {
  medicines: Medicine[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  role: "ADMIN" | "PHARMACIST";
}) {
  const isAdmin = role === "ADMIN";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [, startTransition] = useTransition();

  function pushParams(q: string, category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    if (category) params.set("category", category);
    else params.delete("category");
    router.push(`?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) ?? "";
    startTransition(() => pushParams(q, selectedCategory));
  }

  function handleCategoryChange(val: string | null) {
    const cat = !val || val === "all" ? "" : val;
    startTransition(() => pushParams(searchQuery, cat));
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteMedicine(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            name="q"
            placeholder="Search medicines…"
            defaultValue={searchQuery}
            className="max-w-sm"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Select
          value={selectedCategory || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdmin && <Button onClick={() => setAddOpen(true)}>Add Medicine</Button>}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Sale Price</TableHead>
              {isAdmin && <TableHead className="text-right">Cost Price</TableHead>}
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 9 : 7}
                  className="text-muted-foreground py-8 text-center"
                >
                  No medicines found.{isAdmin ? " Add your first medicine." : ""}
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((med) => {
                const isLow = med.quantity <= LOW_STOCK_THRESHOLD;
                const isExpired =
                  med.expiryDate && new Date(med.expiryDate) < new Date();
                return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell className="text-right">{med.quantity}</TableCell>
                    <TableCell>{med.unit}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(med.unitPrice)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {formatMoney(med.costPrice ?? 0)}
                      </TableCell>
                    )}
                    <TableCell>
                      {med.expiryDate
                        ? new Date(med.expiryDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isLow && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                        {isExpired && (
                          <Badge variant="outline" className="text-orange-500">
                            Expired
                          </Badge>
                        )}
                        {!isLow && !isExpired && (
                          <Badge variant="secondary">In Stock</Badge>
                        )}
                      </div>
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

      {/* Add Dialog */}
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

      {/* Edit Dialog */}
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

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone and will also delete all associated sales records.
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
