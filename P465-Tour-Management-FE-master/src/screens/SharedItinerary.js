import { useSearchParams } from "react-router-dom";
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
import { FormControlLabel } from "@mui/material";
import { Switch } from "@mui/material";

function SharedItinerary() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [itinerary, updateItinerary] = useState(null);
    const [refresh, setRefresh] = useState();
    const [selected, setSelect] = useState();

    const defaultTheme = createTheme();

    let id = searchParams.get("id");
    useEffect(() => {
        if (id) {
            console.log("Im fetching");
            fetch("https://auth.harrisowe.me/api/getSharedItinerary/" + id)
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    updateItinerary(data)
                })
        } else {
            console.log("No ID Found")
        }
    }, [])

    const Itinerary = ({ item }) => {

        const [places, setPlaces] = useState([])
        const [hotels, setHotels] = useState([]);
        const [things, setThings] = useState([]);
        const [flights, setFlights] = useState([])
        const [selectedLocation, setSelectedLocation] = useState(null);
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


        const activities = item.activities.map((item) => {
            return (
                <li>{item}</li>
            )
        })

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

        const handleClose = () => {
            setSelectedLocation(null);
        };

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
                    window.location.reload()
                })
        }

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
                                {localStorage.token ? (
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                                        style={{ backgroundColor: '#2484BF' }}
                                    >
                                        Send Comment
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled
                                        sx={{ mt: 3, mb: 2, backgroundColor: '#2484BF' }}
                                        style={{ backgroundColor: '#2484BF' }}
                                    >
                                        Send Comment
                                    </Button>
                                )}
                            </Box>
                        </Box>
                        {selectedLocation && (
                            <div className="modal-backdrop">
                                <div className="modal">
                                    <img src={selectedLocation.pictureURL || EZTravelLogo} alt="Location" style={{ display: "block", width: "300px" }} />
                                    <h3>{selectedLocation.name}</h3>
                                    <p>Price: ${selectedLocation.price}</p>
                                    <p>Rating: {selectedLocation.rating}</p>
                                    <p>Description: {selectedLocation.description}</p>
                                    <button onClick={handleClose} className="close-btn">X</button>
                                </div>
                            </div>

                        )}
                        {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
                    </Container>
                </ThemeProvider>
            </>
        )


        function PlaceComponent({ index, location }) {
            return (
                <div key={index} className="list-item">
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
                <div key={index} className="list-item">
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
                <div key={index} className="list-item">
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
                <div key={index} className="list-item">
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

    var toRender = (
        <h1>404 Page Not Found</h1>
    )
    if (id && !itinerary) {
        toRender = (
            <>
                <h1>Itinerary</h1>
            </>
        )
    } else if (id && itinerary) {
        toRender = <Itinerary item={itinerary}></Itinerary>
    }

    return (
        <>
            <AppBarComponent></AppBarComponent>
            {toRender}
        </>
    )


}



export default SharedItinerary;