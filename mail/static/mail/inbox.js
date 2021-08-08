document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function submit_email(event) {

  // Get form data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send form data to API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  // Redirect to sent view
  load_mailbox('sent');
};


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails contained within that mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails to console
    console.log(emails);

    // Loop through JSON response and append to the emails view container
    for (let i = 0; i < emails.length; i++) {
      if (mailbox === 'inbox' || mailbox === 'archive') {
        if (emails[i].read === true) { 
          document.querySelector('#emails-view').innerHTML += `<div data-emailid='${emails[i].id}' class='emails' onclick='view_email(${emails[i].id})' style='background-color: lightgrey;'><p class='email-content'><b>"${emails[i].subject}"</b> from ${emails[i].sender} at ${emails[i].timestamp}</p></div>`;
        } else {
          document.querySelector('#emails-view').innerHTML += `<div data-emailid='${emails[i].id}' class='emails' onclick='view_email(${emails[i].id})' style='background-color: white;'><p class='email-content'><b>"${emails[i].subject}"</b> from ${emails[i].sender} at ${emails[i].timestamp}</p></div>`;
        }
      } else {
        document.querySelector('#emails-view').innerHTML += `<div class='emails'><p class='email-content' onclick='view_email(${emails[i].id})'><b>"${emails[i].subject}"</b> to ${emails[i].recipients} at ${emails[i].timestamp}</p></div>`;
      }
    };

  });

}


function view_email(emailid) {

  // Clear the container
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  // Fetch the email
  fetch(`emails/${emailid}`)
  .then(response => response.json())
  .then(email => {

    // Get data from JSON format and manipulate DOM to display the data
    document.querySelector('#subject').innerHTML = `<b>Subject:</b> ${email.subject}<br>`;
    document.querySelector('#sender').innerHTML = `<b>From:</b> ${email.sender}<br>`;
    document.querySelector('#recipient').innerHTML = `<b>To:</b> ${email.recipients}<br>`;
    document.querySelector('#timestamp').innerHTML = `<b>At:</b> ${email.timestamp}<br>`;
    document.querySelector('#body').value = email.body;

    // Add archive or unarchive button if necessary
    if (email.sender !== document.querySelector('#user').innerHTML) {
      if (email.archived === false) {
        document.querySelector('#archive-button').dataset.emailid = email.id;
        document.querySelector('#unarchive-button').style.display = 'none';
        document.querySelector('#archive-button').style.display = 'block';
        //document.querySelector('#archive-button').addEventListener('onclick', archive_email(email.id));
        //document.querySelector('#archive-button').click = archive_email(email.id);
      } else {
        document.querySelector('#unarchive-button').dataset.emailid = email.id;
        document.querySelector('#archive-button').style.display = 'none';
        document.querySelector('#unarchive-button').style.display = 'block';
        //document.querySelector('#unarchive-button').addEventListener('onclick', unarchive_email(email.id));
        //document.querySelector('#unarchive-button').click = unarchive_email(email.id);
      };
    };

    // Mark email as read
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

  });

};


function archive_email(event) {
  const emailid = event.target.dataset.emailid;
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })

  load_mailbox('inbox');
}


function unarchive_email(event) {
  const emailid = event.target.dataset.emailid;
  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })

  load_mailbox('inbox');
}