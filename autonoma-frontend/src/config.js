export const DASHBOARD_PATH = '/dashboard/user-task-queue';
export const HORIZONTAL_MAX_ITEM = 20;

export const CSS_VAR_PREFIX = '';

export let MenuOrientation;

(function (MenuOrientation) {
  MenuOrientation['VERTICAL'] = 'vertical';
  MenuOrientation['HORIZONTAL'] = 'horizontal';
})(MenuOrientation || (MenuOrientation = {}));

export let ThemeMode;

(function (ThemeMode) {
  ThemeMode['LIGHT'] = 'light';
  ThemeMode['DARK'] = 'dark';
  ThemeMode['SYSTEM'] = 'system';
})(ThemeMode || (ThemeMode = {}));

export let ThemeDirection;

(function (ThemeDirection) {
  ThemeDirection['LTR'] = 'ltr';
  ThemeDirection['RTL'] = 'rtl';
})(ThemeDirection || (ThemeDirection = {}));

export let AuthProvider;

(function (AuthProvider) {
  AuthProvider['JWT'] = 'jwt';
  AuthProvider['FIREBASE'] = 'firebase';
  AuthProvider['AUTH0'] = 'auth0';
  AuthProvider['AWS'] = 'aws';
  AuthProvider['SUPABASE'] = 'supabase';
})(AuthProvider || (AuthProvider = {}));

export let DashboardLayout;

(function (DashboardLayout) {
  DashboardLayout['GLASS'] = 'glass';
  DashboardLayout['CLASSIC'] = 'classic';
})(DashboardLayout || (DashboardLayout = {}));

export let DropzopType;

(function (DropzopType) {
  DropzopType['default'] = 'DEFAULT';
  DropzopType['standard'] = 'STANDARD';
})(DropzopType || (DropzopType = {}));

export const APP_AUTH = AuthProvider.JWT;
export const DEFAULT_THEME_MODE = ThemeMode.SYSTEM;

const config = {
  menuOrientation: MenuOrientation.VERTICAL,
  miniDrawer: false,
  fontFamily: `'Roboto', sans-serif`,
  borderRadius: 8,
  outlinedFilled: true,
  presetColor: 'default',
  i18n: 'en',
  themeDirection: ThemeDirection.LTR,
  container: false,
  dashboardLayout: 'glass'
};

export default config;
