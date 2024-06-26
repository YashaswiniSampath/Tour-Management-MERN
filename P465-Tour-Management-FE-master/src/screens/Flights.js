import React, { useState, useEffect } from 'react';
import AppBarComponent from '../util/AppBarComponent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AmericanLogo from '../images/Airline-Logos/american-logo.jpg';
import DeltaLogo from '../images/Airline-Logos/delta-logo.png';
import SouthwestLogo from '../images/Airline-Logos/southwest-logo.jpg';
import SpiritLogo from '../images/Airline-Logos/spirit-logo.jpg';
import UnitedLogo from '../images/Airline-Logos/united-logo.jpg';
import Container from '@mui/material/Container';
import AddIcon from "@mui/icons-material/Add"
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function Flights() {
  const [tripType, setTripType] = useState('');
  const [classType, setClassType] = useState('');
  const [guests, setGuests] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [value, setValue] = useState(dayjs())
  const [itineraries, setIt] = useState(null)

  const [flights, setFlights] = useState([
    // {
    //   "flightID": "FL123",
    //   "airline": "AirlineX",
    //   "flightNumber": "123",
    //   "source": "65fdbcf1a4a111790f74dc6e",
    //   "destination": "65fdbe0ba4a111790f74dc71",
    //   "departureTime": "Sat Jan 01 2022 03:00:00 GMT-0500 (Eastern Standard Time)",
    //   "arrivalTime": "Sat Jan 01 2022 07:00:00 GMT-0500 (Eastern Standard Time)",
    //   "classType": "Economy",
    //   "miles": 1000,
    //   "duration": 4,
    //   "stops": 1,
    //   "pricePerMile": 0.5,
    //   "price": 500,
    //   "favorited": "No",
    //   "image": "spirit-logo.jpg"
    // }
  ])

  useEffect(() => {
    fetch('https://place.harrisowe.me/flights')
      .then(response => response.json())
      .then(data => setFlights(data.flights))
      .catch(error => console.log('Error fetching flights:', error));
  }, []);




  // Placeholder for search function
  const handleSearch = () => {
    // Filter flights based on search criteria including the guest count
    const filteredFlights = flights.filter(flight => {
      // Check if each field has been filled by the user before filtering
      const matchesFrom = from ? flight.source.name == (from) : true;
      const matchesTo = to ? flight.destination.name == (to) : true;

      // const matchesClassType = classType ? flight.classType === classType : true;
      // const matchesGuests = flight.guests >= guests; // guests should always be checked
      // const matchesStartDate = startDate ? flight.date === startDate : true;
      // Add condition for endDate if needed

      return matchesFrom && matchesTo // && matchesClassType && matchesGuests && matchesStartDate;
    });

    setFlights(filteredFlights);
  };


  const toggleFavorite = (index) => {
    // Toggle the favorite status of a flight
    const newFlights = flights.map((flight, idx) =>
      idx === index ? { ...flight, isFavorited: !flight.isFavorited } : flight
    );
    setFlights(newFlights);
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


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppBarComponent />
      <Container maxWidth="xl">
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '64px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '0 auto' }}>
            <Button variant={tripType === 'Round-trip' ? 'contained' : 'outlined'} onClick={() => setTripType('Round-trip')}>
              Round-trip
            </Button>
            <Button variant={tripType === 'One-way' ? 'contained' : 'outlined'} onClick={() => setTripType('One-way')}>
              One-way
            </Button>
            <FormControl variant="outlined" style={{ minWidth: '120px' }}>
              <InputLabel>Class</InputLabel>
              <Select value={classType} onChange={(e) => setClassType(e.target.value)} label="Class">
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="premium-economy">Premium Economy</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="first-class">First Class</MenuItem>
                <MenuItem value="multiple">Multiple</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              inputProps={{ min: 1 }}
              variant="outlined"
              style={{ width: '150px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '64px', marginTop: '20px' }}>
            <TextField fullWidth label="Flying from" value={from} onChange={(e) => setFrom(e.target.value)} variant="outlined" style={{ marginLeft: '10px', flex: 1 }} />
            <TextField fullWidth label="Flying to" value={to} onChange={(e) => setTo(e.target.value)} variant="outlined" style={{ marginLeft: '10px', flex: 1 }} />
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ width: '25%' }}
            />
            {tripType === 'Round-trip' && (
              <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                style={{ width: '25%' }}
              />
            )}
          </div>
          <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginTop: '20px' }}>
            Search
          </Button>
        </div>
        <h2>{from} - {to}</h2>
        <p>{flights.length} flights · {tripType} · {guests} Guests</p>
        {flights.length > 0 && (
          <div className="grid-container">
            {flights.map((flight, index) => (
              <div key={index} className="grid-item">
                <img src={flight.image || flight.destination.pictureURL} alt="Airline" style={{ width: '150px', height: '100px', objectFit: 'cover' }} />
                <div className="grid-text">
                  <h3>{flight.airline} {flight.flightNumber}</h3>
                  <p>From: {flight.source.city}, {flight.source.country} To: {flight.destination.city}, {flight.destination.country}</p>
                  <p> Departure Time: {flight.departureTime}</p>
                  <p> Arrival Time: {flight.arrivalTime}</p>
                  <p>Duration: {flight.duration}hr Stops: {flight.stops}</p>
                  <p>Class: {flight.classType}</p>
                  <button onClick={(event) => addToItinerary(event, flight)} className="grid-add-btn">
                    {flight.isFavorited ? <AddIcon style={{ color: '#F25C5C' }} /> : <AddIcon style={{ color: 'black' }} />}
                  </button>
                  <button onClick={() => toggleFavorite(index)} className="grid-favorite-btn">
                    {flight.isFavorited ? <FavoriteIcon style={{ color: '#F25C5C' }} /> : <FavoriteBorderIcon style={{ color: 'black' }} />}
                  </button>
                  <h3>Price: ${flight.price}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedLocation && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>{selectedLocation.airline} {selectedLocation.flightNumber}</h2>
              <img src={selectedLocation.image || selectedLocation.destination.pictureURL} alt="Airline" style={{ width: '150px', height: '100px', objectFit: 'cover' }} />
              <p>From: {selectedLocation.source.city}, {selectedLocation.source.country} To: {selectedLocation.destination.city}, {selectedLocation.destination.country}</p>
              <p> Departure Time: {selectedLocation.departureTime}</p>
              <p> Arrival Time: {selectedLocation.arrivalTime}</p>
              <p>Duration: {selectedLocation.duration}hr Stops: {selectedLocation.stops}</p>
              <p>Class: {selectedLocation.classType}</p>
              <button onClick={() => { setSelectedLocation(null) }} className="close-btn">X</button>
              <DateTimePicker
                id="datePicker"
                value={value}
                onChange={setValue}
              ></DateTimePicker>
              <div>
                <input type="checkbox" id="round_trip" name="round_trip" />
                <label for="round_trip">Round Trip?</label>
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
                        "type": "flight",
                        "thing_id": selectedLocation._id,
                        "time_start": value.unix(),
                        "round_trip": document.getElementById("round_trip").checked
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
      </Container>
    </div>
  );
};

export default Flights;