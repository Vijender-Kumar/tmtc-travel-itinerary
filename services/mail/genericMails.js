const genericMails = (type, data) => {
  switch (type) {
    case "sendItinerary":
      return `
        <div>
            Hi ${data.username}, <br><br>
            Your TMTC Travel Itinerary has been created.<br><br>

            <b>Title:</b> ${data.title}<br>
            ${data.destination ? `<b>Destination:</b> ${data.destination}<br>` : ""}
            <b>Start Date:</b> ${data.startDate}<br>
            <b>End Date:</b> ${data.endDate}<br>

            ${
                data.activities && data.activities.length > 0 
                ? `<br><b>Activities:</b><br>
                   <ul>
                       ${data.activities.map(a => `<li>${a}</li>`).join("")}
                   </ul>`
                : ""
            }
            <br>
            Enjoy your trip!!<br><br>

            Regards,<br>
            <b>TMTC Travel Itinerary Pvt Ltd.</b>
        </div>`;
    // For future Reference
    // case "registerUser":
    //   return `<div>Hi ${data.username},<br><br>
    //     Welcome to the TMTC Travel Itinerary.<br>
    //     PFB, the credentials.<br><br>
    //     <label><b>URL : </b></label>${process.env.TMTC_TRAVEL_ITINERARY_DASH_URL}<br>
    //     ${data.email ? `<label><b>email : </b></label>${data.email}<br>` : ""}
    //     <label><b>username : </b></label>${data.username}<br>
    //     <label><b>password : </b></label>${data.userpass}<br><br>
    //     Regards,<br>
    //     TMTC Travel Itinerary Pvt Ltd.</div>`;
    // case "passwordReset":
    //   return `<div>Hi ${data.username},<br><br>
    //     Your password successfully changed.<br>
    //     PFB, the new credentials.<br><br>
    //     <label><b>URL : </b></label>${process.env.TMTC_TRAVEL_ITINERARY_DASH_URL}<br>
    //     ${data.email ? `<label><b>email : </b></label>${data.email}<br>` : ""}
    //     <label><b>username : </b></label>${data.username}<br>
    //     <label><b>password : </b></label>${data.confirmPassword}<br><br>
    //     Regards,<br>
    //     TMTC Travel Itinerary Pvt Ltd.</div>`;
    default:
      break;
  }
};

module.exports = { genericMails };
