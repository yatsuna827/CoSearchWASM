import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./global.css";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});

declare global {
  // 誰が何と言おうともletやconstではなくvarを使う
  var searchNearby:
    | undefined
    | ((params: {
        name: string;
        seedHex: string;
        max: number;
        ivsMin?: [number, number, number, number, number, number] | undefined;
        ivsMax?: [number, number, number, number, number, number] | undefined;
        nature: number;
      }) => any);
}
