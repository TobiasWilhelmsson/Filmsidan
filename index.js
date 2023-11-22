const apiKey = '' //API v2 KEY FROM TMDb HERE

//Välj filmer som ska visas beroende på URL
function getApiUrl() {
    const currentPath = window.location.pathname
    const randomNumber = Math.floor(Math.random() * 90000) + 10000
    // Vi behöver random number då betygsatta filmer cachas hos TMDb

    if (currentPath.includes('/filmer.html')) {
        return (
            'https://api.themoviedb.org/3/trending/movie/week?api_key=' + apiKey
        )
    } else if (currentPath.includes('/popfilmer.html')) {
        return 'https://api.themoviedb.org/3/movie/popular?api_key=' + apiKey
    } else if (currentPath.includes('/biofilmer.html')) {
        return (
            'https://api.themoviedb.org/3/movie/now_playing?api_key=' + apiKey
        )
    } else if (currentPath.includes('/kommandefilmer.html')) {
        return 'https://api.themoviedb.org/3/movie/upcoming?api_key=' + apiKey
    } else if (currentPath.includes('/topplistafilmer.html')) {
        return 'https://api.themoviedb.org/3/movie/top_rated?api_key=' + apiKey
    } else if (currentPath.includes('/betygsatta.html')) {
        const sessionId = getSessionFromLocalStorage() // Hämta session id från local storage
        if (sessionId) {
            return `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${apiKey}&${randomNumber}`
        }
    }
}

// Hämta filmerna från API med GET
const getMovies = {
    method: 'GET',
    url: getApiUrl(),
    params: { language: 'sv-SE' },
    headers: {
        accept: 'application/json'
    }
}

axios
    .request(getMovies)
    .then(function (response) {
        const movies = response.data.results

        // Skapa en modal för detaljerad information om filmen
        const modal = document.createElement('div')
        modal.className = 'modal'
        modal.style.display = 'none' // Sätt initialt till osynlig

        const modalContent = document.createElement('div')
        modalContent.className = 'modal-content'

        const modalTitle = document.createElement('h2')
        const modalDescription = document.createElement('p')

        modalContent.appendChild(modalTitle)
        modalContent.appendChild(modalDescription)

        modal.appendChild(modalContent)

        const closeModalLink = document.createElement('a')
        closeModalLink.href = '#'
        closeModalLink.textContent = 'Stäng'
        closeModalLink.addEventListener('click', function (event) {
            event.preventDefault()
            modal.style.display = 'none'
        })

        // Gör så man kan stänga genom att klicka utanför rutan
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none'
            }
        })

        modalContent.appendChild(closeModalLink)
        document.body.appendChild(modal)

        const container = document.querySelector('.row')

        /*  Loopa igenom varje film och skapa en box för den
         */
        movies.forEach(function (movie) {
            // Skapa element för boxen
            const movieBox = document.createElement('div')
            movieBox.className = 'col-md-4 col-sm-6 itemCard'

            if (window.location.pathname.includes('/betygsatta.html')) {
                movieBox.setAttribute('data-rating', movie.rating)
            }

            // Här skapar vi element för allt innehåll i boxen
            const boxDiv = document.createElement('div')
            boxDiv.className = 'box'

            const img = document.createElement('img')
            img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path

            const boxContent = document.createElement('div')
            boxContent.className = 'box-content'

            const title = document.createElement('h3')
            title.className = 'title'
            title.textContent = movie.title

            const description = document.createElement('span')
            description.className = 'description'

            /*  Förkorta texten om det är över 20 ord så får plats i boxar
                och lägg till ... om den är förkortad */
            const words = movie.overview.split(' ')
            const truncatedWords = words.slice(0, 20)
            if (words.length > 20) {
                truncatedWords.push('...')
            }
            const truncatedDescription = truncatedWords.join(' ')

            description.textContent = truncatedDescription

            boxContent.appendChild(title)
            boxContent.appendChild(description)

            // Skapa dropdown för betyg
            const dropdownButton = document.createElement('a')
            dropdownButton.className = 'boxLinks'
            dropdownButton.textContent = 'Sätt ett betyg'
            dropdownButton.href = '#'
            dropdownButton.dataset.movieId = movie.id // Spara filmens ID i dataset så vi kan komma åt den för sortering

            const dropdownContent = document.createElement('div')
            dropdownContent.className = 'dropdownContent'
            boxContent.appendChild(dropdownButton)
            boxContent.appendChild(dropdownContent)

            // Skapa Läs mer knapp
            const readMoreLink = document.createElement('a')
            readMoreLink.href = '#'
            readMoreLink.className = 'boxLinks'
            readMoreLink.textContent = 'Läs mer'
            readMoreLink.addEventListener('click', function (event) {
                event.preventDefault()
                modalTitle.textContent = movie.title
                modalDescription.textContent = movie.overview

                modal.style.display = 'block'
            })
            boxContent.appendChild(readMoreLink)

            // Ange betyget på knappen, om vi är på betygsidan
            if (window.location.pathname.includes('/betygsatta.html')) {
                const currentRatingText = getRatingText(movie.rating)
                dropdownButton.textContent = `Betyg: ${currentRatingText}`

                const removeRatingButton = document.createElement('a')
                removeRatingButton.className = 'boxLinks'
                removeRatingButton.href = '#'
                removeRatingButton.textContent = 'Ta bort betyg'

                removeRatingButton.addEventListener('click', function (event) {
                    event.preventDefault()
                    const movieId = movie.id
                    removeRating(movieId, movieBox)
                })

                boxContent.appendChild(removeRatingButton)
            }

            boxDiv.appendChild(img)
            boxDiv.appendChild(boxContent)
            movieBox.appendChild(boxDiv)
            container.appendChild(movieBox)

            // Skapa betygslänkar
            const ratingOptions = [
                { label: 'Jättebra', rating: 3 },
                { label: 'Helt ok', rating: 2 },
                { label: 'Dålig', rating: 1 }
            ]

            // Lägg till event listener för dropdown-knappen
            dropdownButton.addEventListener('click', function (event) {
                event.preventDefault()
                const currentDropdownContent = dropdownButton.nextElementSibling
                if (currentDropdownContent.style.display === 'block') {
                    currentDropdownContent.style.display = 'none'
                } else {
                    currentDropdownContent.style.display = 'block'
                }
            })

            // Lägg till betygslänkar i dropdown
            ratingOptions.forEach((option) => {
                const ratingLink = document.createElement('a')
                ratingLink.href = '#'
                ratingLink.textContent = option.label
                ratingLink.dataset.rating = option.rating

                ratingLink.addEventListener('click', function (event) {
                    event.preventDefault()
                    const rating = this.dataset.rating
                    const movieId = dropdownButton.dataset.movieId
                    rateMovie(movieId, rating)
                    dropdownContent.style.display = 'none'
                })

                dropdownContent.appendChild(ratingLink)
            })
        })
    })
    .catch(function (error) {
        console.log('Finns ingen aktuell filmsida att hämta')
    })

