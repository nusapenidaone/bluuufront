import "./index.css";
import Home from "./home.jsx";
import Private from "./private.jsx";
import Shared from "./shared.jsx";
import Checkout from "./Checkout.jsx";
import Payment from "./Payment.jsx";

import { CurrencyProvider } from "./CurrencyContext.jsx";
import { ToursProvider } from "./ToursContext.jsx";
import { ExtrasProvider } from "./ExtrasContext.jsx";
import UnifiedSwitcher from "./components/UnifiedSwitcher.jsx";




export default function App() {
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const path = rawPath.replace(/\/+$/, "") || "/";


  const content = (() => {
    if (path === "/private" || path === "/test/private") {
      return <Private />;
    }



    if (path === "/shared" || path === "/test/shared") {
      return <Shared />;
    }

    if (path === "/checkout") {
      return <Checkout />;
    }

    if (path === "/payment") {
      return <Payment />;
    }

    return <Home />;
  })();

  return (
    <CurrencyProvider>
      <ToursProvider>
        <ExtrasProvider>
          <UnifiedSwitcher showFloatingButton={false} />
          {content}
        </ExtrasProvider>
      </ToursProvider>
    </CurrencyProvider>

  );
}



