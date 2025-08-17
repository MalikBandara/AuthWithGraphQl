import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Amplify } from "aws-amplify";
import App from "./App.jsx";
import { Authenticator } from "@aws-amplify/ui-react";

import awsExports from "./aws-exports.js";

Amplify.configure(awsExports);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Authenticator className="bg-blue-100 justify-center items-center min-h-screen">
      <App />
    </Authenticator>
  </StrictMode>
);
