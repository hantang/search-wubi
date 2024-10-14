const dataFile = "data/data.json";
let data = {};
fetch(dataFile)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((jsonData) => {
    data = jsonData;
  })
  .catch((error) => {
    console.error("Read JSON error:", error);
  });

// event
document.getElementById("query-button").addEventListener("click", queryHanzi);
document
  .getElementById("query-text")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      queryHanzi();
    }
  });
