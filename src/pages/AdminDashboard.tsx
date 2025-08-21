import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Building2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminStatsCard } from '@/components/AdminStatsCard';
import { BusinessTable } from '@/components/BusinessTable';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { stats, businesses, loading, error, refreshData } = useAdminData();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refreshData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const handleViewBusiness = (userId: string) => {
    // For now, just show a toast. You can implement detailed view later
    toast({
      title: "Business Details",
      description: `View details for business with user ID: ${userId}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to App
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatsCard
              title="Total Users"
              value={stats.total_users}
              icon={Users}
              description="Registered platform users"
            />
            <AdminStatsCard
              title="Active Businesses"
              value={stats.total_businesses}
              icon={Building2}
              description="Businesses using the platform"
            />
            <AdminStatsCard
              title="Total Transactions"
              value={stats.total_transactions}
              icon={DollarSign}
              description="All-time transactions"
            />
            <AdminStatsCard
              title="Today's Transactions"
              value={stats.today_transactions}
              icon={TrendingUp}
              description="Transactions today"
            />
          </div>
        )}

        {/* Business Analytics Table */}
        <BusinessTable 
          businesses={businesses} 
          onViewBusiness={handleViewBusiness}
        />

        {/* Platform Overview */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">User Growth Rate</span>
                <span className="font-medium text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Business Adoption</span>
                <span className="font-medium text-blue-600">+8.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction Volume</span>
                <span className="font-medium text-purple-600">+15.7%</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage User Roles
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Export Business Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;