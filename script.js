// script.js
"use strict";

/**
 * Official Joke API endpoint
 * Docs/usage example: https://official-joke-api.appspot.com/random_joke
 */
const API_URL = "https://official-joke-api.appspot.com/random_joke";

// DOM references
const elements = {
  setup: document.getElementById("joke-setup"),
  status: document.getElementById("status-text"),
  punchline: document.getElementById("joke-punchline"),
  id: document.getElementById("joke-id"),
  type: document.getElementById("joke-type"),
  button: document.getElementById("generate-joke-btn"),
};

function setLoading(isLoading) {
  if (!elements.button) return;

  elements.button.disabled = isLoading;
  elements.button.textContent = isLoading ? "Se încarcă..." : "Generează glumă";

  if (elements.status) {
    elements.status.textContent = isLoading
      ? "Se încarcă gluma..."
      : "Apasă pe buton pentru o glumă 😄";
  }
}

function showError(message) {
  // Punem mesajul de eroare în zona de setup/punchline (vizibil 100% cu structura actuală)
  if (elements.setup) elements.setup.textContent = message;
  if (elements.punchline) elements.punchline.textContent = "—";
  if (elements.id) elements.id.textContent = "—";
  if (elements.type) elements.type.textContent = "—";
}

function renderJoke(joke) {
  const { setup, punchline, id, type } = joke;

  if (elements.setup) elements.setup.textContent = setup ?? "—";
  if (elements.punchline) elements.punchline.textContent = punchline ?? "—";
  if (elements.id) elements.id.textContent = id ?? "—";
  if (elements.type) elements.type.textContent = type ?? "—";
}

async function fetchRandomJoke() {
  console.log("[JokeApp] Cerere trimisă către API:", API_URL);

  // Timeout simplu (dacă API-ul “nu răspunde”)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validare minimală a structurii
    if (!data || typeof data.setup !== "string" || typeof data.punchline !== "string") {
      throw new Error("Răspuns invalid de la API (lipsește setup/punchline).");
    }

    console.log("[JokeApp] Date primite cu succes:", data);
    return data;
  } catch (error) {
    console.error("[JokeApp] Eroare la fetch:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleGenerateJoke() {
  setLoading(true);

  try {
    const joke = await fetchRandomJoke();
    renderJoke(joke);
  } catch (error) {
    // Dacă API-ul nu răspunde (AbortError) sau orice altă problemă
    const isTimeout = error?.name === "AbortError";
    const message = isTimeout
      ? "Eroare: API-ul nu răspunde (timeout). Încearcă din nou."
      : `Eroare: Nu am putut încărca gluma. (${error.message})`;

    console.log("[JokeApp] Afișez eroarea în pagină.");
    showError(message);
  } finally {
    setLoading(false);
  }
}

function init() {
  console.log("[JokeApp] Inițializare aplicație.");

  if (!elements.button) {
    console.error("[JokeApp] Nu găsesc butonul #generate-joke-btn în pagină.");
    return;
  }

  elements.button.addEventListener("click", handleGenerateJoke);
}

init();
