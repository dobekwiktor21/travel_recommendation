document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector("form[role='search']");
  const searchInput = searchForm.querySelector("input[type='search']");
  const resetBtn = searchForm.querySelector("button[type='reset']");

  // 🟢 Elementy główne do ukrywania
  const mainTitle = document.querySelector("main h1");
  const mainText = document.querySelector("main p.lead");
  const learnBtn = document.querySelector("main a.btn");

  // 🟢 Główna sekcja
  const mainSection = document.getElementById("main");

  // 🟢 Kontener wyników (tworzymy raz)
  const resultsContainer = document.createElement("div");
  resultsContainer.classList.add("container", "mt-5", "text-dark");
  resultsContainer.style.position = "absolute";
  resultsContainer.style.top = "50%";
  resultsContainer.style.left = "50%";
  resultsContainer.style.transform = "translate(-50%, -50%)";
  resultsContainer.style.background = "rgba(255, 255, 255, 0.25)"; // przezroczyste tło
  resultsContainer.style.backdropFilter = "blur(8px)"; // efekt szkła
  resultsContainer.style.borderRadius = "16px";
  resultsContainer.style.padding = "20px 30px";
  resultsContainer.style.maxWidth = "900px";
  resultsContainer.style.width = "90%";
  resultsContainer.style.boxShadow = "0 4px 30px rgba(0,0,0,0.2)";
  resultsContainer.style.transition = "opacity 0.4s ease";
  resultsContainer.style.opacity = "0";
  resultsContainer.style.display = "none";
  mainSection.appendChild(resultsContainer);

  let travelData = {};

  // 🟡 Pobieranie danych JSON
  fetch("./travel_recommendation_api.json")
    .then((res) => res.json())
    .then((data) => (travelData = data))
    .catch((err) => {
      console.error(err);
      showResultsMessage("❌ Błąd wczytywania danych JSON.");
    });

  // 🟢 Obsługa wyszukiwania
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = "";

    if (!query) {
      hideResults();
      restoreMainContent();
      return;
    }

    // 🔥 Ukryj napisy główne
    hideMainContent();

    // Pokaż kontener wyników
    showResults();

    // Słowa kluczowe
    const synonyms = {
      plaża: "beaches",
      beach: "beaches",
      beaches: "beaches",
      świątynia: "temples",
      temple: "temples",
      temples: "temples",
      kraj: "countries",
      country: "countries",
      countries: "countries",
    };

    let category = synonyms[query];

    // Szukanie kraju po nazwie
    if (!category) {
      const countryMatch = travelData.countries?.find((c) =>
        c.name.toLowerCase().includes(query)
      );
      if (countryMatch) {
        category = "countries";
        displayCountry(countryMatch);
        return;
      }
    }

    if (!category || !travelData[category]) {
      showResultsMessage(`❌ Nie znaleziono wyników dla "${query}".`);
      return;
    }

    if (category === "countries") {
      travelData.countries.forEach((country) => displayCountry(country));
    } else {
      travelData[category].forEach((item) => displayCard(item));
    }
  });

  // 🔄 Reset – przywracanie wszystkiego
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    hideResults();
    restoreMainContent();
  });

  // 🧩 Funkcje pomocnicze
  function displayCard(place) {
    const card = document.createElement("div");
    card.classList.add("card", "mb-3", "shadow");
    card.style.maxWidth = "700px";
    card.style.background = "rgba(255,255,255,0.8)";
    card.innerHTML = `
      <div class="row g-0">
        <div class="col-md-5">
          <img src="${place.imageUrl}" class="img-fluid rounded-start" alt="${place.name}">
        </div>
        <div class="col-md-7 d-flex flex-column justify-content-center">
          <div class="card-body">
            <h5 class="card-title fw-bold">${place.name}</h5>
            <p class="card-text">${place.description}</p>
          </div>
        </div>
      </div>
    `;
    resultsContainer.appendChild(card);
  }

  function displayCountry(country) {
    const countryHeader = document.createElement("h3");
    countryHeader.classList.add("fw-bold", "mt-4");
    countryHeader.textContent = country.name;
    resultsContainer.appendChild(countryHeader);
    country.cities.forEach((city) => displayCard(city));
  }

  function showResultsMessage(msg) {
    resultsContainer.innerHTML = `<p class="text-danger text-center fs-5">${msg}</p>`;
  }

  function hideMainContent() {
    [mainTitle, mainText, learnBtn].forEach((el) => {
      if (el) {
        el.style.transition = "opacity 0.5s ease";
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      }
    });
  }

  function restoreMainContent() {
    [mainTitle, mainText, learnBtn].forEach((el) => {
      if (el) {
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
      }
    });
  }

  function showResults() {
    resultsContainer.style.display = "block";
    setTimeout(() => (resultsContainer.style.opacity = "1"), 10);
  }

  function hideResults() {
    resultsContainer.style.opacity = "0";
    setTimeout(() => (resultsContainer.style.display = "none"), 400);
  }
});
