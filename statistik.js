const apiKey = '' //API v2 KEY FROM TMDb HERE

// Hämta genrer och populära filmer från API
async function fetchGenresAndMovies() {
    try {
        const urlGenres = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=sv-SE`
        const urlMovies = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=sv-SE`

        let genres = {}

        // Sätt namn på genre ids
        const genreResponse = await axios.get(urlGenres)
        genreResponse.data.genres.forEach((genre) => {
            genres[genre.id] = genre.name
        })

        const movieResponse = await axios.get(urlMovies)
        const movies = movieResponse.data.results

        createGenreDistributionChart(genres, movies)
        createAverageRatingChart(movies)
    } catch (error) {
        console.error('Fel vid hämtning från API', error)
    }
}

// Skapa en pie chart för att visa genres
function createGenreDistributionChart(genres, movies) {
    let genreCounts = {}
    // Räkna antalet filmer per genre
    movies.forEach((movie) => {
        movie.genre_ids.forEach((genreId) => {
            if (genreCounts[genres[genreId]]) {
                genreCounts[genres[genreId]] += 1
            } else {
                genreCounts[genres[genreId]] = 1
            }
        })
    })

    const genreData = {
        labels: Object.keys(genreCounts),
        datasets: [
            {
                label: 'Antal filmer per genre',
                data: Object.values(genreCounts),
                backgroundColor: [
                    '#4BC0C0',
                    '#eec0fc',
                    '#db110f',
                    '#7bbc75',
                    '#f950fa',
                    '#23feff',
                    '#9e6f41',
                    '#e70b99',
                    '#2072e8',
                    '#9f5185',
                    '#f9f001',
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#e7e9eD',
                    '#4bc0c0'
                ]
            }
        ]
    }

    // Skapa chart
    const genreChartCtx = document.getElementById('genrePieChart')
    new Chart(genreChartCtx, {
        type: 'pie',
        data: genreData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    titleColor: 'white',
                    bodyColor: 'white'
                }
            }
        }
    })
}

// Skapa en bar chart som visar betyg för de populära filmerna
function createAverageRatingChart(movies) {
    const ratingData = []
    const labels = []

    // Loopar igenom varje film, samlar rating och titlar
    // och anpassar titellängden för visning på små skärmar
    movies.forEach((movie) => {
        ratingData.push(movie.vote_average)

        if (movie.title.length > 10) {
            labels.push(movie.title.slice(0, 12) + '...')
        } else {
            labels.push(movie.title)
        }
    })

    // Skapa data och diagrammet för genomsnittsbetyget
    const averageRatingChartCtx = document.getElementById('averageRatingChart')
    new Chart(averageRatingChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Globalt betyg',
                    data: ratingData,
                    backgroundColor: '#852d91c9',
                    borderColor: '#b349c1',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    grid: {
                        color: '#E4B3E859'
                    },
                    ticks: {
                        color: 'white'
                    }
                },
                y: {
                    grid: {
                        color: '#E4B3E859'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    titleColor: 'white',
                    bodyColor: 'white'
                }
            }
        }
    })
}

fetchGenresAndMovies()
