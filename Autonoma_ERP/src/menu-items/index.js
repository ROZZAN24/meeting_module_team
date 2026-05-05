import admin from './admin';
import dashboard from './dashboard';
import { masters, hra, sm, pp, production, quality, sl, fa, dd, ms, qms, reports, erpSupport } from './erp';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [masters, hra, dd, sl, pp, production, quality, sm, fa, ms, qms, reports, admin, dashboard, erpSupport]
};

export default menuItems;
