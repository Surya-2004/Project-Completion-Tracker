import { Card, CardContent } from "@/components/ui/card"

export default function StatCard({ label, value, icon }) {
  return (
    <Card className="transition-transform hover:scale-105">
      <CardContent className="p-6 flex flex-col items-center">
        {icon && <div className="mb-2 text-muted-foreground">{icon}</div>}
        <div className="text-4xl font-extrabold text-foreground drop-shadow">{value}</div>
        <div className="text-muted-foreground mt-2 text-center font-semibold">{label}</div>
      </CardContent>
    </Card>
  );
} 