// Rating funktionen
function rateMovie(movieId, rating) {
    const guestSessionId = getSessionFromLocalStorage()
    // Om det inte finns guest session så skapar vi en och sätter den i vårt local storage
    if (!guestSessionId) {
        createGuestSession().then((sessionId) => {
            setSessionInLocalStorage(sessionId)
            performRating(sessionId, movieId, rating)
        })
    } else {
        performRating(guestSessionId, movieId, rating)
    }
}

// Skapa guest session, hämta den från TMDb
function createGuestSession() {
    const options = {
        method: 'GET',
        url:
            'https://api.themoviedb.org/3/authentication/guest_session/new?api_key=' +
            apiKey,
        params: { language: 'sv-SE' },
        headers: {
            accept: 'application/json'
        }
    }
    return axios(options)
        .then((response) => {
            return response.data.guest_session_id
        })
        .catch((error) => {
            console.error('Kan ej skapa guest session:', error)
        })
}

// Lägg rating på en film
function performRating(sessionId, movieId, rating) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${apiKey}&guest_session_id=${sessionId}`
    const data = {
        value: rating
    }
    const headers = {
        'Content-Type': 'application/json'
    }
    axios
        .post(apiUrl, data, { headers })
        .then((response) => {
            document.querySelector(
                `[data-movie-id="${movieId}"]`
            ).textContent = `Betyget uppdaterat`
        })
        .catch((error) => {
            console.error('Error vid betygsättning:', error)
        })
}

// Lägg session från TMDb i local storage
function setSessionInLocalStorage(sessionId) {
    const sessionData = {
        sessionId: sessionId
    }
    localStorage.setItem('guest_session_data', JSON.stringify(sessionData))
}

// Hämta session från local storage
function getSessionFromLocalStorage() {
    const sessionData = localStorage.getItem('guest_session_data')
    if (sessionData) {
        const parsedSessionData = JSON.parse(sessionData)

        return parsedSessionData.sessionId
    }
    return null // Ingen session hittades
}

// Ta bort rating
function removeRating(movieId, movieBox) {
    const sessionId = getSessionFromLocalStorage()
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${apiKey}&guest_session_id=${sessionId}`
    const headers = {
        'Content-Type': 'application/json;charset=utf-8'
    }
    axios
        .delete(apiUrl, { headers })
        .then(() => {
            movieBox.remove() // Ta bort filmboxen från sidan
        })
        .catch((error) => {
            console.error('Error vid borttagning av betyg:', error)
        })
}

// Hämta text att sätta på respektive rating
function getRatingText(rating) {
    if (rating == 3) {
        return 'Jättebra'
    } else if (rating == 2) {
        return 'Helt ok'
    } else if (rating == 1) {
        return 'Dålig'
    }
}

// Filtrera filmer beroende på rating
function filterMoviesByRating(rating) {
    const allMovies = document.querySelectorAll('.itemCard')
    allMovies.forEach((movieBox) => {
        const movieRating = movieBox.getAttribute('data-rating')

        if (rating === 'all' || movieRating === rating) {
            movieBox.style.display = ''
        } else {
            movieBox.style.display = 'none'
        }
    })
}

// Hämta alla filterknappar och sätt event listeners
document.querySelectorAll('#rating-filter button').forEach((button) => {
    button.addEventListener('click', function () {
        const filterRating = this.dataset.filterRating
        filterMoviesByRating(filterRating)
    })
})
