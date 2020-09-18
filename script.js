'use strict'

//format function for all query paramaters 
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

    return queryItems.join('&'); 
}

//            ~~~~~~~~ LOCATIONiQ API~~~~~

// Obtain coordinates to pass to through Zomato. 'foodType' passes through untouched
const locationApiKey = 'e6f1d751182452';

const locationBaseUrl = 'https://us1.locationiq.com/v1/search.php'

function getCoordinates(foodAddress, foodType) {
  const params = {
    key: locationApiKey, 
    q: foodAddress, 
    countrycodes: 'us',
    limit: 1,
    format: 'json'
  };

  const queryString = formatQueryParams(params);
  const url = locationBaseUrl + '?' + queryString; 

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

};

//               ~~~~~~ ZOMATO API ~~~~~ 

const zomatoBaseUrl = 'https://developers.zomato.com/api/v2.1/search'

const zomatoApiKey = '5408459bae48d90e9cd677c0fa26abbb'

// takes coordinates and makes first zomato call to get total results
function getFoodResultTotal(responseJson, foodType) {
    const params = {
        apikey: zomatoApiKey, 
        lat: responseJson[0].lat,
        lon: responseJson[0].lon,
        q: foodType,
        count: 1 
    } ;

    const queryString = formatQueryParams(params);
    const url = zomatoBaseUrl + '?' + queryString; 

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
};

// passes previous url/responseJson and makes second call with randomized start paramater to get 1 result
function getFoodResult(url, responseJson) {
    let offsetParam = 0
    // API won't show a result higher than 100, 
    // this work around ensures randomization over or under 100 (if total is 1050, it will randomly start under first 100)
  if (responseJson.results_found > 100) {
     offsetParam = Math.floor(Math.random() * 99);
  } else {
     offsetParam = Math.floor(Math.random() * responseJson.results_found)
  };
        
    const offsetString = 'start=' + offsetParam
    const newUrl = url + '&' + offsetString

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
};

// once randomized result is obtained, append the html wtih appropriate API info
function generateFoodResult(responseJson) {
    $('#food-results').empty();

    // if the cost returned from the API is not availble or 0, it will show as not available
    let cost = responseJson.restaurants[0].restaurant.average_cost_for_two
    if (cost === 0) {
    cost = '<p><b>Average Cost For Two:</b>  N/A</p>';
    } else {
    cost = `<p><b>Average Cost For Two:</b> $${cost}</p>`;
    };

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
        ${cost}
        <p><b>Address:</b> ${responseJson.restaurants[0].restaurant.location.address}</p>
        `
    )
  }
};

//              ~~~~~~~UNOGS API~~~~~~~

const netflixBaseUrl = 'https://unogsng.p.rapidapi.com/search' 

// make first call to API and get total number of movies (same process as above)
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
};

// make second call with, but randomize offset which picks a result
function getWatchResult(url, responseJson) {
    //        ~~~ Get random number based on total 
    const offsetParam = Math.floor(Math.random() * responseJson.total)

    const offsetString = 'offset=' + offsetParam

    const newUrl = url + '&' + offsetString; 

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
};

// pass through randomized result and append html with API info  
function generateWatchResult(responseJson) {
    $('#watch-results').empty();

// prevents 'null/10' being shown as a IMDb rating and N/A instead
    let rating = responseJson.results[0].imdbrating
    if (rating === null) {
    rating = '<p><b>IMDb Rating:</b>  N/A</p>';
    } else {
    rating = `<p><b>IMDb Rating:</b>  ${rating}/10 </p>`;
    };

    $('#watch-results').append(
        `
        <h3>${responseJson.results[0].title}</h3>
     <div class="watch-result-info">   
        <div class="watch-img">
            <img id="movie-image" src="${responseJson.results[0].img}" alt="randomly selected movie poster">
        </div>
        <div class="watch-bio">
            <p><b>Year Realesed:</b> ${responseJson.results[0].year}</p>
            ${rating}
            <p style="font-weight:500;">${responseJson.results[0].synopsis}</p>
        <div>
      </div>
        `
    )
};

//               ~~~~~~~ EVENT HANDLERS ~~~~~~

function submitFoodForm() {
    $('#js-food-form').submit(event => {
        event.preventDefault(); 
        const foodAddress = $('#js-address').val(); 
        const foodType = $('#js-food-type').val();
        getCoordinates(foodAddress, foodType);
    });
};

function submitWatchForm() {
    $('#js-watch-form').submit(event => {
        event.preventDefault(); 
        const genreType = $('#js-genre-type').val();
        getWatchResultTotal(genreType);
    });
};

$(submitFoodForm);
$(submitWatchForm);