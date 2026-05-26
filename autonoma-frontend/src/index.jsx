import { createRoot } from 'react-dom/client';

// third party
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// project imports
import App from 'App';
import { store, persister } from 'store';
import * as serviceWorker from 'serviceWorker';
import reportWebVitals from 'reportWebVitals';
import { ConfigProvider } from 'contexts/ConfigContext';

// style + assets
import 'assets/scss/style.scss';

// yet-another-react-lightbox
import 'yet-another-react-lightbox/styles.css';

// map
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-react-components/style.css';

// google-fonts
// Preload critical fonts (for example, Roboto) to reduce FOUC.
// (In a real app, you might add a <link rel="preload" as="font" href="..." crossorigin="anonymous" /> tag in your HTML (or via a plugin) for each critical font.)
// (Below is a dummy example – replace with your actual font URLs if needed.)
// <link rel="preload" as="font" href="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2" crossorigin="anonymous" />
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// ==============================|| GLOBAL ERROR CATCHERS ||============================== //

let lastAlertedMsg = '';
let lastAlertedTime = 0;

window.showAlert = function (msg) {
  const now = Date.now();
  if (msg === lastAlertedMsg && now - lastAlertedTime < 1000) {
    return;
  }
  lastAlertedMsg = msg;
  lastAlertedTime = now;
  alert(msg);
};

window.onerror = function (message, source, lineno, colno, error) {
  const errMsg = error?.stack || `${message} at ${source}:${lineno}:${colno}`;
  console.error('[Global UI Error]', errMsg);
  window.showAlert(`UI Rendering / JavaScript Error:\n\n${message}\n\nLocation: ${source}:${lineno}\n\nPlease check console for details.`);
  return false; // let browser print it to console too
};

window.addEventListener('unhandledrejection', function (event) {
  const reason = event.reason;
  // If it's a promise rejection representing an API error, axios interceptor already handles it
  if (reason && (reason.config || reason.isAxiosError)) {
    return;
  }
  const errMsg = reason?.stack || reason?.message || (typeof reason === 'string' ? reason : JSON.stringify(reason)) || 'Unhandled promise rejection';
  console.error('[Global Unhandled Rejection]', errMsg);
  window.showAlert(`Unhandled Promise Rejection:\n\n${errMsg}`);
});

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persister}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </PersistGate>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
