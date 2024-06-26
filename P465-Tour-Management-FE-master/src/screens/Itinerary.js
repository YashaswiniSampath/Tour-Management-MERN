import AppBarComponent from "../util/AppBarComponent";
import React, { useEffect, useState, image } from 'react'
import EZTravelLogo from '../images/EZTravelLogo.png'
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from "dayjs";
import { DateTimePicker } from '@mui/x-date-pickers';

import '../App.css'

import { useLoadScript } from '@react-google-maps/api';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { FormControlLabel } from "@mui/material";
import { Switch } from "@mui/material";



function Itinerary() {
  const defaultTheme = createTheme();

  const [state, setState] = useState();
  const [user, setUser] = useState();
  const [list, setList] = useState();
  const [refresh, setRefresh] = useState();
  const [selected, setSelect] = useState();
  useEffect(() => {
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
          setUser(null)
          setState("no user")
          localStorage.token = ""
        } else {
          setUser(data)
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
              setList()
              setState("logged in")
            } else {
              setList(data)
              setState("logged in")
            }
          })

        }
      })

    } else {
      setUser(null);
      setState("no user");
    }
  }, [refresh]);

  const handleItemClick = async (event) => {
    const id = event.target.id
    if (id === "create") {
      setState("create")
    } else {
      fetch("https://auth.harrisowe.me/api/getItinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "token": localStorage.token,
          "id": id
        })
      }).then((res) => res.json()).then((data) => {
        console.log("it", data)
        if (data.error) {
          console.error("Failed to fetch item")
        } else {
          setSelect(data)
          setState("item")
        }
      })
    }
  }

  const Itinerary = () => {
    let item = selected

    const [places, setPlaces] = useState([])
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [timeStart, setTimeStart] = useState(dayjs());
    const [timeEnd, setTimeEnd] = useState();
    const [hotels, setHotels] = useState([]);
    const [things, setThings] = useState([]);
    const [flights, setFlights] = useState([])
    const [checked, setChecked] = useState(false)



    let tempPlaces = []

    useEffect(() => {
      const fetchPlaces = async () => {
        const placesArray = await Promise.all(
          item.destinations.map(async (dest) => {
            try {
              console.log(dest)
              const response = await fetch(`https://place.harrisowe.me/places/${dest.place}`);
              const data = await response.json();
              console.log(data)
              data.place.time_start = dest.time_start;
              if (dest.time_end) {
                data.place.time_end = dest.time_end;
              }
              data.place.type = "place";
              return data.place;
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        // console.log(placesArray);
        let filtered = placesArray.filter((place) => place !== null);
        setPlaces(filtered.toSorted((a, b) => a.time_start - b.time_start));
      }
      const fetchHotels = async () => {
        const placesArray = await Promise.all(
          item.hotels.map(async (dest) => {
            try {
              console.log(dest)
              const response = await fetch(`https://place.harrisowe.me/hotels/${dest.place}`);
              const data = await response.json();
              console.log("Hotel", data.hotel)
              data.hotel.time_start = dest.time_start;
              if (dest.time_end) {
                data.hotel.time_end = dest.time_end;
              }
              if (dest.days) {
                data.hotel.days = dest.days;
              }
              data.hotel.type = "hotel"
              return data.hotel;
            } catch (error) {
              console.error("Error saving hotel", error);
              return null;
            }
          })
        );
        // console.log(placesArray);
        let filtered = placesArray.filter((place) => place !== null);
        console.log("filtered", filtered)
        setHotels(filtered.toSorted((a, b) => a.time_start - b.time_start));
      }
      const fetchFlights = async () => {
        const placesArray = await Promise.all(
          item.flights.map(async (dest) => {
            try {
              console.log(dest)
              const response = await fetch(`https://place.harrisowe.me/flights/${dest.place}`);
              const data = await response.json();
              console.log("Flight", data.flight)
              data.flight.time_start = dest.time_start;
              if (dest.time_end) {
                data.flight.time_end = dest.time_end;
              }
              if (dest.days) {
                data.flight.days = dest.days;
              }
              data.flight.type = "flight"
              return data.flight;
            } catch (error) {
              console.error("Error saving flight", error);
              return null;
            }
          })
        );
        // console.log(placesArray);
        let filtered = placesArray.filter((place) => place !== null);
        console.log("filtered Flights", filtered)
        setFlights(filtered.toSorted((a, b) => a.time_start - b.time_start));
      }
      const fetchThings = async () => {
        const placesArray = await Promise.all(
          item.things.map(async (dest) => {
            try {
              console.log("Looking for thing", dest)
              const response = await fetch(`https://place.harrisowe.me/things-to-do/${dest.place}`);
              const data = await response.json();
              console.log("Thing", data.thingToDo)
              data.thingToDo.time_start = dest.time_start;
              if (dest.time_end) {
                data.thingToDo.time_end = dest.time_end;
              }
              if (dest.days) {
                data.thingToDo.days = dest.days;
              }
              data.thingToDo.type = "thing"
              return data.thingToDo;
            } catch (error) {
              console.error("Error saving thing", error);
              return null;
            }
          })
        );
        // console.log(placesArray);
        let filtered = placesArray.filter((place) => place !== null);
        console.log("filtered Things", filtered)
        setThings(filtered.toSorted((a, b) => a.time_start - b.time_start));
      }

      fetchPlaces();
      fetchHotels();
      fetchFlights();
      fetchThings();
    }, [])
    const deleteItem = async (event) => {
      event.preventDefault();

      fetch("https://auth.harrisowe.me/api/deleteItinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "token": localStorage.token,
          "id": item._id
        })
      }).then((res) => res.json()).then((data) => {
        console.log(data)
        if (data.error) {
          console.error("Failed to delete item")
        } else {
          setSelect()
          setState()
          setRefresh(data)
        }
      })
    }
    const addActivity = async (event) => {
      event.preventDefault();
      const activity = document.getElementById("activity").value;

      fetch("https://auth.harrisowe.me/api/addActivity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "token": localStorage.token,
          "id": item._id,
          "activity": activity
        })
      }).then((res) => res.json()).then((data) => {
        console.log(data)
        if (data.error) {
          console.error("Failed to delete item")
        } else {
          setSelect(data)
        }
      })
    }

    const activities = item.activities.map((item) => {
      return (
        <li>{item.activity}</li>
      )
    })

    const ItineraryMapRender = () => {
      const libraries = ['places'];
      const mapContainerStyle = {
        width: '500px',
        height: '300px',
      };

      const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "",
        libraries,
      });

      console.log(isLoaded, loadError)

      let def_lat = 39.168804
      let def_lng = -86.546659

      if (selected.activities.length > 0) {
        def_lat = selected.activities[0].latitude
        def_lng = selected.activities[0].longitude
      }

      const center = {
        lat: def_lat, // default latitude
        lng: def_lng, // default longitude
      };

      if (!isLoaded) {
        return (
          <div>
            <h1>Loading...</h1>
          </div>
        );
      }

      let markers_activity = selected.activities.map((activity) => {
        return (
          <MarkerF position={{
            "lat": activity.latitude,
            "lng": activity.longitude
          }}
          ></MarkerF>
        )
      })

      let markers_place = places.map((location) => {
        console.log(places)
        return (
          <MarkerF position={{
            "lat": location.latitude,
            "lng": location.longitude
          }}
          ></MarkerF>
        )
      })

      return (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={3}
          >
            <MarkerF position={center} />
            {markers_activity}
            {markers_place}
          </GoogleMap>
        </>
      );
    }

    const commentsRender = item.comments.map((comment) => {
      console.error(comment);
      return (
        <div class="comment">
          <div class="username">
            <b>{comment.username}</b>
          </div>
          <div class="body">
            {comment.body}
          </div>
        </div>
      );
    })



    let locations = [...places];
    locations.push(...flights);
    locations.push(...things);
    locations.push(...hotels);

    console.log("All locations", locations);

    locations.sort((a, b) => a.time_start - b.time_start);

    let placeGroups = {};
    locations.forEach((location, index) => {
      switch (location.type) {
        case 'place':
          if (!placeGroups[location.name]) {
            placeGroups[location.name] = []
          }
          placeGroups[location.name].push(location);
          break;
        case 'hotel':
          if (!placeGroups[location.location.name]) {
            placeGroups[location.location.name] = []
          }
          placeGroups[location.location.name].push(location);
          break;
        case 'flight':
          if (!placeGroups[location.source.name]) {
            placeGroups[location.source.name] = []
          }
          placeGroups[location.source.name].push(location);
          break;
        default:
          if (!placeGroups[location.location.name]) {
            placeGroups[location.location.name] = []
          }
          placeGroups[location.location.name].push(location);
      }
    })

    console.log("Place group", placeGroups)
    
    let locationsRender = []

    function renderListOfLocations(locations) {
      return locations.map((location, index) => {
        switch (location.type) {
          case 'place':
            return <PlaceComponent location={location} index={index} />
          case 'hotel':
            return <HotelComponent hotel={location} index={index}></HotelComponent>
          case 'flight':
            return <FlightComponent flight={location} index={index} />;
          default:
            return <ThingsComponent activity={location} index={index} />;
        }
      })
    }

    for (const name in placeGroups) {
      locations.sort()
      locationsRender.push(
        <>
        <h2>{name}</h2>
        {renderListOfLocations(placeGroups[name].toSorted((a, b) => {
          if (a.type == 'place') {
            return -1;
          }
          return a.time_start - b.time_start;
        }))}
        </>
      )
    }

    console.log("locations render", locationsRender)





    const placesRender = places.map((location, index) => {
      return (
        <PlaceComponent location={location} index={index} />
      )
    })

    const flightsRender = flights.map((flight, index) => {
      console.log("Flight Image", flight.pictureURL, flight.destination);
      return <FlightComponent flight={flight} index={index}></FlightComponent>
    });

    const thingsRender = things.map((activity, index) => {
      return <ThingsComponent activity={activity} index={index} />
    })

    const hotelsRender = hotels.map((hotel, index) => {
      return <HotelComponent hotel={hotel} index={index} />
    })

    const handleSubmit = (event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget);
      console.log(data)
      let dataSend = {
        comment: data.get('body'),
        token: localStorage.token,
        itineraryId: item._id
      };

      console.log(dataSend)

      fetch('https://auth.harrisowe.me/api/addComment', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataSend)
      }).then((res) => res.json())
        .then(data => {
          setSelect(data);
          item = selected;
        })
    }

    const handleTimeChange = () => {
      if (selectedLocation.type == "place") {
        const dataSend = {
          "token": localStorage.token,
          "id": item._id,
          "place": selectedLocation._id
        }
        if (timeStart) dataSend.time_start = timeStart.unix();
        if (timeEnd) dataSend.time_end = timeEnd.unix();
        fetch('https://auth.harrisowe.me/api/updatePlaceTiming', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataSend)
        }).then((res) => res.json())
          .then(data => {
            setSelectedLocation(null);
            setSelect(data);
            item = selected;
          })
      } else {
        const dataSend = {
          "token": localStorage.token,
          "id": item._id,
          "thing_id": selectedLocation._id,
          "type": selectedLocation.type
        }
        if (timeStart) dataSend.time_start = timeStart.unix();
        if (selectedLocation.type == "hotel") {
          dataSend.days = document.getElementById("nights").value || 1
        }
        if (selectedLocation.type == "flight") {
          dataSend.round_trip = document.getElementById("round_trip").checked;
        }
        fetch('https://auth.harrisowe.me/api/updateThingTiming', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataSend)
        }).then((res) => res.json())
          .then(data => {
            setSelectedLocation(null);
            setSelect(data);
            item = selected;
          })
      }

    }

    const handleClose = () => {
      setSelectedLocation(null);
    };


    const handlePlaceRemove = (event) => {
      console.log("deleting")
      if (selectedLocation.type == "place") {

        fetch("https://auth.harrisowe.me/api/deletePlace", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "token": localStorage.token,
            "id": selected._id,
            "place": selectedLocation._id
          })
        }).then((res) => res.json())
          .then((data) => {
            setSelectedLocation(null);
            setSelect(data);
            item = selected;
          })
      } else {
        fetch("https://auth.harrisowe.me/api/deleteThing", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "token": localStorage.token,
            "id": selected._id,
            "thing_id": selectedLocation._id,
            "type": selectedLocation.type
          })
        }).then((res) => res.json())
          .then((data) => {
            setSelectedLocation(null);
            setSelect(data);
            item = selected;
          })
      }
    }

    let locationRender;

    if (selectedLocation) {
      if (selectedLocation.type == "place") {
        locationRender = (
          <div className="modal-backdrop">
            <div className="modal">
              <img src={selectedLocation.pictureURL || EZTravelLogo} alt="Location" style={{ display: "block", width: "300px" }} />
              <h3>{selectedLocation.name}</h3>
              <p>Price: ${selectedLocation.price}</p>
              <p>Rating: {selectedLocation.rating}</p>
              <p>Description: {selectedLocation.description}</p>
              <p>Arrival Time: {dayjs.unix(selectedLocation.time_start).toString()}</p>
              {selectedLocation.time_end ? (
                <>
                  <p>Departure Time: {dayjs.unix(selectedLocation.time_end).toString()}</p>
                  <p>Arrival Time:</p>
                </>
              ) : (<></>)}
              <button onClick={handleClose} className="close-btn">X</button>
              <div>

                <DateTimePicker
                  value={timeStart}
                  onChange={setTimeStart}
                />
              </div>
              <div>
                <p>Departure Time:</p>
                <DateTimePicker
                  value={timeEnd}
                  onChange={setTimeEnd}
                />
              </div>
              <div>
                <Button onClick={handleTimeChange}>Set Times</Button>
              </div>
              <div>
                <Button onClick={handlePlaceRemove}>Remove</Button>
              </div>
            </div>
          </div>
        )
      }
      if (selectedLocation.type == "hotel") {
        locationRender = (
          <div className="modal-backdrop">
            <div className="modal">
              <button onClick={handleClose} className="close-btn">X</button>
              <h3>{selectedLocation.name}</h3>
              <p>{selectedLocation.location.name}, {selectedLocation.location.state}</p>
              <p>Price: ${selectedLocation.price} per night</p>
              <div>
                <DateTimePicker
                  value={timeStart}
                  onChange={setTimeStart}
                />
              </div>
              <div style={{ "marginTop": "1em" }}>
                <label for="nights">Number of Nights:</label>
                <input type="number" id="nights" name="nights" />
              </div>
              <div>
                <Button onClick={handleTimeChange}>Set Times</Button>
              </div>
              <div>
                <Button onClick={handlePlaceRemove}>Remove</Button>
              </div>
            </div>
          </div>
        )
      }
      if (selectedLocation.type == "flight") {
        locationRender = (
          <div className="modal-backdrop">
            <div className="modal">
              <button onClick={handleClose} className="close-btn">X</button>
              <h3>{selectedLocation.airline} {selectedLocation.flightNumber}</h3>
              <p>From: {selectedLocation.source.city}, {selectedLocation.source.country}</p><p>To: {selectedLocation.destination.city}, {selectedLocation.destination.country}</p>
              <p>Price: ${selectedLocation.price} per leg</p>
              <div>
                <DateTimePicker
                  value={timeStart}
                  onChange={setTimeStart}
                />
              </div>
              <div>
                <input type="checkbox" id="round_trip" name="round_trip" />
                <label for="round_trip">Round Trip?</label>
              </div>
              <div>
                <Button onClick={handleTimeChange}>Set Times</Button>
              </div>
              <div>
                <Button onClick={handlePlaceRemove}>Remove</Button>
              </div>
            </div>
          </div>
        )
      }
      if (selectedLocation.type == "thing") {
        locationRender = (
          <div className="modal-backdrop">
            <div className="modal">
              <button onClick={handleClose} className="close-btn">X</button>
              <h3>{selectedLocation.name}</h3>
              <p>{selectedLocation.location.name}, {selectedLocation.location.state}</p>
              <p>Price: ${selectedLocation.price}</p>
              <div>
                <DateTimePicker
                  value={timeStart}
                  onChange={setTimeStart}
                />
              </div>
              <div>
                <Button onClick={handleTimeChange}>Set Times</Button>
              </div>
              <div>
                <Button onClick={handlePlaceRemove}>Remove</Button>
              </div>
            </div>
          </div>
        )
      }
    }


    console.error("Value of checked", checked)




    // Here we will connect with the place db and get the places.
    return (
      <>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <FormControlLabel control={
                <Switch
                  checked={checked}
                  onChange={() => {
                    setChecked(!checked)
                  }}
                ></Switch>
              }
                label="Sort by place"
              />

              <div className="itineraryMapRender">
                <ItineraryMapRender />
              </div>

              {/* <ul>
                {activities}
              </ul>
              <div>
                <TextField
                  margin="normal"
                  id="activity"
                  label="New Activity"
                  name="activity"
                />
                <Button
                  type="add"
                  variant="contained"
                  sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                  style={{ backgroundColor: '#2484BF' }}
                  onClick={addActivity}
                >
                  Add New Item
                </Button>
              </div> */}
              {
                !checked ? (
                  <>
                    {flights.length > 0 ? <h2>Flights:</h2> : ""}
                    <div>
                      {flightsRender}
                    </div>
                    {hotels.length > 0 ? <h2>Hotels:</h2> : ""}
                    <div>
                      {hotelsRender}
                    </div>
                    {things.length > 0 ? <h2>Activities:</h2> : ""}
                    <div>
                      {thingsRender}
                    </div>
                    {(places.length > 0) ? <h2>Places:</h2> : ""}
                    <div>
                      {placesRender}
                    </div>
                  </>
                ) : (
                  <>
                    {locationsRender}
                  </>
                )
              }
              

              <div class="comments">
                {commentsRender}
              </div>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="body"
                  label="Comment"
                  name="body"
                  autoFocus
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                  style={{ backgroundColor: '#2484BF' }}
                >
                  Send Comment
                </Button>
              </Box>

              <Button
                type="delete"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={() => {
                  navigator.clipboard.writeText(`http://${window.location.host}/SharedItinerary?id=${item._id}`)
                }}
              >
                Copy Share Link
              </Button>
              <Button
                type="delete"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={deleteItem}
              >
                Delete
              </Button>
              <Button
                type="delete"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={() => {
                  window.location.href = `/Booking?type=it&id=${item._id}`;
                }}
              >
                Book this Itinerary
              </Button>
              <Button
                type="home"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                style={{ backgroundColor: '#2484BF' }}
                onClick={() => {
                  setSelect()
                  setState()
                  setRefresh(Math.random)
                }}
              >
                Back
              </Button>
            </Box>
            {selectedLocation && locationRender}
            {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
          </Container>
        </ThemeProvider>
      </>
    )

    function PlaceComponent({ index, location }) {
      return (
        <div key={index} className="list-item" onClick={() => {
          setSelectedLocation(location)
          setTimeStart(dayjs.unix(location.time_start));
          if (location.time_end) setTimeEnd(dayjs.unix(location.time_end))
        }}>
          <img src={location.pictureURL || EZTravelLogo} alt="Location" class="itineraryPicture" />
          <div className="list-text">
            <h3>{location.name}</h3>
          </div>
          <div class="list-time">
            <p>Arrival Time:</p>
            <p>{dayjs.unix(location.time_start).format('L')}</p>
            <p>{dayjs.unix(location.time_start).format('LT')}</p>
          </div>

        </div>
      )
    }

    function FlightComponent({ flight, index }) {
      return (
        <div key={index} className="list-item" onClick={() => {
          setSelectedLocation(flight)
          setTimeStart(dayjs.unix(flight.time_start));
          if (flight.time_end) setTimeEnd(dayjs.unix(flight.time_end))
        }}>
          <img src={flight.image || flight.destination.pictureURL} className="itineraryPicture" alt="Flight Image" />
          <div className="list-text">
            <h3>{flight.airline} {flight.flightNumber}</h3>
            <p>From: {flight.source.city}, {flight.source.country}</p><p>To: {flight.destination.city}, {flight.destination.country}</p>
            <p>Price: ${flight.price}</p>
          </div>
          <div class="list-time">
            <p>Arrival Time:</p>
            <p>{dayjs.unix(flight.time_start).format('L')}</p>
            <p>{dayjs.unix(flight.time_start).format('LT')}</p>
          </div>
        </div>
      )
    }

    function ThingsComponent({ activity, index }) {
      return (
        <div key={index} className="list-item" onClick={() => {
          setSelectedLocation(activity)
          setTimeStart(dayjs.unix(activity.time_start));
          if (activity.time_end) setTimeEnd(dayjs.unix(activity.time_end))
        }}>
          <img src={activity.image || EZTravelLogo} alt="Activity" class="itineraryPicture" />
          <div className="list-text">
            <h3>{activity.name}</h3>
            <p>Location: {activity.location.name}</p>
          </div>
          <div class="list-time">
            <p>Arrival Time:</p>
            <p>{dayjs.unix(activity.time_start).format('L')}</p>
            <p>{dayjs.unix(activity.time_start).format('LT')}</p>
          </div>
        </div>
      )
    }

    function HotelComponent({ hotel, index }) {
      return (
        <div key={index} className="list-item" onClick={() => {
          setSelectedLocation(hotel)
          setTimeStart(dayjs.unix(hotel.time_start));
          if (hotel.time_end) setTimeEnd(dayjs.unix(hotel.time_end))
        }}>
          <img src={hotel.pictureURL || EZTravelLogo} alt="Activity" class="itineraryPicture" />
          <div className="list-text">
            <h3>{hotel.name}</h3>
            <p>Location: {hotel.location.name}</p>
            <p>Days Booked: {hotel.days}</p>
          </div>
          <div class="list-time">
            <p>Arrival Time:</p>
            <p>{dayjs.unix(hotel.time_start).format('L')}</p>
            <p>{dayjs.unix(hotel.time_start).format('LT')}</p>
          </div>
        </div>
      )
    }

  }



  const Create = () => {
    const handleSubmit = (event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget);
      console.log(data)
      let item = {
        title: data.get('title'),
        description: data.get('description'),
        startDate: new Date(document.getElementById("start").value),
        endDate: new Date(document.getElementById("end").value),
        token: localStorage.token
      };
      console.log(item)
      fetch("https://auth.harrisowe.me/api/makeItinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
      }).then((res) => res.json()).then((data) => {
        console.log(data)
        if (data.error) {
          console.error("Failed to create item")
        } else {
          setSelect()
          setState()
          setRefresh(data)
        }
      })
    }
    return (
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
            />
            <div>
              <label>Start Date: </label>
              <input id="start" type="date"></input>
            </div>
            <div>
              <label>End Date: </label>
              <input id="end" type="date"></input>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
              style={{ backgroundColor: '#2484BF' }}
            >
              Create
            </Button>
            <Button
              type="home"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
              style={{ backgroundColor: '#2484BF' }}
              onClick={() => {
                setSelect()
                setState()
                setRefresh(Math.random)
              }}
            >
              Back
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    )
  }


  const List = (props) => {
    const items = list.map((item) => {
      return (
        <Button onClick={handleItemClick}
          type="button"
          fullWidth
          variant="contained"
          key={item._id}
          id={item._id}
          sx={{ mt: 3, mb: 2 }}
        >
          {item.title}
        </Button>
      )
    })
    return (
      <div>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h2>Itineraries</h2>
              {items}
              <Button onClick={handleItemClick}
                type="create"
                fullWidth
                variant="contained"
                key="create"
                id="create"
                sx={{ mt: 3, mb: 2 }}
              >
                Create New Itinerary
              </Button>
            </Box>
            {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
          </Container>
        </ThemeProvider>
      </div>
    )
  }

  const Starting = () => {
    return (
      <div>

      </div>
    )
  }

  const Login = () => {
    return (
      <div>
        <h1 style={{fontFamily: '"DM Serif Display", serif',}}>Itinerary</h1>
        <h3 style={{fontFamily: '"DM Serif Display", serif',}}>Please log in</h3>
      </div>
    )
  }

  let render = <Starting></Starting>;
  if (state === "no user") render = <Login></Login>;
  if (state === "logged in") render = <List></List>
  if (state === "item") render = <Itinerary></Itinerary>
  if (state === "create") render = <Create></Create>



  return (
    <div>
      <AppBarComponent />
      {render}
    </div>
  );
}



export default Itinerary;
