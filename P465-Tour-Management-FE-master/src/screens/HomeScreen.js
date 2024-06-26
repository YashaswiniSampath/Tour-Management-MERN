import React, { useEffect, useState } from 'react';
import AppBarComponent from '../util/AppBarComponent';
import EZTravelLogo from '../images/EZTravelLogo.png';
import SearchComponent from '../util/SearchComponent';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TileComponent from '../util/TileComponent';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ReviewComponent from '../util/ReviewComponent';
import { LocationSearching } from '@mui/icons-material';

const HomeScreen = () => {
  const [locations, setLocations] = useState([
    { name: 'Sample Location 1', price: 150, rating: '★★★★☆', description: 'This is a sample description for Location 1.', image: EZTravelLogo, isFavorited: false },
    { name: 'Sample Location 2', price: 250, rating: '★★★☆☆', description: 'This is a sample description for Location 2.', image: EZTravelLogo, isFavorited: false },
    { name: 'Sample Location 3', price: 350, rating: '★★★★★', description: 'This is a sample description for Location 3.', image: EZTravelLogo, isFavorited: false },
  ]);
  const [recommendedLocations, setRecommendedLocations] = useState([
    { name: 'Sample Location 1', price: 150, rating: '★★★★☆', description: 'This is a sample description for Location 1.', image: EZTravelLogo, isFavorited: false },
    { name: 'Sample Location 2', price: 250, rating: '★★★☆☆', description: 'This is a sample description for Location 2.', image: EZTravelLogo, isFavorited: false },
    { name: 'Sample Location 3', price: 350, rating: '★★★★★', description: 'This is a sample description for Location 3.', image: EZTravelLogo, isFavorited: false },
  ]);


  const [selectedLocation, setSelectedLocation] = useState(null);
  const [place, setPlace] = useState(null)
  const [itineraries, setIt] = useState(null)
  const [value, setValue] = useState(dayjs())
  const [reviewLocation, setReviewLocation] = useState(null);
  const [reviews, setReviews] = useState([]);

  const openReviewComponent = (location) => {
    if (localStorage.token) {
      setReviewLocation(location);
    } else {
      alert("Please login to complete this action");
    }
  };

  const handleCloseReview = () => {
    setReviewLocation(null);
  };

  const handleClose = () => {
    setSelectedLocation(null);
  };

  const toggleFavorite = (locationName) => {
    setLocations(locations.map(location =>
      location.name === locationName ? { ...location, isFavorited: !location.isFavorited } : location
    ));

    // If a location is selected and its favorite status changes, update the selectedLocation as well
    if (selectedLocation && selectedLocation.name === locationName) {
      setSelectedLocation({
        ...selectedLocation,
        isFavorited: !selectedLocation.isFavorited
      });
    }
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
              setPlace(location)
            }
          })
        }
      })

    } else {
      alert("Please login to complete this action")
    }
  };

  
  const recalculateRating = (placeId) => {
    fetch(`https://place.harrisowe.me/recalculate-rating/${placeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localStorage.token })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Rating recalculated:', data);
        updateRatingForLocation(placeId, data.ratings);
    })
    .catch(error => {
        console.error('Failed to recalculate rating:', error);
    });
  };

  const updateRatingForLocation = (placeId, newRating) => {
    setLocations(locations.map(location =>
      location._id === placeId ? { ...location, rating: newRating || "" } : location
    ));
    setRecommendedLocations(recommendedLocations.map(location =>
      location._id === placeId ? { ...location, rating: newRating || "" } : location
    ));
  };

  const deleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      fetch(`https://place.harrisowe.me/delete-review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.token}`
        }
      })
      .then(response => {
        if (response.ok) {
          // Filter out the deleted review from local state to update UI
          setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
          recalculateRating(selectedLocation._id);
          alert('Review deleted successfully');
        } else {
          response.json().then(data => {
            console.error('Failed to delete the review:', data.message);
            alert('Failed to delete the review: ${data.message}');
          });
        }
      })
      .catch(error => alert(error.message));
    }
  };  

  useEffect(() => {
    fetch('https://place.harrisowe.me/place/home')
      .then(response => response.json())
      .then(data => setLocations(data.randomPlaces))
      .catch(error => console.log('Error fetching locations:', error));
  }, []);

  useEffect(() => {
    fetch('https://place.harrisowe.me/place/recomend')
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setRecommendedLocations(data.splice(0,3))})
      .catch(error => console.error('Error fetching recommended locations:', error));
  }, []);

  // Fetch reviews when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const placeID = selectedLocation._id;
      fetch(`https://place.harrisowe.me/places/${placeID}`)
        .then(response => response.json())
        .then(data => {
          if (data.place && Array.isArray(data.place.reviews)) {
            setReviews(data.place.reviews);
          }
        })
        .catch(error => {
          console.error('Error fetching reviews:', error);
        });
    } else {
      setReviews([]);
    }
  }, [selectedLocation]);

  return (
    <div className="container">
      <AppBarComponent />
      <div className="sidebar">
        <div className="filters"></div>
        <div className="search">
          <SearchComponent setLocations={setLocations} />
        </div>
        <h2 style={{ textAlign: 'center' }}>Recommendations for You</h2>
        <div className='grid-container'>
          {recommendedLocations.map((location, index) => (
            <TileComponent
              key={index}
              location={location}
              onLocationSelect={setSelectedLocation}
              onToggleFavorite={toggleFavorite}
              addToItinerary={addToItinerary}
              onOpenReviewComponent={openReviewComponent}
            />
          ))}
        </div>
      </div>
      <h2 style={{ textAlign: 'center', "marginTop": "4em" }}>Popular Destinations</h2>
      <div className="grid-container">
        {locations.map((location, index) => (
          <TileComponent
            key={index}
            location={location}
            onLocationSelect={setSelectedLocation}
            onToggleFavorite={toggleFavorite}
            addToItinerary={addToItinerary}
            onOpenReviewComponent={openReviewComponent}
          />

        ))}
      </div>
      {selectedLocation && (
        <div className="modal-backdrop">
          <div className="modal">
            <img src={selectedLocation.pictureURL || EZTravelLogo} alt="Location" style={{ display: "block", width: "300px" }} />
            <h3>{selectedLocation.name}</h3>
            {selectedLocation.price && <p>Price: ${selectedLocation.price}</p>}
            {selectedLocation.ratings ? <p>Rating: {selectedLocation.ratings}/5</p> : <p>No available ratings</p>}
            <p>Description: {selectedLocation.description}</p>
            {reviews.length > 0 ? (
              <div>
                <p>Reviews:</p>
                {reviews.map((review, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <p style={{ paddingLeft: '20px', margin: 0 }}>- {review.reviewText}; Rating: {review.rating}</p>
                    <button onClick={() => deleteReview(review._id)} style={{ marginLeft: '10px' }}>Delete</button>
                  </div>
                ))}
              </div>
            ) : <p>No available reviews</p>}
            <button onClick={handleClose} className="close-btn">X</button>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedLocation.name); }} className="favorite-btn">
              {selectedLocation.isFavorited ? <FavoriteIcon style={{ color: '#F25C5C' }} /> : <FavoriteBorderIcon style={{ color: 'black' }} />}
            </button>
          </div>
        </div>

      )}
      {reviewLocation && (
        <ReviewComponent
          location={reviewLocation}
          onClose={handleCloseReview}
          onSubmit={(id, reviewText, rating) => {
            console.log("id----------", id)
            // Implement the review submission logic here.
            fetch(`https://place.harrisowe.me/add-review-place/${id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                token: localStorage.token,
                reviewText,
                rating
              })
            })
            .then(response => response.json())
            .then(data => {
              console.log('Review submitted:', data);
              recalculateRating(id);
              setReviewLocation(null);
              handleCloseReview();
            })
            .catch(error => console.error('Failed to submit review:', error));

             // Close the review modal after submission
          }}
        />
      )}
      {place && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{place.name}</h3>
            <DateTimePicker
              id="datePicker"
              value={value}
              onChange={setValue}
            ></DateTimePicker>
            <p>Select an Itinerary to add to:</p>
            {itineraries.map((it) => (
              <Button
                type="item"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={() => {
                  fetch("https://auth.harrisowe.me/api/addPlace", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      "token": localStorage.token,
                      "id": it._id,
                      "place": place._id,
                      "time_start": value.unix()
                    })
                  }).then((res) => res.json()).then((data) => {
                    console.log(data)
                    if (data.error) {
                      console.error("Failed to create item")
                    } else {
                      setIt()
                      setPlace()
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
    </div>
  );
};

export default HomeScreen;
