function validate() {

        /* This portion of the function checks the Email Address to make sure
        it has an @ and a dot somewhere in the address.
*/
    var eaddr = document.getElementById("contact-form").email.value;
    atSign = eaddr.indexOf("@");
    dotSign = eaddr.lastIndexOf(".");
    if (atSign < 1 || ( dotSign - atSign < 2 )) {
       alert("Error in email address format!")

       return false;
    }
    alert("Accepted, Thank you!")
    return true;
  }
