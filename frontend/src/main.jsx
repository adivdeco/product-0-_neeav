import { StrictMode } from 'react'
import { BrowserRouter } from "react-router";
import { createRoot } from 'react-dom/client'
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store/store.js";
// import { Auth0Provider } from '@auth0/auth0-react';
// import OneSignal from "onesignal-js";

// async function initOneSignal() {
//   await OneSignal.init({
//     appId: "67c30379-4085-4906-961e-d0c6035f985f",
//     allowLocalhostAsSecureOrigin: true,
//   });
// }
// initOneSignal();

// const domain = import.meta.env.VITE_AUTH0_DOMAIN;
// const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// if (!domain || !clientId) {
//   console.warn('Auth0 config missing: VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID not set');
// }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* <Auth0Provider
          domain={domain}
          clientId={clientId}
          authorizationParams={{ redirect_uri: window.location.origin }}
        > */}
        <App />
        {/* </Auth0Provider> */}
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
