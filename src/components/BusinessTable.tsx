import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BusinessData {
  business_name: string;
  user_id: string;
  business_created: string;
  transaction_count: number;
  total_amount: number;
  last_transaction: string;
  subscription_status?: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface BusinessTableProps {
  businesses: BusinessData[];
  onViewBusiness?: (userId: string) => void;
}

export function BusinessTable({ businesses, onViewBusiness }: BusinessTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityStatus = (lastTransaction: string) => {
    if (!lastTransaction) return 'inactive';
    
    const daysSinceLastTransaction = Math.floor(
      (Date.now() - new Date(lastTransaction).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastTransaction <= 7) return 'active';
    if (daysSinceLastTransaction <= 30) return 'moderate';
    return 'inactive';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'moderate':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Business Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => {
                const activityStatus = getActivityStatus(business.last_transaction);
                
                return (
                  <TableRow key={business.user_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {business.business_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(business.business_created)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {business.subscription_status ? (
                          <>
                            <Badge variant="default" className="mb-1">
                              {business.subscription_tier || 'Active'}
                            </Badge>
                            {business.subscription_end && (
                              <span className="text-xs text-muted-foreground">
                                Until {formatDate(business.subscription_end)}
                              </span>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{business.transaction_count}</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(business.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(business.last_transaction)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(activityStatus)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewBusiness?.(business.user_id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {businesses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No businesses found
          </div>
        )}
      </CardContent>
    </Card>
  );
}