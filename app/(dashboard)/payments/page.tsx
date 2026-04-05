import { Construction } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Construction className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">Not available</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Payment data is processed via MoMo webhook callbacks and is not exposed
        through an admin endpoint.
      </p>
    </div>
  );
}
