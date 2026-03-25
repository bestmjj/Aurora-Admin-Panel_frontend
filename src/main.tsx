import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import i18n from "./i18n";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import ThemedSuspense from "./features/ThemedSuspense";
import { ApolloProvider } from "@apollo/client";
import { client } from './graphql'
import './tailwind-safelist'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider>
        <TooltipProvider>
          <HelmetProvider>
            <Suspense fallback={<ThemedSuspense />}>
              <App />
            </Suspense>
          </HelmetProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
