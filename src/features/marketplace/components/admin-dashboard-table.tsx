import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@marketplace/components/ui/table";
import { Button } from "@marketplace/components/ui/button";
import { Link } from "react-router-dom";
import type { IPost, IUserRequest } from "@marketplace/actions/types";
import { IndianRupee } from "lucide-react";

export function DashboardTable({
  type,
  posts,
  requests,
}: {
  type: "post" | "request";
  posts?: IPost[];
  requests?: IUserRequest[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Status</TableHead>
          <TableHead>Title</TableHead>
          {posts && <TableHead>Amount</TableHead>}
          {posts && <TableHead>Category</TableHead>}
          <TableHead> </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(posts &&
          posts?.length > 0 &&
          posts.map((item) => (
            <TableRow key={item.id} className="">
              <TableCell className="font-medium">
                {item.isApproved ? "Approved" : "Pending"}
              </TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell className="">{item.price}</TableCell>
              <TableCell className="">{item.category}</TableCell>
              <TableCell className="text-right">
                <Link to={`/admin/dashboard/posts/${item.id}`}>
                  <Button className="bg-primary hover:bg-market-accent text-white">
                    View details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))) ||
          (requests &&
            requests?.length > 0 &&
            requests.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.isApproved ? "Approved" : "Pending"}
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/admin/dashboard/requests/${item.id}`}>
                    <Button className="bg-primary hover:bg-market-accent text-white">
                      View details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )))}
      </TableBody>
    </Table>
  );
}
