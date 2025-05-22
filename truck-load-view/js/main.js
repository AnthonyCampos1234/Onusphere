document.addEventListener("DOMContentLoaded", () => {
  const viewer = new PackingViewer("viewer");
  viewer.render();

  document.getElementById("next-step").addEventListener("click", async () => {
    const response = await "http://localhost:5000/api/next-placement";
    const data = await response.json();
    // Update the viewer with the new placement
  });
});
