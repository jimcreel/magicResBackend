// const db = require('../models');
const axios = require('axios');
// const user = require('../models/user');
const { getAllRequests } = require('../models/request');
const env = require("dotenv").config();
// class Request {
//     constructor(pass, resort, park, date, available, _id) {
//       this.pass = pass;
//       this.resort = resort;
//       this.park = park;
//       this.date = date;
//       this.available = available
//       this._id = _id;
//     }
//   }

// class Notification {
//     constructor(pass, resort, park, date, email){
//         this.pass = pass;
//         this.resort = resort;
//         this.park = park;
//         this.date = date;
//         this.email = email;
//     }
// }
  

// async function sendNotifications(){
//     const requestList = await getNotificationList();
//     const availabilities = await getAvailability();
//     // console.log(availabilities)
//     const matchList = await matchRequests(requestList, availabilities);
//     const notificationList = await buildNotifications(matchList);
//     console.log('this is the notification list', notificationList);


// }

// async function buildNotifications(notificationList) {
//     console.log(notificationList)
//     let resultList = [];
//     let userName = ''
//     let userEmail = ''
//     let userPass = ''
//     let userResort = ''
//     let userPark = ''
//     let userDate = ''
//     for (const requestId of notificationList) {
//       try {
//         // Find the user with the matching request ID
//         const user = await db.User.findOne({ 'requests._id': requestId });
  
//         if (user) {
//           // Send the notification to the user (replace this with your notification logic)
//           console.log('Sending notification to user:', user);
//             userName = user.name
//             userEmail = user.email
//             user.requests.forEach(request => {
//                 console.log(request._id, requestId)
//                 if (request._id == requestId) {
//                     userPass = request.pass
//                     userResort = request.resort
//                     userPark = request.park
//                     userDate = request.date
//                     console.log(userPass, userResort, userPark, userDate, userEmail)
//                 }
//             })


//             resultList.push(new Notification(userPass, userResort, userPark, userDate, userEmail))
//             // console.log(resultList)
//                       // Update the request status or perform any other necessary operations
//             await db.User.findOneAndUpdate(
//                 { 'requests._id': requestId },
//                 // increment the request count
//                 { $inc: { 'requests.$.count': 1 } },
//                 { new: true }
//             );
//         } else {
//           console.log('User not found for request ID:', requestId);
//         }
//       } catch (error) {
//         console.error('Error sending notification:', error);
//       }
//     }
//     return resultList;
//   }
  

// async function getAvailability() {
//     let dlr = await axios.get('https://disneyland.disney.go.com/passes/blockout-dates/api/get-availability/?product-types=inspire-key-pass,dream-key-pass,imagine-key-pass,enchant-key-pass,believe-key-pass&destinationId=DLR&numMonths=14')
//     let wdw = await axios.get('https://disneyworld.disney.go.com/passes/blockout-dates/api/get-availability/?product-types=disney-incredi-pass,disney-sorcerer-pass,disney-pirate-pass,disney-pixie-dust-pass&destinationId=WDW&numMonths=14')
//     return {DLR: dlr.data, WDW: wdw.data}
// }
async function getNotificationList() {
    try {
        const requestList = await getAllRequests();
        console.log(requestList)
        requestList.forEach(user => {
            let requests = user.requests;

            requests.forEach(request => {
                const existingRequest = requestList.find(existingRequest =>
                    existingRequest.park === request.park &&
                    existingRequest.date === request.date &&
                    existingRequest.pass === request.pass &&
                    existingRequest.resort === request.resort
                );
                let today = new Date().toLocaleDateString()
                let reqDateString = request.date.replace(/-/g, '/')
                let requestDate = new Date(reqDateString).toLocaleDateString()
                
                if (!existingRequest && requestDate >= today) {
                    requestList.push(new Request(request.pass, request.resort, request.park, request.date, request.available, [request._id]));
                } else if (existingRequest) {
                    existingRequest._id.push(request._id);
                }
            });
        });
        
        return requestList;
    } catch (error) {
        console.error(error);
        // Handle the error
        throw error;
    }
}



  

// // match requestList to availabilities 
// // if there is a match, send a notification to each user in the requestList
// async function matchRequests(requests, availabilities) {
//     let newTrueList = [];
//     let newFalseList = [];
  
//     for (const request of requests) {
//     //   console.log(request._id);
//       const pass = request.pass;
//       const date = request.date;
//       const park = request.park;
//       const resort = request.resort;
//       const available = request.available;
  
//       const passAvail = availabilities[resort].find(avail => avail.passType === pass);
//       const passAvailDates = passAvail.availabilities;
//       const matches = passAvailDates.filter(avail => avail.date === date);
  
//       if (request.park === 'ANY') {
//         matches.find(match => {
//           if (match.slots.available === true) {
//             // console.log(match);
//           }
//         });
//       } else {
//         matches.find(match => {
//           if (match.facilityId === `${resort}_${park}`) {
//             // console.log(match.slots[0].available, available);
//             if (match.slots[0].available !== available) {
//               // add request to update list
//               match.slots[0].available === true ? newTrueList.push(...request._id) : newFalseList.push(...request._id);
//             }
//           }
//         });
//       }
//     }
  
    
    
//     // await db.User.updateMany(
//     //     { requests: { $elemMatch: { _id: { $in: newTrueList } } } },
//     //     { $set: { 'requests.$.available': true } }
//     // );
//     // await db.User.updateMany(
//     //     { requests: { $elemMatch: { _id: { $in: newFalseList } } } },
//     //     { $set: { 'requests.$.available': false } }
//     // );

//     return newTrueList
    
//   }
  
  getNotificationList();


module.exports = {
   getNotificationList
}
