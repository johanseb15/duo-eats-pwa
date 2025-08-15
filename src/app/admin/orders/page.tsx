
import { fetchAllOrders } from '@/app/actions';
import OrdersClient from './OrdersClient';


export default async function AdminOrdersPage() {
    const initialOrders = await fetchAllOrders();
    
    return <OrdersClient initialOrders={initialOrders} />;
}
