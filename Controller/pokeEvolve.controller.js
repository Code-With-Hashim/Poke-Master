const axios = require('axios')

async function getEvolutionDetails(pokemonName) {
  console.log('line4', pokemonName)
  try {
    // Fetch the Pokemon data from the Pokémon API
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const pokemonData = response.data;

    const speciesResponse = await axios.get(pokemonData.species.url);
    const speciesData = speciesResponse.data;

    const evolutionChainResponse = await axios.get(speciesData.evolution_chain.url);
    const evolutionChainData = evolutionChainResponse.data;

    const evolutionDetails = extractEvolutionDetails(evolutionChainData.chain, pokemonName);
    if (evolutionDetails) {
    //   console.log(`${pokemonName} evolves at level ${evolutionDetails.level} into ${evolutionDetails.evolvedForm}.`);
     return {
         evolve_level : evolutionDetails.level,
         evolve_to : evolutionDetails.evolvedForm
     }
    } else {
      console.log(`${pokemonName} does not evolve.`);
      return {
        evolve_level : 100,
        evolve_to : 'null'
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

function extractEvolutionDetails(chain, targetPokemon) {
  if (chain.species.name.toLowerCase() === targetPokemon.toLowerCase()) {
    if (chain.evolves_to.length > 0) {
      const evolutionDetails = {
        level: chain.evolves_to[0].evolution_details[0].min_level,
        evolvedForm: chain.evolves_to[0].species.name
      };
      return evolutionDetails;
    }
  }

  for (let i = 0; i < chain.evolves_to.length; i++) {
    const evolutionDetails = extractEvolutionDetails(chain.evolves_to[i], targetPokemon);
    if (evolutionDetails) {
      return evolutionDetails;
    }
  }

  return null;
}

// Example usage

module.exports = {
    getEvolutionDetails
}