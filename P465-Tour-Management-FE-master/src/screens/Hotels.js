import React, { useState, useEffect, useRef } from 'react';
import AppBarComponent from '../util/AppBarComponent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ReviewComponent from '../util/ReviewComponent';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Container from '@mui/material/Container';
import AddIcon from "@mui/icons-material/Add"
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';


const HotelTile = ({ hotel, onOpenReviewComponent, addToItinerary }) => (
  <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '5px', margin: '10px', padding: '10px' }}>
    <img src={hotel.pictureURL} alt={hotel.name} style={{ width: '150px', height: '150px', marginRight: '10px', borderRadius: '5px' }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6">{hotel.name}</Typography>
      <Typography>{hotel.location.name}, {hotel.location.state}</Typography>
      <Typography>Price: ${hotel.price} per night</Typography>
      <Typography>Ratings: {hotel.ratings}</Typography>
      <Button onClick={(e) => { console.log(hotel); e.stopPropagation(); onOpenReviewComponent(hotel); }} className="grid-review-btn">
        <RateReviewIcon style={{ color: 'gray' }} />
        Leave a review
      </Button>
      <Button variant="contained" color="primary" onClick={(event) => { event.stopPropagation(); addToItinerary(event, hotel) }} style={{ marginTop: 'auto' }}>
        Book
      </Button>
    </div>
  </div>
);

function Hotels() {
  const [location, setLocation] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [displayedHotels, setDisplayedHotels] = useState([]);
  const [displayedHotelssearch, setDisplayedHotelssearch] = useState([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [reviewLocation, setReviewLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [value, setValue] = useState(dayjs())
  const [days, setDays] = useState(1)
  const [itineraries, setIt] = useState([]);
  const inputRef = useRef(null);


  const openReviewComponent = (location) => {
    if (localStorage.token) {
      setReviewLocation(location);
    } else {
      alert("Please login to complete this action");
    }
  };
  const handleCloseReview = () => {
    setReviewLocation(null);
    setSelectedLocation(null);
    window.location.reload();
    
  };

  const handleSearch = async () => {
    try {
      console.log(location)
      const response = await fetch(`https://place.harrisowe.me/searchHotels?location=${location}`);
      console.log(response)
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        // Handle successful response, e.g., display the retrieved hotels
        console.log(data.hotels);
        setDisplayedHotels(data.hotels);
        setDisplayedHotelssearch(data.hotels);
      } else {
        // Handle error response
        throw new Error('Failed to fetch hotels');
      }
    } catch (error) {
      // Handle network errors
      console.error("Network error:", error);
    }
  };



  // Set displayed hotels initially
  useEffect(() => {
    async function fetchHotels() {
      try {
        const response = await fetch("https://place.harrisowe.me/hotels/", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error('Failed to fetch hotels');
        }
        const data = await response.json();

        setDisplayedHotels(data.hotels);
        setDisplayedHotelssearch(data.hotels);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        // Handle errors here
      }
    }

    fetchHotels(); // Call fetchHotels function to retrieve hotels when the component mounts
  }, []);

  const filterByPrice = (min, max) => {
    const filteredHotels = displayedHotels.filter(hotel => hotel.price >= min && hotel.price <= max);
    setDisplayedHotels(filteredHotels);
  };

  const filterByRating = rating => {
    const filteredHotels = displayedHotels.filter(hotel => hotel.ratings >= rating);
    setDisplayedHotels(filteredHotels);
  };

  const resetFilters = () => {
    setLocation('');
    setActivityDate('');
    setGuests(1);
    setDisplayedHotels(displayedHotelssearch);
    setPriceFilter('');
    setRatingFilter('');
  };

  const addToItinerary = (event, location) => {
    event.stopPropagation();
    console.log(location);


    if (localStorage.token) {
      fetch("https://auth.harrisowe.me/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "token": localStorage.token
        })
      }).then((res) => res.json()).then((data) => {
        console.log(data)
        if (data.status == "error") {
          localStorage.token = ""
          alert("Please login to complete this action")
        } else {
          fetch("https://auth.harrisowe.me/api/getItineraryList", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "token": localStorage.token
            })
          }).then((res) => res.json()).then((data) => {
            console.log(data)
            if (data.error) {
              console.error(data)
            } else {
              setIt(data)
              setSelectedLocation(location)
            }
          })

        }
      })

    } else {
      alert("Please login to complete this action")
    }


  }
  const fetchHotelDetails = (hotelId) => {
    fetch(`https://place.harrisowe.me/hotels/${hotelId}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setReviews(data.reviews);
          // setSelectedLocation(data);
        }
      })
      .catch(error => console.error('Error fetching hotel details:', error));
  };

  const submitReview = (hotelId, reviewText, rating) => {
    console.error("Rating ", rating)
    console.error("Review Text ", reviewText)
    console.error("Hotel ID ", hotelId)
    fetch(`https://place.harrisowe.me/add-review-hotel/${hotelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: localStorage.token,
        reviewText,
        rating
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Review submitted:', data);
      fetchHotelDetails(hotelId);
      handleCloseReview();
    })
    .catch(error => console.error('Failed to submit review:', error));
  };
  
  
