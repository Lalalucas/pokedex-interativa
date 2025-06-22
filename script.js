// Elementos do DOM
const pokedex = document.getElementById('pokedex');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-button');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

// Configuração inicial
const POKEMONS_PER_PAGE = 12;
const FIRST_GEN_TOTAL = 151;
let currentPage = 1;
let totalPages = Math.ceil(FIRST_GEN_TOTAL / POKEMONS_PER_PAGE);

// Função para exibir o loader
function showLoader(show = true) {
  loader.style.display = show ? 'block' : 'none';
}

// Capitaliza strings
const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Renderiza os Pokémon na página
function renderPokemons(pokemons, page) {
  pokedex.innerHTML = '';
  pokemons.forEach((pokemon) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <span class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</span>
      <img class="pokemon-img" src="${pokemon.img}" alt="Imagem de ${pokemon.name}" />
      <span class="pokemon-name">${capitalize(pokemon.name)}</span>
      <div class="pokemon-types">
        ${pokemon.types
          .map((type) => `<span class="pokemon-type" data-type="${type}">${capitalize(type)}</span>`)
          .join('')}
      </div>
    `;
    pokedex.appendChild(card);
  });
  pageInfo.textContent = `Página ${page} de ${totalPages}`;
}

// Busca dados de um Pokémon
async function getPokemonData(idOrName) {
  const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Pokémon não encontrado');
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      img: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      types: data.types.map((t) => t.type.name),
    };
  } catch (err) {
    console.error(err.message);
    return null;
  }
}

// Busca os Pokémon de uma página
async function fetchPokemons(page = 1) {
  showLoader(true);
  const offset = (page - 1) * POKEMONS_PER_PAGE;
  const promises = [];
  for (let i = offset + 1; i <= Math.min(offset + POKEMONS_PER_PAGE, FIRST_GEN_TOTAL); i++) {
    promises.push(getPokemonData(i));
  }
  const pokemons = (await Promise.all(promises)).filter(Boolean);
  showLoader(false);
  renderPokemons(pokemons, page);
}

// Eventos de navegação
btnPrev.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemons(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
btnNext.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchPokemons(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
searchBtn.addEventListener('click', async () => {
  const value = searchInput.value.trim().toLowerCase();
  if (!value) return;
  showLoader(true);
  const pokemon = await getPokemonData(value);
  showLoader(false);
  if (pokemon) {
    renderPokemons([pokemon], 1);
    pageInfo.textContent = 'Exibindo resultado de busca';
  } else {
    pokedex.innerHTML = '<div style="text-align:center;color:#cc0000;font-weight:bold;">Pokémon não encontrado!</div>';
    pageInfo.textContent = '';
  }
});

// Inicializa a página
fetchPokemons(currentPage);
