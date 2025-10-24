import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Package, User, MapPin, Calendar, DollarSign, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: number;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address_id: number | null;
  email: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  order_items: OrderItem[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { adminLogout } = useAdminAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError("Failed to load orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Status Updated",
        description: `Order #${orderId} status changed to ${newStatus}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
      console.error("Error updating order status:", err);
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete order");
      }

      // Remove from local state
      setOrders(orders.filter(order => order.id !== orderId));

      toast({
        title: "Order Deleted",
        description: `Order #${orderId} has been deleted`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete order",
      });
      console.error("Error deleting order:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (order: Order) => {
    const parts = [
      order.line1,
      order.line2,
      order.city,
      order.state,
      order.postal_code,
      order.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage orders and deliveries</p>
            </div>
            <Button onClick={adminLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === "placed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === "delivered").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.full_name}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - #{order.id}</DialogTitle>
                                  <DialogDescription>
                                    Complete order information and customer details
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Customer Information
                                      </h3>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><strong>Name:</strong> {selectedOrder.full_name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.email}</p>
                                      </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Shipping Address
                                      </h3>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p>{formatAddress(selectedOrder)}</p>
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Order Items
                                      </h3>
                                      <div className="space-y-2">
                                        {selectedOrder.order_items.map((item) => (
                                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <div>
                                              <p className="font-medium">{item.product_name}</p>
                                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Order Summary
                                      </h3>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                          <span>Total Amount:</span>
                                          <span className="font-bold">₹{selectedOrder.total_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                          <span>Order Date:</span>
                                          <span>{formatDate(selectedOrder.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                          <span>Status:</span>
                                          <Badge className={getStatusColor(selectedOrder.status)}>
                                            {selectedOrder.status.replace("_", " ")}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>

                            {order.status === "delivered" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