return (
  <div style={{ width: '100vw', height: '100vh' }}>
    <AppBarComponent />
    <Container maxWidth="xl">
      <p></p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingLeft: '20px' }}>
        <TextField fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} variant="outlined" style={{ maxWidth: '600px' }} />
        <TextField type="date" label="Date of activity" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} InputLabelProps={{ shrink: true }} style={{ minWidth: '300px' }} />
        <TextField type="number" label="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} inputProps={{ min: 1 }} variant="outlined" style={{ minWidth: '300px' }} />
        <Button variant="contained" color="primary" onClick={handleSearch} style={{ minWidth: '200px' }}>
          Search
        </Button>
      </div>​
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, flex: '0 0 200px', padding: '20px', borderRight: '1px solid #ccc', alignItems: 'center' }}>
          <Typography variant="h6" >Filters</Typography>
          <div>
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '5px', marginBottom: '10px' }}>
              <Typography variant="h6">Filter by Price:</Typography>
              <Button onClick={() => filterByPrice(0, 50)} style={{ margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}> $0 - $50 </Button>
              <Button onClick={() => filterByPrice(50, 100)} style={{ margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}> $50 - $100 </Button>
              <Button onClick={() => filterByPrice(100, 150)} style={{ margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}> $100 - $150 </Button>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '5px', marginBottom: '10px' }}>
              <Typography variant="h6">Filter by Rating:</Typography>
              <Button onClick={() => filterByRating(4)} style={{ margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>4 and above</Button>
              <Button onClick={() => filterByRating(3)} style={{ margin: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>3 and above</Button>
            </div>
          </div>
          <Button variant="outlined" color="primary" onClick={resetFilters}>Reset Filters</Button>
        </div>
        <div style={{ flex: 2, padding: '20px' }}>
          <div style={{ marginTop: '20px' }}>
            <Typography variant="h4">Hotels</Typography>
            <Grid container spacing={3}>
              {displayedHotels.length > 0 ? (
                displayedHotels.map(hotel => (
                  <Grid item xs={12} sm={6} key={hotel.hotelID}>
                    <HotelTile hotel={hotel} onOpenReviewComponent={openReviewComponent} addToItinerary={addToItinerary} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>No hotels found</Typography>
                </Grid>
              )}
            </Grid>
          </div>
        </div>
      </div>
      {selectedLocation && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{selectedLocation.name}</h2>
            <DateTimePicker
              id="datePicker"
              value={value}
              onChange={setValue}
            ></DateTimePicker>
            <div style={{"marginTop" : "1em"}}>
              <label for="nights">Number of Nights:</label>
              <input type="number" id="nights" name="nights"/>
            </div>
            <p>Select an Itinerary to add to:</p>
            {itineraries.map((it) => (
              <Button
                type="item"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={() => {
                  fetch("https://auth.harrisowe.me/api/addThing", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      "token": localStorage.token,
                      "id": it._id,
                      "type": "hotel",
                      "thing_id": selectedLocation._id,
                      "time_start": value.unix(),
                      "days": document.getElementById("nights").value || 1
                    })
                  }).then((res) => res.json()).then((data) => {
                    console.log(data)
                    if (data.error) {
                      console.error("Failed to create item")
                    } else {
                      setIt()
                      setSelectedLocation();
                    }
                  })
                }}
              >
                {it.title}
              </Button>
            ))}
          </div>
        </div>

      )}
      {reviewLocation && (
        <ReviewComponent
          location={reviewLocation}
          onClose={handleCloseReview}
          onSubmit={(id, reviewText, rating) => {
            submitReview(reviewLocation._id, reviewText, rating);
            handleCloseReview();
          }}
        />
      )}
    </Container>
  </div>
);

}

export default Hotels;