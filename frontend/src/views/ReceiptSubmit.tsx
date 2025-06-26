import FooterBar from '../components/footer';
import HeaderBar from '../components/header';
import PageTitle from '../components/pageTitle';
import ReceiptSubmitForm from '../components/ReceiptSubmitForm';

function ReceiptSubmit() {
  return (
    <>
      <HeaderBar />
      <PageTitle title="SUBMIT RECEIPTS" />
      <ReceiptSubmitForm />
      <FooterBar />
    </>
  );
}

export default ReceiptSubmit;
