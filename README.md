<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Pokédex interativa com HTML, CSS e JavaScript consumindo a PokeAPI">
  <title>Pokédex Interativa</title>
  <style>
    :root {
      --color-bg: #f7f7fc;
      --color-primary: #3b4cca;
      --color-secondary: #ffcb05;
      --color-card-bg: #fff;
      --color-shadow: rgba(0, 0, 0, 0.1);
      --radius-card: 1.5rem;
      --transition: 0.3s ease-in-out;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: var(--color-bg);
      color: #222;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      animation: fadeIn 1s ease-in-out;
    }
    header {
      background: var(--color-primary);
      color: #fff;
      padding: 2rem 0 1rem;
      text-align: center;
      box-shadow: 0 0.1rem 0.5rem var(--color-shadow);
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
    .search-box {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .search-box input {
      padding: 0.5rem 1rem;
      border: 2px solid var(--color-primary);
      border-radius: 1.5rem;
      outline: none;
      font-size: 1.1rem;
      width: 240px;
      transition: border var(--transition);
    }
    .search-box input:focus {
      border-color: var(--color-secondary);
    }
    .search-box button {
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 1.5rem;
      padding: 0.5rem 1.2rem;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background var(--transition);
    }
    .search-box button:hover {
      background: var(--color-secondary);
      color: #333;
    }
    .pokedex {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 900px;
      margin-bottom: 2rem;
      animation: fadeIn 1s ease-in-out;
    }
    .pokemon-card {
      background: var(--color-card-bg);
      border-radius: var(--radius-card);
      box-shadow: 0 0.4rem 1rem var(--color-shadow);
      padding: 1.5rem 1rem;
      text-align: center;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform var(--transition), box-shadow var(--transition);
      overflow: hidden;
    }
    .pokemon-card:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 0 0.5rem 2rem var(--color-primary);
    }
    .pokemon-img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin: 0 auto;
      transition: filter var(--transition);
      filter: drop-shadow(0 0 8px var(--color-secondary));
    }
    .pokemon-card:hover .pokemon-img {
      filter: drop-shadow(0 0 16px var(--color-secondary));
    }
    .loader {
      border: 6px solid #ddd;
      border-top: 6px solid var(--color-primary);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      margin: 40px auto;
      animation: spin 1s infinite linear;
      display: none;
    }
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .pagination {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .pagination button {
      background: var(--color-secondary);
      color: #222;
      border: none;
      border-radius: 1.5rem;
      padding: 0.5rem 1.2rem;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 0.05rem 0.3rem rgba(0, 0, 0, 0.2);
      transition: background var(--transition);
    }
    .pagination button:hover {
      background: var(--color-primary);
      color: #fff;
    }
    footer {
      background: #222;
      color: #fff;
      text-align: center;
      padding: 1.2rem 0;
      margin-top: auto;
    }
    footer a {
      color: var(--color-secondary);
      text-decoration: none;
    }
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>Pokédex Interativa</h1>
    <p>Explore todos os Pokémon da primeira geração!</p>
  </header>
  <main>
    <section class="search-box">
      <input type="text" id="search-input" placeholder="Buscar Pokémon por nome ou ID..." />
      <button id="search-button">Buscar</button>
    </section>
    <section class="pokedex" id="pokedex"></section>
    <div class="pagination">
      <button id="btn-prev" disabled>Anterior</button>
      <span id="page-info"></span>
      <button id="btn-next">Próximo</button>
    </div>
  </main>
  <footer>
    <p>Desenvolvido por Lucas Gabriel</p>
  </footer>
  <script>
    const pokedex = document.getElementById('pokedex');
    const loader = document.createElement('div');
    loader.className = 'loader';
    pokedex.appendChild(loader);

    const fetchPokemon = async (id) => {
      const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        img: data.sprites.other['official-artwork'].front_default,
      };
    };

    const renderPokemon = async (id) => {
      loader.style.display = 'block';
      const pokemon = await fetchPokemon(id);
      loader.style.display = 'none';
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      card.innerHTML = `
        <span>#${pokemon.id}</span>
        <img src="${pokemon.img}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3>
      `;
      pokedex.appendChild(card);
    };

    renderPokemon(1); // Exemplo inicial com Bulbasaur
  </script>
</body>
</html>