import { Construction } from "lucide-react";

export default function FulfillmentPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Construction className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground">Not available</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Fulfillment is handled internally by the service and has no admin
        endpoint.
      </p>
    </div>
  );
}
