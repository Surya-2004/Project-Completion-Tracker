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
              <TableHead>Department</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.department}>
                <TableCell className="font-medium">{stat.department}</TableCell>
                <TableCell>{stat.students}</TableCell>
                <TableCell>{stat.teams}</TableCell>
                <TableCell>{stat.completionRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 