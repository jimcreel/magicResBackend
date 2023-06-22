const db = require('../models');
const axios = require('axios');
const user = require('../models/user');
const { getAllRequests, toggleAvailability, getRequestUsers } = require('../models/request');
const env = require("dotenv").config();
const sendEmail = require('./email');

class Request {
    constructor(pass, resort, park, date, available, id) {
      this.pass = pass;
      this.resort = resort;
      this.park = park;
      this.date = date;
      this.available = available
      this.id = id;
    }
  }

  class Notification {
    constructor(id, pass, resort, park, date, emails, phones){
        this.id = id;
        this.pass = pass;
        this.resort = resort;
        this.park = park;
        this.date = date;
        this.emails = emails || [];
        this.phones = phones || [];
    }
}



async function sendNotifications(){
  console.log('building notification list')
    const requestList = await getNotificationList();
    // console.log(requestList)
    const availabilities = await getAvailability();
    // console.log(availabilities)
    const matchList = await matchRequests(requestList, availabilities);
    // console.log('this is the match list', matchList);

    if (matchList && matchList.length > 0){
      const notificationList = await buildNotifications(matchList);
      console.log('notification list built');
      const sentList = await sendNots(notificationList);
    } else {
      console.log('no notifications to send')
    }
    console.log('finished')

}

async function sendNots(notificationList) {
    console.log('sending notifications')
    for (const notification of notificationList) {
      if (notification.emails.length > 0 || notification.phones.length > 0) {
      const request = {
        type: 'notification',
        bcc: notification.phones,
        resort: notification.resort,
        park: notification.park,
        date: notification.date,
        url: 'https://tinyurl.com/5n8yetcw'
      }
      console.log(request)
      const result = await sendEmail(request);
      console.log(result);
    }
    return true;
  }
  }

async function buildNotifications(matchList) {
    console.log('building notifications')
    const updatedMatchList = [];
    // console.log(matchList)
    for (const match of matchList) {
      // console.log(match);
      const requestId = match.id;
      const result = await getRequestUsers(requestId);
      const emails = result.map(user => user.email);
      const phones = result.map(user => user.phone);
  
      const updatedMatch = new Notification(
        match.id,
        match.pass,
        match.resort,
        match.park,
        match.date,
        match.emails, emails,
        match.phones, phones
      );
        console.log(updatedMatch)
      updatedMatchList.push(updatedMatch);
    }
  
    return updatedMatchList;
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

    //   console.log(pass, date, park, resort, available)
  
      const passAvail = availabilities[resort].find(avail => avail.passType === pass);
      const passAvailDates = passAvail.availabilities;
      const matches = passAvailDates.filter(avail => avail.date === date);
  
      if (request.park === 'ANY') {
        matches.find(match => {
          // console.log(match)
          if (match.slots.some(slot => slot === true)) {
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
            if (match.slots[0].available != request.available){
                match.slots[0].available === true? newTrueList.push(new Request(pass, resort, park, date, available, request.id)): newFalseList.push(new Request(pass, resort, park, date, available, request.id))
            }
          }
        });
      }
    }
    // console.log(newTrueList)
    // console.log(newFalseList)
    // flatlist the two lists into one
    const flatList = newTrueList.concat(newFalseList)
    toggleAvailability(flatList)
// 
    // console.log('new true list', newTrueList)
    // console.log('new false list', newFalseList)
    

    // await db.User.updateMany(
    //     { requests: { $elemMatch: { _id: { $in: newTrueList } } } },
    //     { $set: { 'requests.$.available': true } }
    // );
    // await db.User.updateMany(
    //     { requests: { $elemMatch: { _id: { $in: newFalseList } } } },
    //     { $set: { 'requests.$.available': false } }
    // );
    // console.log('new true list', newTrueList)
    return newTrueList;
    
}
  



module.exports = {
   sendNotifications
}
