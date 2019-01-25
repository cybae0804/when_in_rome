import './reservations.css';
import React, {Component} from 'react';
import axios from 'axios';
import Calendar from '../../shared/calendar/calendar';

class Reservations extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentDate: "",
      version: "",
      originalDates: [],
      dates: []
    }
  } 

  componentDidUpdate(prevProps){
    if((prevProps.data.length === 0 && this.props.data.length !== 0) || (prevProps.asUser !== this.props.asUser)){
      this.setState({
        dates: this.props.data.slice()
      })
    }
  }

  getDate = (date) => {
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()+1}`
  } 

  displayDates = (datesArray, date) => {
    const currentDate = date
    for (let booking of datesArray) {
      let matchingDates = this.getDate(new Date(currentDate)) === this.getDate(new Date(booking.date));
      if (matchingDates && booking.guests) {
        return "booked";
      } else if (matchingDates) {
        debugger;
        if(booking.status){
          return ""
        }
        return "active";
      }
    }
    return "";
  }

  handleDateClicked = (date) => {
    const currentDate = date;
    this.setState({
      currentDate
    }, () => {
      for (let booking of this.state.dates) {
        var version = ""
        let matchingDates = this.getDate(new Date(currentDate)) === this.getDate(new Date(booking.date))
        if (matchingDates && booking.guests){
          version = "booked"
          break;
        }
      }
      const dates = this.toggleAvailableCalendar();
      this.setState({
        version,
        dates,
      })  
    })
  }


  handleConfirmButtonClicked = async () => {
    const {dates} = this.state
    for(let booking of dates){
      booking.date = this.getDate(new Date(booking.date))
    }
    try {
      await axios.post('/api/dates', dates)
      this.setState({
        dates,
        version: ""
      })
    }
    catch (err) {
      console.log('Error Setting new available dates')
    }
  }

  handleClearButtonClicked = () => {
    this.setState({
      dates: [...this.props.data],
      version: ""
    })
  }

  toggleAvailableCalendar = () => {
    let {dates, currentDate } = this.state;
    for (let booking of dates) {
      let matchingDates = this.getDate(new Date (currentDate)) === this.getDate(new Date(booking.date));
      if(matchingDates && !booking.guests) {
        if(booking.status){
          delete booking.status
          return dates
        }
        booking.status = "delete";
        return dates;
      }
    }
    const available = {
      date: currentDate,
      name: "",
      guests: null,
    }
    return [...dates, available];
  }

  viewBookedDetails = () => {
    const {currentDate, dates} = this.state
    for (let booking of dates) {
      let matchingDates = this.getDate(new Date (currentDate)) === this.getDate(new Date(booking.date))
      if (matchingDates && booking.guests){
        return(
          <table className="ui collapsing unstackable table" id="details">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Guests</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.getDate(new Date(booking.date))}</td>
                <td>{booking.name}</td>
                <td>{booking.guests}</td>
              </tr>
            </tbody>
          </table>
        )
      }
    }
  }

  displayDropDown = () => {
    switch (this.state.version){
      case "booked":
        return this.viewBookedDetails()
      default:
        return ""
    }
  }

  calendarVersion = () => {
    const {asUser, data = []} = this.props
    return asUser ? 
    <Calendar
      tileDisabled={({date}) => {
        for (let booking of data) {
          let matchingDates = this.getDate(date) === this.getDate(new Date(booking.date));
          if(matchingDates){
            var disabled = false
            break;
          } else {
            var disabled =  true
          }
        }
          return disabled
      }}
      tileClassName={(date) => this.displayDates(this.state.dates, date.date)}
    /> : 
    <Calendar 
      onChange={ (date) => {
        this.handleDateClicked(date);
      }}
      tileClassName={(date) => this.displayDates(this.state.dates, date.date)}
    />
  }
  render(){  
    return(
      <div className="topMargin24px">
        <h2 className="ui header horizontal divider container">Reservations</h2>
          {this.calendarVersion()}
        <div className="topMargin8px ui container center">
          <div className="ui container horizontal list topMargin">
            <div className="item center">
              <div className="content legend" id="booked"></div>
              <span>Booked</span>
            </div>
            <div className="item center">
              <div className="content legend" id="available"></div>
              <span>Available</span>
            </div>
            <div className="item center">
              <div className="content legend" id="unavailable"></div>
              <span>Unavailable</span>
            </div>
          </div>
          {this.displayDropDown(this.state.currentDate, this.state.dates)}
          {this.props.asUser ? "" :
          <div className="topMargin">
            <button className="ui positive button " onClick={this.handleConfirmButtonClicked}>Confirm</button>
            <button className="ui orange button" onClick={this.handleClearButtonClicked}>Clear</button>
          </div>}
        </div>
      </div>
      
    )
  }
}

export default Reservations;
