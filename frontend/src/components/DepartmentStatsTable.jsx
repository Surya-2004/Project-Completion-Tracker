import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DepartmentStatsTable({ stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-center">Teams</TableHead>
              <TableHead className="text-center">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.department}>
                <TableCell className="text-center font-medium">{stat.department}</TableCell>
                <TableCell className="text-center">{stat.students}</TableCell>
                <TableCell className="text-center">{stat.teams}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stat.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.completionRate}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 