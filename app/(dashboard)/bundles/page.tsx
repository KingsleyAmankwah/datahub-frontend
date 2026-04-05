"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bundlesApi } from "@/lib/api";
import { formatGHS } from "@/lib/utils";
import { Plus, Pencil, PowerOff, Power, X } from "lucide-react";
import { toast } from "sonner";
import { Network } from "@/model/types";
import { Bundle, BundleFormData } from "@/model/interface";

const NETWORKS: Network[] = ["MTN", "TELECEL", "AIRTELTIGO"];

const networkBadge: Record<Network, string> = {
  MTN: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  TELECEL: "bg-red-500/10 text-red-600 dark:text-red-400",
  AIRTELTIGO: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const emptyForm: BundleFormData = {
  name: "",
  network: "MTN",
  dataMb: "",
  validityDays: "",
  costPrice: "",
  sellingPrice: "",
  description: "",
  sortOrder: "0",
};

function BundleModal({
  bundle,
  onClose,
}: {
  bundle?: Bundle;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!bundle;

  const [form, setForm] = useState<BundleFormData>(
    bundle
      ? {
          name: bundle.name,
          network: bundle.network,
          dataMb: String(bundle.dataMb ?? ""),
          validityDays: String(bundle.validityDays),
          costPrice: (bundle.costPrice / 100).toFixed(2),
          sellingPrice: (bundle.sellingPrice / 100).toFixed(2),
          description: bundle.description ?? "",
          sortOrder: String(bundle.sortOrder),
        }
      : emptyForm,
  );

  const createMutation = useMutation({
    mutationFn: () =>
      bundlesApi.create({
        name: form.name,
        network: form.network,
        dataMb: Number(form.dataMb),
        validityDays: Number(form.validityDays),
        costPrice: Math.round(Number(form.costPrice) * 100),
        sellingPrice: Math.round(Number(form.sellingPrice) * 100),
        description: form.description || undefined,
        sortOrder: Number(form.sortOrder),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      toast.success("Bundle created");
      onClose();
    },
    onError: () => toast.error("Failed to create bundle"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      bundlesApi.update(bundle!.id, {
        name: form.name,
        costPrice: Math.round(Number(form.costPrice) * 100),
        sellingPrice: Math.round(Number(form.sellingPrice) * 100),
        sortOrder: Number(form.sortOrder),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      toast.success("Bundle updated");
      onClose();
    },
    onError: () => toast.error("Failed to update bundle"),
  });

  const margin =
    Number(form.sellingPrice) > 0 && Number(form.costPrice) > 0
      ? (Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) updateMutation.mutate();
    else createMutation.mutate();
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  const inputClass =
    "w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const labelClass = "block text-xs font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            {isEdit ? "Edit bundle" : "Add bundle"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Bundle name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. MTN-5GB-7D"
              required
              className={inputClass}
            />
          </div>

          {!isEdit && (
            <div>
              <label className={labelClass}>Network</label>
              <select
                value={form.network}
                onChange={(e) =>
                  setForm({ ...form, network: e.target.value as Network })
                }
                className={inputClass}
              >
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Data (MB)</label>
                <input
                  type="number"
                  value={form.dataMb}
                  onChange={(e) => setForm({ ...form, dataMb: e.target.value })}
                  placeholder="1024"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Validity (days)</label>
                <input
                  type="number"
                  value={form.validityDays}
                  onChange={(e) =>
                    setForm({ ...form, validityDays: e.target.value })
                  }
                  placeholder="7"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Cost price (GHS)</label>
              <input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value })
                }
                placeholder="3.80"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Selling price (GHS)</label>
              <input
                type="number"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
                placeholder="4.30"
                required
                className={inputClass}
              />
            </div>
          </div>

          {margin && (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Margin: <span className="font-semibold">GH₵{margin}</span> per
                sale
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>
              Sort order{" "}
              <span className="text-muted-foreground">
                (lower = appears first in USSD)
              </span>
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 text-muted-foreground text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !form.name || !form.costPrice || !form.sellingPrice
              }
              className="flex-1 py-2 px-4 cursor-pointer bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create bundle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BundlesPage() {
  const queryClient = useQueryClient();
  const [activeNetwork, setActiveNetwork] = useState<Network | "ALL">("ALL");
  const [modal, setModal] = useState<"create" | Bundle | null>(null);

  const { data: bundles = [], isLoading } = useQuery<Bundle[]>({
    queryKey: ["bundles"],
    queryFn: () => bundlesApi.getAll(),
  });

  const toggleMutation = useMutation({
    mutationFn: (bundle: Bundle) =>
      bundlesApi.update(bundle.id, { isActive: !bundle.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] });
      toast.success("Bundle updated");
    },
    onError: () => toast.error("Failed to update bundle"),
  });

  const filtered =
    activeNetwork === "ALL"
      ? bundles
      : bundles.filter((b) => b.network === activeNetwork);

  const grouped = NETWORKS.reduce(
    (acc, n) => {
      acc[n] = filtered.filter((b) => b.network === n);
      return acc;
    },
    {} as Record<Network, Bundle[]>,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bundles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bundles.length} total bundles
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add bundle
        </button>
      </div>

      {/* Network filter */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {(["ALL", ...NETWORKS] as const).map((n) => (
          <button
            key={n}
            onClick={() => setActiveNetwork(n)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeNetwork === n
                ? "bg-emerald-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Bundle tables by network */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        NETWORKS.map((network) => {
          const networkBundles = grouped[network];
          if (activeNetwork !== "ALL" && activeNetwork !== network) return null;
          return (
            <div
              key={network}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${networkBadge[network]}`}
                  >
                    {network}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {networkBundles.length} bundles
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Name",
                        "Size",
                        "Validity",
                        "Cost",
                        "Price",
                        "Margin",
                        "Order",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {networkBundles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-8 text-center text-sm text-muted-foreground"
                        >
                          No bundles for {network}
                        </td>
                      </tr>
                    ) : (
                      networkBundles.map((bundle) => (
                        <tr
                          key={bundle.id}
                          className={`border-b border-border/50 transition-colors ${
                            bundle.isActive ? "hover:bg-muted/50" : "opacity-50"
                          }`}
                        >
                          <td className="px-5 py-3 text-sm font-medium text-foreground">
                            {bundle.name}
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground/80">
                            {bundle.dataMb
                              ? bundle.dataMb >= 1024
                                ? `${(bundle.dataMb / 1024).toFixed(0)}GB`
                                : `${bundle.dataMb}MB`
                              : "—"}
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground/80">
                            {bundle.validityDays}d
                          </td>
                          <td className="px-5 py-3 text-sm text-foreground/80">
                            {formatGHS(bundle.costPrice)}
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">
                            {formatGHS(bundle.sellingPrice)}
                          </td>
                          <td className="px-5 py-3 text-sm text-emerald-500">
                            {formatGHS(bundle.sellingPrice - bundle.costPrice)}
                          </td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">
                            #{bundle.sortOrder}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                bundle.isActive
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {bundle.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setModal(bundle)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleMutation.mutate(bundle)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  bundle.isActive
                                    ? "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                                }`}
                                title={
                                  bundle.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {bundle.isActive ? (
                                  <PowerOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Power className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      {modal && (
        <BundleModal
          bundle={modal === "create" ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
