// Contact form: validation, sending, and pre-selection from ?pack= and ?need= in the link.

import { settings } from "./settings.js";
import { getLanguage, translate } from "./translator.js?v=7f3a9c2e";

export function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector("button[type=submit]");
  const params = new URLSearchParams(location.search);

  for (const [param, field] of [["pack", "pack"], ["need", "need"]]) {
    const wanted = params.get(param);
    const option = wanted && form.elements[field].querySelector(`option[data-slug="${wanted}"]`);
    if (option) form.elements[field].value = option.value;
  }

  const say = (key, kind) => {
    status.textContent = translate(key) || "";
    status.className = `form-status${kind ? ` is-${kind}` : ""}`;
  };

  function validate() {
    let firstBad = null;
    let message = null;
    form.querySelectorAll("[required]").forEach((field) => {
      const empty = !field.value.trim();
      const badEmail = field.type === "email" && !empty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      const invalid = empty || badEmail;
      field.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstBad) { firstBad = field; message = badEmail ? "form.invalidEmail" : "form.required"; }
    });
    return { firstBad, message };
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { firstBad, message } = validate();
    if (firstBad) { say(message, "error"); firstBad.focus(); return; }
    if (form.elements._gotcha.value) return; // spam robot

    form.elements.language.value = getLanguage();
    const data = Object.fromEntries(new FormData(form));
    const endpoint = settings.formEndpoint;

    if (!endpoint) {
      if (!settings.email) { say("form.notConfigured", "error"); return; }
      const body = [
        `${translate("form.name")}: ${data.name}`,
        `${translate("form.email")}: ${data.email}`,
        `${translate("form.company")}: ${data.company || "-"}`,
        `${translate("form.need")}: ${data.need}`,
        `${translate("form.pack")}: ${data.pack || "-"}`,
        "",
        data.message,
      ].join("\n");
      location.href = `mailto:${settings.email}?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    button.disabled = true;
    say("form.sending");
    try {
      const asJson = endpoint.startsWith("/");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: asJson ? { "Content-Type": "application/json" } : { Accept: "application/json" },
        body: asJson ? JSON.stringify(data) : new FormData(form),
      });
      if (!response.ok) throw new Error(`Form error ${response.status}`);
      form.reset();
      say("form.success", "success");
    } catch (error) {
      console.error(error);
      say("form.error", "error");
    } finally {
      button.disabled = false;
    }
  });

  form.addEventListener("input", (event) => {
    if (event.target.getAttribute("aria-invalid") === "true") event.target.setAttribute("aria-invalid", "false");
  });
}
