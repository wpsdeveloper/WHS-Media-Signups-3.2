export function initializeLinks() {
  const scriptUrl = new URL(window.location.href);
  scriptUrl.search = "";
  scriptUrl.hash = "";

  const pageUrl = page => {
    const url = new URL(scriptUrl);
    if (page) url.searchParams.set("page", page);
    return url.toString();
  };

  document.querySelector("#attendance-link")?.setAttribute("href", pageUrl("attendance"));
  document.querySelector("#admin-link")?.setAttribute("href", pageUrl("admin"));
  document.querySelector("#attendance-link-updated")?.setAttribute("href", pageUrl("attendance"));

  const logoId = document.querySelector("#logo-image")?.dataset.logoId;
  if (logoId && logoId.charAt(0) !== "<") {
    document.querySelector("#logo-image").src = `https://lh3.googleusercontent.com/d/${logoId}`;
  }

  document.querySelectorAll(".schedule-link").forEach(link => {
    const docId = link.dataset.docId;
    if (docId && docId.charAt(0) !== "<") {
      link.href = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(docId)}/view`;
      link.classList.remove("d-none");
    }
  });
}
