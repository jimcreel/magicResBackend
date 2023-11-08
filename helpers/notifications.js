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
    constructor(id, pass, resort, park, date, emails, phones) {
      this.id = id;
      this.pass = pass;
      this.resort = resort;
      this.park = park;
      this.date = date;
      this.emails = emails || [];
      this.phones = phones || [];
    }
  }


async function sendNotifications(availabilities){
  console.log('building notification list')
    const requestList = await getNotificationList();
    // console.log(requestList)
    
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
        bcc: notification.emails,
        resort: notification.resort,
        park: notification.park,
        date: notification.date,
        url: 'https://tinyurl.com/5n8yetcw'
      }
      // console.log(request)
      const result = await sendEmail(request);
      // console.log(result);
    }
    return true;
  }
  }

  async function buildNotifications(matchList) {
    console.log('building notifications')
    const updatedMatchList = [];
  
    for (const match of matchList) {
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
        emails, 
        phones 
      );
  
      console.log(updatedMatch);
      updatedMatchList.push(updatedMatch);
    }
  
    return updatedMatchList;
  }
  
  
  
        


  

  async function getAvailability() {
    try {
        // Dynamically import the JSON data as a module
        const dlrdata = await import('./dlr.json', {
            assert: { type: 'json' }
        });
        
        // Now dlrdata is the module object, and the default export is the actual JSON data
        let dlr = {
            data: dlrdata.default
        };

        return { DLR: dlr.data };
    } catch (error) {
        console.error('Error loading availability data:', error);
        throw error; // Rethrow the error after logging it
    }
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
        let anyTrue = false
        matches.forEach(match =>{
          if (match.slots[0].available === true){
            anyTrue = true
            if (request.available === false){
              newTrueList.push(new Request(pass, resort, park, date, available, request.id))
            }
          }
        });
        if (!anyTrue && request.available === true){
          newFalseList.push(new Request(pass, resort, park, date, available, request.id))
        }
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
   sendNotifications, getAvailability
}
