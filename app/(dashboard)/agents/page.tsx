"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Agent } from "@/model/interface";
import { AgentStatus } from "@/model/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

const statusStyles: Record<AgentStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-500",
  ACTIVE: "bg-emerald-500/10 text-emerald-500",
  SUSPENDED: "bg-red-500/10 text-red-500",
};

function formatGHS(pesewas: number) {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

type PendingAction = { type: "approve" | "suspend"; agent: Agent } | null;

function ConfirmDialog({
  action,
  onConfirm,
  onCancel,
  loading,
}: {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!action) return null;
  const isApprove = action.type === "approve";
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve agent" : "Suspend agent"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? `Approve ${action.agent.businessName}? They will be able to place orders immediately.`
              : `Suspend ${action.agent.businessName}? They will lose access until reinstated.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={isApprove ? "default" : "destructive"}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {isApprove ? "Approve" : "Suspend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentActions({
  agent,
  onAction,
}: {
  agent: Agent;
  onAction: (action: PendingAction) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {agent.status !== "ACTIVE" && (
        <button
          onClick={() => onAction({ type: "approve", agent })}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
        >
          Approve
        </button>
      )}
      {agent.status !== "SUSPENDED" && (
        <button
          onClick={() => onAction({ type: "suspend", agent })}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          Suspend
        </button>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [status, setStatus] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["agents", status],
    queryFn: () => agentsApi.list(status || undefined),
  });

  const mutation = useMutation({
    mutationFn: () =>
      pendingAction?.type === "approve"
        ? agentsApi.approve(pendingAction.agent.id)
        : agentsApi.suspend(pendingAction!.agent.id),
    onSuccess: () => {
      toast.success(
        pendingAction?.type === "approve"
          ? `${pendingAction.agent.businessName} approved`
          : `${pendingAction!.agent.businessName} suspended`,
      );
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      setPendingAction(null);
    },
    onError: () => {
      toast.error(
        `Failed to ${
          pendingAction?.type === "approve" ? "approve" : "suspend"
        } agent`,
      );
    },
  });

  return (
    <div className="space-y-5">
      <ConfirmDialog
        action={pendingAction}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setPendingAction(null)}
        loading={mutation.isPending}
      />
      <div>
        <h1 className="text-xl font-semibold text-foreground">Agents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {agents.length} total agents
        </p>
      </div>

      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              status === f.value
                ? "bg-emerald-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Business
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Owner
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Wallet
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                        {agent.businessName}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {agent.user.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {agent.user.phoneNumber}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/80">
                        {formatGHS(agent.user.walletBalance)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[agent.status]}`}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatDateTime(agent.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <AgentActions
                          agent={agent}
                          onAction={setPendingAction}
                        />
                      </td>
                    </tr>
                  ))}
              {!isLoading && agents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No agents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
