import React, { useState , useEffect} from 'react';
import AppBarComponent from '../util/AppBarComponent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import { Checkbox, ListItemText } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GuidedMuseumImage from '../images/Activities/guided-museum-tour.jpg';
import FamilyFunParkImage from '../images/Activities/family-fun-park-day.jpg';
import MountainBikingAdventureImage from '../images/Activities/mountain-biking-adventure.jpg';
import SunsetKayakingImage from '../images/Activities/sunset-kayaking.jpg';
import WhaleWatchingImage from '../images/Activities/whale-watching.jpg';
import AddIcon from "@mui/icons-material/Add"
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function Activities () {
  const [activityTypes, setActivityTypes] = useState([]);
  const [classType, setClassType] = useState('');
  const [guests, setGuests] = useState(1);
  const [activityDate, setActivityDate] = useState('');
  const [timeOfday, setTimeOfDay] = useState('');
  const [location, setLocation] = useState('');
  const [tripType, setTripType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [value, setValue] = useState(dayjs())
  const [itineraries, setIt] = useState(null)

  // Options that will be available in our dropdown menu
  const types = ["Art and culture", "Kid friendly", "Nature and outdoors", "Sports" ];

  // Handle change for the selected type or types
  const handleActivityTypeOptionChange = (event) => {
    const value = event.target.value;
    setActivityTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

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

  useEffect(() => {
    fetch('https://place.harrisowe.me/activities')
      .then(response => response.json())
      .then(data => {
        setActivities(data.activities);
        setFilteredActivities(data.activities); // Set filteredActivities initially to all activities
      })
      .catch(error => console.log('Error fetching activities:', error));
  }, []);
  


  const handleSearch = () => {
    // Implementing search logic
    const results = activities.filter(activity => {
      const byLocation = location ? activity.location.city.toLowerCase().includes(location.toLowerCase()) : true;
      const byType = activityTypes.length ? activityTypes.some(type => activity.type.includes(type)) : true;
      const byClassType = classType ? activity.classType.toLowerCase() === classType : true;
      const byDate = activityDate ? activity.date === activityDate : true;
    
      return byLocation && byType && byClassType && byDate;
    });

    setFilteredActivities(results);
  };


  const toggleFavorite = (index) => {
    // Toggle the favorite status of a activity
    const newActivities = activities.map((activity, idx) =>
      idx === index ? { ...activity, isFavorited: !activity.isFavorited } : activity
    );
    setActivities(newActivities);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppBarComponent />
      <Container maxWidth="xl">
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '64px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '0 auto' }}>
          <FormControl variant="outlined" style={{ minWidth: '200px' }}>
            <InputLabel id="activity-types-options">Type of activities</InputLabel>
            <Select labelId="activity-types-options" id="activity-types-select" multiple value={activityTypes} onChange={handleActivityTypeOptionChange} renderValue={(selected) => selected.join(', ')}>
              {types.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={activityTypes.indexOf(option) > -1} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: '200px' }}>
            <InputLabel>Price of activity</InputLabel>
            <Select value={classType} onChange={(e) => setClassType(e.target.value)} label="Price of activity">
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="cheap">Cheap ($1 - $10)</MenuItem>
              <MenuItem value="moderate">Moderate ($10 - $50)</MenuItem>
              <MenuItem value="expensive">Expensive (greater than $50)</MenuItem>
            </Select>
          </FormControl>
          {/* <FormControl variant="outlined" style={{ minWidth: '200px' }}>
            <InputLabel>Time of day</InputLabel>
            <Select value={timeOfday} onChange={(e) => setTimeOfDay(e.target.value)} label="Time of day">
              <MenuItem value="morning">Morning (Start before 12pm)</MenuItem>
              <MenuItem value="afternoon">Afternoon (Start after 12pm)</MenuItem>
              <MenuItem value="evening">Evening (Start after 5pm)</MenuItem>
            </Select>
          </FormControl> */}
        </div>
        <div style={{ display: 'flex', gap: '10px', rowGap: '50px', margin: '0 auto' }}>
          <TextField fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} variant="outlined" style={{ marginLeft: '10px', maxWidth: '500px' }} />
          <TextField
            type="date"
            label="Date of activity"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ width: '25%', minWidth: '400px', height: '20px' }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginTop: '20px', maxWidth: '150px', minHeight: '20px', backgroundColor: '#2484BF' }}>
            Search
          </Button>
        </div>
      </div>
      <h2>{location ? `${location} ${tripType.charAt(0).toUpperCase() + tripType.slice(1)}` : 'All Activities'}</h2>
      <p>{filteredActivities.length} activities</p>
      {filteredActivities.length > 0 && (
        <div className="grid-container">
          {filteredActivities.map((activity, index) => (
            <div key={index} className="grid-item">
              <img src={activity.image} alt="Activity" style={{ width: '150px', height: '100px', objectFit: 'cover' }} />
              <div className="grid-text">
                <h3>{activity.name}</h3>
                <p>Activity Type: {activity.type}</p>
                <p>Location: {activity.location.name}</p>
                <p>Start Time: {activity.startTime} Duration: {activity.duration}</p>
                <button onClick={() => toggleFavorite(index)} className="grid-favorite-btn">
                  {activity.isFavorited ? <FavoriteIcon style={{ color: '#F25C5C' }} /> : <FavoriteBorderIcon style={{ color: 'black' }} />}
                </button>
                <button onClick={(event) => addToItinerary(event, activity)} className="grid-add-btn">
                    {activity.isFavorited ? <AddIcon style={{ color: '#F25C5C' }} /> : <AddIcon style={{ color: 'black' }} />}
                </button>
                <p>Class: {activity.classType}</p>
                <h3>Price: ${activity.price}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

{selectedLocation && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>{selectedLocation.name}</h2>
              <button onClick={() => { setSelectedLocation(null) }} className="close-btn">X</button>
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
                    fetch("https://auth.harrisowe.me/api/addThing", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        "token": localStorage.token,
                        "id": it._id,
                        "type": "thing",
                        "thing_id": selectedLocation._id,
                        "time_start": value.unix()
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

export default Activities;