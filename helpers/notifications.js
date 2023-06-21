const db = require('../models');
const axios = require('axios');
const user = require('../models/user');
const { getAllRequests, updateAvailability, getRequestUsers } = require('../models/request');
const env = require("dotenv").config();

class Request {
    constructor(pass, resort, park, date, available, _id) {
      this.pass = pass;
      this.resort = resort;
      this.park = park;
      this.date = date;
      this.available = available
      this._id = _id;
    }
  }

  class Notification {
    constructor(pass, resort, park, date, emails, phones){
        this.pass = pass;
        this.resort = resort;
        this.park = park;
        this.date = date;
        this.emails = emails || [];
        this.phones = phones || [];
    }
}

let notificationList = []; 

async function sendNotifications(){
    const requestList = await getNotificationList();
    const availabilities = await getAvailability();
    // console.log(availabilities)
    const matchList = await matchRequests(requestList, availabilities);
    console.log('this is the match list', matchList);
    const notificationList = await buildNotifications(matchList);
    console.log('this is the notification list', notificationList);


}


  

async function getAvailability() {
    let dlr = await axios.get('https://disneyland.disney.go.com/passes/blockout-dates/api/get-availability/?product-types=inspire-key-pass,dream-key-pass,imagine-key-pass,enchant-key-pass,believe-key-pass&destinationId=DLR&numMonths=14')
    let wdw = await axios.get('https://disneyworld.disney.go.com/passes/blockout-dates/api/get-availability/?product-types=disney-incredi-pass,disney-sorcerer-pass,disney-pirate-pass,disney-pixie-dust-pass&destinationId=WDW&numMonths=14')
    return {DLR: dlr.data, WDW: wdw.data}
}

async function getNotificationList() {
    try {
        const requestList = await getAllRequests();
        return requestList.rows;
    } catch (error) {
        console.error(error);
        // Handle the error
        throw error;
    }
}



  

// match requestList to availabilities 
// if there is a match, send a notification to each user in the requestList
async function matchRequests(requests, availabilities) {
    let newTrueList = [];
    let newFalseList = [];
  
    for (const request of requests) {
    //   console.log(request._id);
      const pass = request.pass;
      const date = request.date;
      const park = request.park;
      const resort = request.resort;
      const available = request.available;

      console.log(pass, date, park, resort, available)
  
      const passAvail = availabilities[resort].find(avail => avail.passType === pass);
      const passAvailDates = passAvail.availabilities;
      const matches = passAvailDates.filter(avail => avail.date === date);
  
      if (request.park === 'ANY') {
        matches.find(match => {
          if (match.slots.available === true) {
            const existingTrue = newTrueList.find((request) => request.id === match.id)
            if (!existingTrue){
                newTrueList.push()
            }
          }
        });
      } else {
        matches.find(match => {
          if (match.facilityId === `${resort}_${park}`) {
            // console.log(match.slots[0].available, available);
            if (match.slots[0].available !== available) {
              // add request to update list
              match.slots[0].available === true ? newTrueList.push(new Notification(pass, resort, park, date, request.emails, request.phones)) : newFalseList.push(request.id);
            }
          }
        });
      }
    }
    console.log('new true list', newTrueList)
    console.log('new false list', newFalseList)
    

    // await db.User.updateMany(
    //     { requests: { $elemMatch: { _id: { $in: newTrueList } } } },
    //     { $set: { 'requests.$.available': true } }
    // );
    // await db.User.updateMany(
    //     { requests: { $elemMatch: { _id: { $in: newFalseList } } } },
    //     { $set: { 'requests.$.available': false } }
    // );

    return newTrueList
    
}
  



module.exports = {
   sendNotifications
}
