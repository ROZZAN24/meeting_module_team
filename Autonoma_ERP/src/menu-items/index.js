import admin from './admin';
import dashboard from './dashboard';
import { masters, hra, sm, pp, production, quality, sl, fa, dd, ms, qms, reports, erpSupport } from './erp';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [admin, dashboard, masters, hra, sm, pp, production, quality, sl, fa, dd, ms, qms, reports, erpSupport]
};

export default menuItems;
