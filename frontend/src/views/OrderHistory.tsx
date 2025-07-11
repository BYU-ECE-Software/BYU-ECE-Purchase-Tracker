import FooterBar from '../components/footer';
import HeaderBar from '../components/header';
import PageTitle from '../components/pageTitle';
import StudentOrderHistoryList from '../components/StudentOrderHistoryList';

function OrderHistory() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="MY ORDERS" />
      <StudentOrderHistoryList />
      <FooterBar />
    </>
  );
}

export default OrderHistory;
