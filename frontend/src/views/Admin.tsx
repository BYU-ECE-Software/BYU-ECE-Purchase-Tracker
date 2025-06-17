import AdminDashboard from '../components/AdminDashBoard';
import FooterBar from '../components/footer';
import HeaderBar from '../components/header';
import PageTitle from '../components/pageTitle';

function Admin() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="ORDERS" />
      <AdminDashboard />
      <FooterBar />
    </>
  );
}

export default Admin;
