'use strict'

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

    return queryItems.join('&'); 
}

//                ~~~~~~~~~GOOGLE API~~~~~~~~

// const googleApiKey = 'AIzaSyDM8WnT3OGrqhKlfIf9BVCadcu83FdAZgs';

// const googleBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// const proxyurl = "https://cors-anywhere.herokuapp.com/";

// function getFoodResult(foodAddress, foodType) {
//     const params = {
//         query: foodAddress + foodType,
//         type: 'restaurant',
//         key: googleApiKey,
//         radius: 32500,
//         opennow: 'true',

//     };

//     const queryString = formatQueryParams(params);
//     const url = googleBaseUrl + '?' + queryString; 

//     console.log(url)

//     fetch(proxyurl + url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => getFoodDetails(responseJson))
//     .catch(err => {
//       $('#js-error-message').text(`Something went wrong: ${err.message}`);
//     });
// } 


// function getFoodDetails(responseJson){
//   const number = Math.floor(Math.random() * responseJson.results.length);
//   console.log(number);
//   const placeId = 'place_id=' + responseJson.results[number].place_id;
//   const detailsBaseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
//   const url = detailsBaseUrl + '?' + placeId + '&key=' + googleApiKey;

//   fetch(proxyurl + url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => generateFoodResult(responseJson))
//     .catch(err => {
//       $('#js-error-message').text(`Something went wrong: ${err.message}`);
//     });
// } 


// function generateFoodResult(responseJson) {
//     console.log(responseJson)
//     $('#food-results-list').empty();

//     $('#food-results-list').append(
//         `
//         <li>
//         <h3>${responseJson.result.name}</h3>
//         <p>Rating: ${responseJson.result.rating}/5 (${responseJson.result[0].user_rating_total} reviewers)
//         <p>Address: ${responseJson.result.formatted_address}</p>
//         <p><a href="${responseJson.result.website} target="_blank">Restaurent Website</a></p>
//         <p><a href="${responseJson.result.url}">Google Link</a></p>
//         <img src="${responseJson.result.photos[0]}" alt="Google Image of Restaurant"> 
//         </li>
//         `
//     )
// }


//              ~~~~~~~ POSITION STACK API ~~~~ 

const positionBaseUrl = 'https://api.positionstack.com/v1/forward'

const positionApiKey = 'fbd169c06412183df559cef58ec22027'

function getCoordinates(foodAddress, foodType) {
    const params = { 
        access_key: positionApiKey, 
        output: 'json',
        query: foodAddress, 
        country: 'US', 
        limit: 1
    };

    const queryString = formatQueryParams(params);
    const url = positionBaseUrl + '?' + queryString; 

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
        lat: responseJson.data[0].latitude, 
        lon: responseJson.data[0].longitude,
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
        console.log(offsetString);
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
    $('#food-results-list').empty();

if (responseJson.results_shown === 0) {
      $('#food-results-list').append(
        `
        <li>
        <p>Sorry, no result was found. Try again!</p>
        </li>
        `)
} else {
    $('#food-results-list').append(
        `
        <li>
        <h3>${responseJson.restaurants[0].restaurant.name}</h3>
        <p>Average Cost For Two: $${responseJson.restaurants[0].restaurant.average_cost_for_two}</p>
        <p>Address: ${responseJson.restaurants[0].restaurant.location.address}</p>
        <p><a href="${responseJson.restaurants[0].restaurant.url}" target="_blank">More Info</a></p>
        </li>
        `
    )
  }
}

//              ~~~~~~~UNOGS API~~~~~~~

const netflixBaseUrl = 'https://unogsng.p.rapidapi.com/search' 

function getWatchResultTotal(genreType) {

    const params = {
        genrelist: genreType,
        // type: watchType,
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
    $('#watch-results-list').empty();

    console.log(responseJson.results[0].title);

    $('#watch-results-list').append(
        `
        <li>
        <h3>${responseJson.results[0].title}</h3>
        <p>${responseJson.results[0].synopsis}</p>
        <img id="movie-image" src="${responseJson.results[0].img}">
        </li>
        `
    )
}

//              ~~~~~~~~ OMDb API ~~~~~~~~

// function getWatchResultScore(title) {
//     const resultBaseUrl = 'http://www.omdbapi.com/'

//     const params = {
//         t: title
//     }

//     const queryString = formatQueryParams(params);
//     const url = resultBaseUrl + '?' + queryString; 

//     console.log(url);

//     fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     .then(responseJson => console.log(responseJson))
//     .catch(err => {
//       $('#js-error-message').text(`Something went wrong: ${err.message}`);
//     });

// }


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
        // const watchType = $('#js-watch-type').val(); 
        const genreType = $('#js-genre-type').val();
        getWatchResultTotal(genreType);
    });
}

// function submitBothForms() {
//   $('#js-both-form').submit(event => {
//     console.log('hi');
//     event.preventDefault();
//     submitFoodForm();
//     submitWatchForm();
//   })
// }

$(submitFoodForm);
$(submitWatchForm);
// $(submitBothForms);