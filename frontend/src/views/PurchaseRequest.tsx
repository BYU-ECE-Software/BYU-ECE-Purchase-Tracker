import FooterBar from '../components/footer';
import HeaderBar from '../components/header';
import PageTitle from '../components/pageTitle';
import PurchaseRequestForm from '../components/PurchaseRequestForm';

function PurchaseRequest() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="PURCHASE REQUEST FORM" />
      <PurchaseRequestForm />
      <FooterBar />
    </>
  );
}

export default PurchaseRequest;
