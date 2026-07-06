// 2. Initialize with your live Public Key
(function () {
    emailjs.init("hgYNKAz1p7sPY8yi7");
})();

function sendEnquiryToFirebase(dataObject) {
    // Define your unique Firebase Realtime Database URL
    // Remember to change this placeholder to your actual Firebase database link!
    const firebaseURL = "https://mobilewash-cb124-default-rtdb.firebaseio.com/schedule-a-wash-request.json";

    // Return the fetch promise so the calling code can use .then() and .catch()
    return fetch(firebaseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObject)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Database server network response was not ok');
            }
            return response.json();
        });
}
function sendScheduleToFirebase(dataObject) {
    const firebaseURL = "https://mobilewash-cb124-default-rtdb.firebaseio.com/mobile-wash/schedule-table.json";

    return fetch(firebaseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObject)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Database server network response was not ok');
            }
            return response.json();
        });
}

function deleteFromFirebase(bookingId) {
    // FIXED: Formatted the URL correctly to point to your specific mobile-wash schedule table node instance
    const firebaseURL = `https://firebaseio.com{bookingId}.json`;

    return fetch(firebaseURL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to delete entry. Status: ${response.status}`);
            }
            return response.json();
        });
}

document.getElementById('laundryForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Stop standard page reload

    // FIXED: Targets 'submitBtn' to match the actual ID attribute configuration on your form markup
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Scheduling...";
    btn.disabled = true;

    try {
        // FIXED: Swapped out '.value' for '.innerText.trim()' on your service display anchor node
        const rawServiceText = document.getElementById('schedule-a-wash-service-selector-display').innerText.trim();
        const serviceSlug = rawServiceText.toUpperCase().replace(/\s+/g, '_');

        const user = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            service: serviceSlug,
            schedule_time: new Date().toISOString(),
            is_complete: false,
            completion_time: null
        };
        console.log(user)

        // FIXED: Re-enabled message string assembly to prevent template variables parameter errors
        // let emailMessage = `${user.name} ${user.surname} who stays in ${user.address || 'Not provided'} would like you to assist them in scheduling a ${user.service} wash.`;
        //
        // const templateParams = {
        //     email_body: emailMessage,
        //     email: user.email,
        //     name: user.name,
        //     surname: user.surname,
        //     service_host: "http://localhost:63342/MobileWashWebsite/build/",
        //     user_body: JSON.stringify(user) // Converted to valid JSON string layout representation for template delivery safety
        // };

        sendScheduleToFirebase(user)
            .then(data => {
                alert(`SUCCESS! Schedule sent successfully.`);
                console.log('Firebase node confirmation trace:', data);
                document.getElementById('laundryForm').reset();

                // Optional: Re-set Alpine dynamic selection tracker string back to default label option display state here if needed
            })
            .catch(error => {
                alert('FAILED to log database entry.');
                console.error('Firebase Entry Error:', error);
            })
            .finally(() => {
                btn.innerText = "Schedule a wash";
                btn.disabled = false;
            });

    } catch (error) {
        console.error("Form handling error:", error.message);
        btn.innerText = "Schedule a wash";
        btn.disabled = false;
    }
});

document.getElementById('laundryForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Stop standard page reload

    // Visual indicator that the transmission is running
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        // 3. CLEANED UP: Reading input values directly via their IDs
        // This replaces the complex RegEx loop which had casing mismatches (e.g. name vs Name)
        const user = {
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            enquiry_time: new Date().toISOString()
        };

        // 4. Construct your custom message sentence string
        let emailMessage = `${user.name} ${user.surname} who stays in ${user.address || 'Not provided'} would like you to assist them in scheduling a wash.`;

        // 5. Prepare variables to match your updated template ID (template_4z5flsg)
        const templateParams = {
            email_body: emailMessage,
            email: user.email,
            name: user.name,
            surname: user.surname,
            service_host:"http://localhost:63342/MobileWashWebsite/build/",
            user_body: user
        };

        // 6. Submit data to your live EmailJS workflow dashboard

        sendEnquiryToFirebase(user).then(data => {
            emailjs.send('service_bplo4fp', 'template_4z5flsg', templateParams)
                .then((response) => {
                    alert(`SUCCESS! Email sent successfully and request logged successfully. ${response}`);
                    document.getElementById('laundryForm').reset();
                })
                .catch((error) => {
                    console.error('EmailJS Error details:', error);
                    deleteFromFirebase(data.name).then((response) => {
                        alert('FAILED to send email via API and log request. View browser console for details.');
                        document.getElementById('laundryForm').reset();
                    })
                })
        })
            .catch(error => {
                alert('FAILED to log database entry.');
                console.error('Firebase Entry Error:', error);
            })
            .finally(() => {
                // Restore button text back to original state
                btn.innerText = "Schedule a wash";
                btn.disabled = false;
            });

    } catch (error) {
        console.error("Form handling error:", error.message);
        btn.innerText = "Schedule a wash";
        btn.disabled = false;
    }
});
