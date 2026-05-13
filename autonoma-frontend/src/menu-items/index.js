import admin from './admin';
import dashboard from './dashboard';
import { masters, hra, sm, qms, reports, erpSupport } from './erp';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [masters, hra, sm, qms, reports, admin, dashboard, erpSupport]
};

export default menuItems;
