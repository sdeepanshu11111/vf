"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Loads the Intercom widget and boots it using NextAuth session user data.
 * We intentionally avoid `@intercom/messenger-js-sdk` here and use the official
 * `widget.intercom.io` snippet so we don't need extra npm installs.
 */
export default function IntercomInitializer() {
  const { data: session, status } = useSession();
  const bootedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    const appId =
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID ||
      process.env.NEXT_PUBLIC_INTERCOM_APP_ID_DEV ||
      "sm08dgcp";

    if (typeof window === "undefined" || !appId) return;

    // Load the Intercom widget snippet once.
    if (!document.getElementById("intercom-widget-script")) {
      // eslint-disable-next-line no-undef
      window.intercomSettings = { app_id: appId };

      // eslint-disable-next-line no-inner-declarations
      (function () {
        const w = window;
        const ic = w.Intercom;

        if (typeof ic === "function") {
          // Intercom already initialized.
          ic("update", w.intercomSettings);
          return;
        }

        const d = document;
        const i = function () {
          // eslint-disable-next-line prefer-rest-params
          i.c(arguments);
        };
        i.q = [];
        // eslint-disable-next-line no-param-reassign
        i.c = function (args) {
          i.q.push(args);
        };
        w.Intercom = i;

        const l = function () {
          const s = d.createElement("script");
          s.type = "text/javascript";
          s.async = true;
          s.id = "intercom-widget-script";
          s.src = `https://widget.intercom.io/widget/${w.intercomSettings.app_id}`;
          const x = d.getElementsByTagName("script")[0];
          x.parentNode.insertBefore(s, x);
        };

        if (document.readyState === "complete") {
          l();
        } else if (w.attachEvent) {
          w.attachEvent("onload", l);
        } else {
          w.addEventListener("load", l, false);
        }
      })();
    }

    // Boot or update with current user.
    const user = session?.user;
    const baseSettings = { app_id: appId };

    // On first load (even unauthenticated), boot so the widget is usable.
    const globalBooted = Boolean(
      typeof window !== "undefined" && window.__VF_INTERCOM_BOOTED__
    );
    if (!bootedRef.current && !globalBooted) {
      if (user) {
        window.Intercom("boot", {
          ...baseSettings,
          user_id: user.id,
          name: user.name,
          email: user.email,
        });
      } else {
        window.Intercom("boot", baseSettings);
      }
      bootedRef.current = true;
      window.__VF_INTERCOM_BOOTED__ = true;
      return;
    }

    if (user) {
      window.Intercom("update", {
        ...baseSettings,
        user_id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      // If a user logs out, shutdown to avoid stale identity.
      window.Intercom("shutdown");
      bootedRef.current = false;
      window.__VF_INTERCOM_BOOTED__ = false;
    }
  }, [session, status]);

  return null;
}

