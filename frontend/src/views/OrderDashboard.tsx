import AdminDashboard from '../components/AdminDashBoard';
import FooterBar from '../components/footer';
import HeaderBar from '../components/header';
import PageTitle from '../components/pageTitle';

function OrderDashboard() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="ORDER DASHBOARD" />
      <AdminDashboard />
      <FooterBar />
    </>
  );
}

export default OrderDashboard;
