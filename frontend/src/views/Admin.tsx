import { useState } from 'react';
import HeaderBar from '../components/header';
import FooterBar from '../components/footer';
import PageTitle from '../components/pageTitle';
import AdminTabs from '../components/SiteAdminTabs';
import AdminCrudPanel from '../components/AdminCrudPanel';
import { crudConfigs } from '../config/crudConfig';

// Get a union type of all keys from crudConfigs
// This infers types properly for AdminCrudPanel props
// We also assert the key list as const to preserve exact types
const tabNames = Object.keys(crudConfigs) as (keyof typeof crudConfigs)[];

function Admin() {
  const [activeTab, setActiveTab] = useState<(typeof tabNames)[number]>(
    tabNames[0]
  );

  return (
    <>
      <HeaderBar />
      <PageTitle title="SITE ADMIN" />
      <div className="flex px-6 py-10 gap-6">
        <AdminTabs
          tabs={tabNames}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1">
          <AdminCrudPanel
            title={activeTab}
            config={crudConfigs[activeTab] as any}
          />
        </div>
      </div>
      <FooterBar />
    </>
  );
}

export default Admin;
