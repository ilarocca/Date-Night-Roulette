'use strict'

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

    return queryItems.join('&'); 
}

//            ~~~~~~~~ LOCATIONiQ API~~~~~

const locationApiKey = 'e6f1d751182452';

const locationBaseUrl = 'https://us1.locationiq.com/v1/search.php'

function getCoordinates(foodAddress, foodType) {
  const params = {
    key: locationApiKey, 
    q: foodAddress, 
    countrycodes: 'us',
    limit: 1,
    format: 'json'
  }

  const queryString = formatQueryParams(params);
  const url = locationBaseUrl + '?' + queryString; 

  console.log(url);

  fetch(url)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => getFoodResultTotal(responseJson, foodType))
  .catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
  });

}

//               ~~~~~~ ZOMATO API ~~~~~ 

const zomatoBaseUrl = 'https://developers.zomato.com/api/v2.1/search'

const zomatoApiKey = '5408459bae48d90e9cd677c0fa26abbb'

function getFoodResultTotal(responseJson, foodType) {
    console.log(responseJson);

    const params = {
        apikey: zomatoApiKey, 
        lat: responseJson[0].lat,
        lon: responseJson[0].lon,
        q: foodType,
        count: 1 
    } 

    const queryString = formatQueryParams(params);
    const url = zomatoBaseUrl + '?' + queryString; 

    console.log(url);

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getFoodResult(url, responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getFoodResult(url, responseJson) {
    let offsetParam = 0
        console.log(responseJson.results_found);
  if (responseJson.results_found > 100) {
     offsetParam = Math.floor(Math.random() * 99);
  } else {
     offsetParam = Math.floor(Math.random() * responseJson.results_found)
  }
        
        console.log(offsetParam)
    const offsetString = 'start=' + offsetParam
    const newUrl = url + '&' + offsetString
        console.log(newUrl);

    fetch(newUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => generateFoodResult(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function generateFoodResult(responseJson) {
    console.log(responseJson)
    $('#food-results').empty();

if (responseJson.results_shown === 0) {
      $('#food-results').append(
        `
        <li>
        <p>Sorry, no result was found. Try again!</p>
        </li>
        `)
} else {
    $('#food-results').append(
        `
        <h3>${responseJson.restaurants[0].restaurant.name}</h3>
        <p><a href="${responseJson.restaurants[0].restaurant.menu_url}" target="_blank">Menu</a></p>
        <p><a href="${responseJson.restaurants[0].restaurant.url}" target="_blank">More Info</a></p>
        <p><b>Average Cost For Two:</b> $${responseJson.restaurants[0].restaurant.average_cost_for_two}</p>
        <p><b>Address:</b> ${responseJson.restaurants[0].restaurant.location.address}</p>
        `
    )
  }
}

//              ~~~~~~~UNOGS API~~~~~~~

const netflixBaseUrl = 'https://unogsng.p.rapidapi.com/search' 

function getWatchResultTotal(genreType) {

    const params = {
        genrelist: genreType,
        countrylist: "78",
        limit: 1, 
    };

    const queryString = formatQueryParams(params);
    const url = netflixBaseUrl + '?' + queryString; 

    fetch(url, {
        "method": "GET",
	    "headers": {
		"x-rapidapi-host": "unogsng.p.rapidapi.com",
		"x-rapidapi-key": "84d0b0e8damsha28a1dfe56f630ep1fbfedjsn7b96ad0f0af9"
	    }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => getWatchResult(url, responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getWatchResult(url, responseJson) {

    console.log(responseJson.total);
    //        ~~~ Get random number based on total 
    const offsetParam = Math.floor(Math.random() * responseJson.total)

    console.log(offsetParam); 

    const offsetString = 'offset=' + offsetParam

    const newUrl = url + '&' + offsetString; 

    // console.log(newUrl)

    fetch(newUrl, {
        "method": "GET",
	    "headers": {
		"x-rapidapi-host": "unogsng.p.rapidapi.com",
		"x-rapidapi-key": "84d0b0e8damsha28a1dfe56f630ep1fbfedjsn7b96ad0f0af9"
	    }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => generateWatchResult(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function generateWatchResult(responseJson) {

    console.log(responseJson)
    $('#watch-results').empty();

    const title = responseJson.results[0].title;
    console.log(title);

    let score = getWatchResultScore(title);
    console.log(score);

    $('#watch-results').append(
        `
        <h3>${responseJson.results[0].title}</h3>
        <p>${responseJson.results[0].synopsis}</p>
        <img id="movie-image" src="${responseJson.results[0].img}">
        <p><b>IMDb Rating:</b> </p>
        `
    )
}

//              ~~~~~~~~ OMDb API ~~~~~~~~

function getWatchResultScore(title) {
    const resultBaseUrl = 'https://www.omdbapi.com/'
    const omdbApiKey = '85d8f04b'
    const params = {
        t: title,
        apikey: omdbApiKey
    }

    const queryString = formatQueryParams(params);
    const url = resultBaseUrl + '?' + queryString; 

    console.log(url);

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {console.log(responseJson.imdbRating); return responseJson.imdbRating})
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}


//               ~~~~~~~ EVENT HANDLERS ~~~~~~

function submitFoodForm() {
    $('#js-food-form').submit(event => {
        event.preventDefault(); 
        const foodAddress = $('#js-address').val(); 
        const foodType = $('#js-food-type').val();
        getCoordinates(foodAddress, foodType);
    });
}

function submitWatchForm() {
    $('#js-watch-form').submit(event => {
        event.preventDefault(); 
        const genreType = $('#js-genre-type').val();
        getWatchResultTotal(genreType);
    });
}

$(submitFoodForm);
$(submitWatchForm);