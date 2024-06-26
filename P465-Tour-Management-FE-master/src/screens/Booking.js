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
import { useSearchParams } from "react-router-dom";
import Grid from '@mui/material/Grid'

export default function Booking() {
    const defaultTheme = createTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [booking, setBooking] = useState();
    const [state, setState] = useState();


    let id = searchParams.get("id");
    let type = searchParams.get("type")

    useEffect(() => {
        if (localStorage.token) {
            if (type == "it" && id) {
                fetch("https://auth.harrisowe.me/api/getItinerary", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.token,
                        "id": id
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        setBooking(data);
                        setState("new");
                    })
            } else if (id) {
                fetch("https://auth.harrisowe.me/api/getBooking", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.token,
                        "bookingID": id
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        setBooking(data);
                        setState("view");
                    })
            } else {
                fetch("https://auth.harrisowe.me/api/getBooking", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.token,
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            setState("error");
                        } else {
                            setBooking(data);
                            setState("view");
                        }
                    })
            }
        } else {
            window.location.href = "/signin"
        }
    }, [])
    let toRender = <><h1>Hello World! Id: {id} Type: {type}</h1><p>{JSON.stringify(booking)}</p></>
    if (state == "new") toRender = <ToBook></ToBook>;
    else if (state == "view") toRender = <ViewBooking></ViewBooking>
    else if (state == "noItems") toRender = <h1>No Items found to book.</h1>
    else if (state == "confirm") toRender = <Confirm></Confirm>
    else if (state == "error") toRender = <Error></Error>
    return (
        <>
            <AppBarComponent></AppBarComponent>
            {toRender}
        </>
    )

    function Error() {
        return (
            <>
                <Container maxWidth="sm">
                    <h1>No Bookings found</h1>
                    <p>You can make a booking by going to an itinerary and selecting create booking.</p>
                </Container>
            </>
        )
    }

    function Confirm() {
        return (
            <>
                <Container maxWidth="md">
                    <h1>Booking Confirmation</h1>
                    <p>Thank you for booking with EZTravel. You should recieve a conformation email and text
                        with details about your booking. Please contact us if you have any questions or concerns
                        about your booking!
                    </p>
                    <Button
                        type="submit"
                        fullWidth
                        style={{ backgroundColor: '#2484BF', color: "white" }}
                        onClick={(event) => {
                            event.preventDefault()
                            // setState("view");
                            window.location.href = `/booking?id=${booking._id}`;
                        }}
                    >
                        See Booking
                    </Button>
                </Container>
            </>
        )
    }

    function ToBook() {
        let item = booking;

        const [places, setPlaces] = useState([])
        const [price, setPrice] = useState(null);
        const [hotels, setHotels] = useState([]);
        const [things, setThings] = useState([]);
        const [flights, setFlights] = useState([])

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
            const fetchPrice = async () => {
                console.log("fetching price")
                const res = await fetch("https://auth.harrisowe.me/api/getBookingPrice", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.token,
                        "itineraryID": item._id
                    })
                })
                const json = await res.json();
                console.log("booking price", json)
                if (json.error) {
                    window.location.href = "/booking"
                } else {
                    if (json > 0) {
                        setPrice(json)
                    } else {
                        setState("noItems");
                    }
                }

            }

            fetchPlaces();
            fetchPrice();
            fetchHotels();
            fetchFlights();
            fetchThings();
        }, [])




        const placesRender = places.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.pictureURL || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Price: ${location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const flightsRender = flights.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.image || location.destination.pictureURL} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.airline} {location.flightNumber}</h3>
                        <p>From: {location.source.city}, {location.source.country}</p><p>To: {location.destination.city}, {location.destination.country}</p>
                        <p>Price: ${location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const hotelsRender = hotels.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.pictureURL || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Location: {location.location.name}</p>
                        <p>Days Booked: {location.days}</p>
                        <p>Price: {location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const thingsRender = things.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.image || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Location: {location.location.name}</p>
                        <p>Price: {location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })



        const handleSubmit = async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            let formData = {
                cardNum: data.get("cardNum"),
                expire: data.get("expire"),
                cvv: data.get("cvv"),
                name: data.get("name")
            }
            let errorBox = document.getElementById("error");
            errorBox.innerText = "";
            console.log(formData)
            if (formData.cardNum.length != 16) {
                errorBox.innerText = "Invalid Card Num"
            } else if (!(formData.expire.length == 5 && formData.expire.charAt(2) == "/")) {
                errorBox.innerText = "Invalid Data format : MM/YY"
            } else if (formData.cvv.length != 3) {
                errorBox.innerText = "Invalid CVV"
            } else if (!formData.name) {
                errorBox.innerText = "Name is necessary"
            } else {
                console.log("Form valid")
                let res = await fetch('https://auth.harrisowe.me/api/makeBooking', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "token": localStorage.token,
                        "itineraryID": item._id
                    })
                });
                let json = await res.json();
                console.log(json)
                setBooking(json);
                setState("confirm")
            }
        }

        return (
            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="lg">
                    <h1>New Booking</h1>
                    <div id="bookingContainer">
                        <div id="cart">
                            <h2>Cart</h2>
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
                        </div>
                        <div id="pricing">
                            <h2>Pricing</h2>
                            {price ?
                                (
                                    <>
                                        <p>Subtotal: ${price}</p>
                                        <p>Taxes: ${(price * 0.07).toFixed(2)}</p>
                                        <p>Fees: ${(price * 0.05).toFixed(2)}</p>
                                        <p>Total: ${(price * 1.12).toFixed(2)}</p>
                                    </>
                                )
                                :
                                (<p>Loading</p>)}
                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="tel"
                                            label="Card Number"
                                            variant="filled"
                                            name="cardNum"
                                        >

                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            type="tel"
                                            label="Expiry date"
                                            variant="filled"
                                            name="expire"
                                        >
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            type="tel"
                                            label="CVV"
                                            variant="filled"
                                            name="cvv"
                                        >
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="tel"
                                            label="Cardholder Full Name"
                                            variant="filled"
                                            name="name"
                                        >
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <p id="error"></p>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            style={{ backgroundColor: '#2484BF', color: "white" }}
                                        >
                                            Submit
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </div>
                    </div>
                </Container>
            </ThemeProvider>
        )
    }

    function ViewBooking() {
        let item = booking;

        const [places, setPlaces] = useState([])
        const [hotels, setHotels] = useState([]);
        const [things, setThings] = useState([]);
        const [flights, setFlights] = useState([])

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

        const placesRender = places.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.pictureURL || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Price: ${location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const flightsRender = flights.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.image || location.destination.pictureURL} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.airline} {location.flightNumber}</h3>
                        <p>From: {location.source.city}, {location.source.country}</p><p>To: {location.destination.city}, {location.destination.country}</p>
                        <p>Price: ${location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const hotelsRender = hotels.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.pictureURL || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Location: {location.location.name}</p>
                        <p>Days Booked: {location.days}</p>
                        <p>Price: {location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        const thingsRender = things.map((location, index) => {
            return (
                <div key={index} className="cart-item">
                    <img src={location.image || EZTravelLogo} alt="Location" class="itineraryPicture" />
                    <div className="cart-text">
                        <h3>{location.name}</h3>
                        <p>Location: {location.location.name}</p>
                        <p>Price: {location.price}</p>
                    </div>
                    <div class="cart-time">
                        <p>{dayjs.unix(location.time_start).format('L')}</p>
                        <p>{dayjs.unix(location.time_start).format('LT')}</p>
                    </div>

                </div>
            )
        })

        return (
            <Container component="main" maxWidth="md">
                <h1>Booking</h1>
                <h2>{item.title}</h2>
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
                <h3>Price</h3>
                <div class="prices">
                    <p>Subtotal: ${item.totalPrice}</p>
                    <p>Taxes: ${(item.totalPrice * 0.07).toFixed(2)}</p>
                    <p>Fees: ${(item.totalPrice * 0.05).toFixed(2)}</p>
                    <p>Total: ${(item.totalPrice * 1.12).toFixed(2)}</p>
                </div>
            </Container>
        )
    }
}